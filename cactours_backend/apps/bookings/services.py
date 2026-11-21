"""
Servicios de dominio de Reservas (`apps.bookings.services`).
Corrige los problemas de lógica de negocio del proyecto anterior:
1. Calcula el precio total estrictamente en el servidor con aritmética `Decimal` exacta.
2. Incluye las opciones adicionales (`OpcionTour`) en el cálculo en servidor.
3. Valida cupos máximos del tour, estado publicado y fechas válidas.
4. Elimina la duplicación entre `Reserva`, `ReservaUsuario` y `Viaje`.
"""
from datetime import date, datetime
from decimal import Decimal
from django.db import transaction
from django.db.models import F, QuerySet
from django.utils import timezone
from apps.accounts.models import Cliente, Persona
from apps.common.http import DomainError
from apps.tours.models import OpcionTour, TourSalida
from apps.tours.services import TourCatalogService
from .models import CambioEstadoReserva, EstadoReserva, MedioPagoPreferido, Reserva, ReservaOpcion


class BookingService:
    """Reglas de negocio para cotizar, crear, consultar y gestionar reservas."""

    @staticmethod
    def cotizar_reserva(
        *,
        tour_id: int,
        cant_personas: int,
        opciones_ids: list[int] | None = None,
    ) -> dict:
        """
        Calcula de forma determinista el precio base, adiciones y costo total en servidor.
        """
        tour = TourCatalogService.obtener_tour_publicado(tour_id)

        try:
            personas = int(cant_personas)
        except (ValueError, TypeError) as exc:
            raise DomainError("El número de personas debe ser un entero válido.") from exc

        if personas < 1:
            raise DomainError("El número de personas debe ser al menos 1.")
        if personas > tour.cupo_maximo:
            raise DomainError(
                f"La cantidad solicitada ({personas}) supera el cupo máximo del tour ({tour.cupo_maximo})."
            )

        subtotal_base = (tour.costo * Decimal(personas)).quantize(Decimal("0.01"))
        subtotal_opciones = Decimal("0.00")
        desglose_opciones = []

        if opciones_ids:
            ids_limpios = list({
                int(op_id)
                for op_id in opciones_ids
                if str(op_id).lstrip("-").isdigit() and int(op_id) > 0
            })
            if len(ids_limpios) != len(opciones_ids):
                raise DomainError("Las opciones adicionales deben enviarse mediante identificadores válidos.")
            opciones_qs = OpcionTour.objects.filter(id__in=ids_limpios, activa=True)
            if opciones_qs.count() != len(ids_limpios):
                raise DomainError("Una o más opciones adicionales seleccionadas no son válidas o están inactivas.")

            opciones_del_tour = set(tour.opciones.values_list("id", flat=True))
            for opcion in opciones_qs:
                if opcion.id not in opciones_del_tour:
                    raise DomainError(
                        f"La opción '{opcion.nombre_op}' no aplica para el tour '{tour.nombre_tour}'."
                    )
                multiplicador = Decimal(personas) if opcion.cobro_por_persona else Decimal(1)
                sub_op = (opcion.precio_adic * multiplicador).quantize(Decimal("0.01"))
                subtotal_opciones += sub_op
                desglose_opciones.append(
                    {
                        "opcion": opcion,
                        "precio_unitario": opcion.precio_adic,
                        "subtotal": sub_op,
                    }
                )

        costo_total = (subtotal_base + subtotal_opciones).quantize(Decimal("0.01"))
        return {
            "tour": tour,
            "cant_personas": personas,
            "subtotal_base": subtotal_base,
            "subtotal_opciones": subtotal_opciones,
            "costo_total": costo_total,
            "desglose_opciones": desglose_opciones,
        }

    @staticmethod
    def _parse_fecha(fecha_raw) -> date:
        if not fecha_raw:
            return timezone.localdate()
        if isinstance(fecha_raw, date):
            fecha_obj = fecha_raw
        else:
            try:
                fecha_obj = datetime.strptime(str(fecha_raw), "%Y-%m-%d").date()
            except ValueError as exc:
                raise DomainError("Formato de fecha inválido. Usa YYYY-MM-DD.") from exc

        if fecha_obj < timezone.localdate():
            raise DomainError("La fecha del tour no puede estar en el pasado.")
        return fecha_obj

    @staticmethod
    def _normalizar_medio_pago(medio_raw: str) -> str:
        valor = (medio_raw or "").strip().upper()
        valores_validos = {choice[0] for choice in MedioPagoPreferido.choices}
        if valor not in valores_validos:
            raise DomainError(
                f"Medio de pago '{medio_raw}' no válido. Opciones: {', '.join(sorted(valores_validos))}."
            )
        return valor

    @staticmethod
    @transaction.atomic
    def crear_solicitud_reserva(
        *,
        user,
        tour_id: int,
        lugar_salida: str,
        cant_personas: int,
        medio_pago: str,
        fecha=None,
        opciones_ids: list[int] | None = None,
        comentarios: str = "",
    ) -> Reserva:
        """
        Registra una nueva solicitud de reserva validando reglas de negocio en servidor.
        """
        lugar_salida = (lugar_salida or "").strip()
        if not lugar_salida:
            raise DomainError("El lugar de salida es obligatorio.")

        medio_normalizado = BookingService._normalizar_medio_pago(medio_pago)
        fecha_tour = BookingService._parse_fecha(fecha)
        cotizacion = BookingService.cotizar_reserva(
            tour_id=tour_id,
            cant_personas=cant_personas,
            opciones_ids=opciones_ids,
        )

        persona = Persona.objects.filter(user=user).first()
        if not persona:
            persona = Persona.objects.create(
                user=user,
                nombre=user.first_name or user.username,
                apellido=user.last_name or "Usuario",
                identificacion=f"USR-{user.id}",
                correo=user.email or f"{user.username}@cactours.local",
                telefono="0000000000",
            )
        cliente, _ = Cliente.objects.get_or_create(persona=persona)

        tour = cotizacion["tour"]
        salida = (
            TourSalida.objects.select_for_update()
            .filter(tour=tour, fecha=fecha_tour, activa=True)
            .first()
        )
        if salida:
            if cotizacion["cant_personas"] > salida.cupo_disponible:
                raise DomainError(
                    f"No hay cupo suficiente para esta salida. Cupo disponible: {salida.cupo_disponible}.",
                    status_code=409,
                )
        reserva = Reserva.objects.create(
            cliente=cliente,
            tour=tour,
            salida=salida,
            lugar_salida=lugar_salida,
            destino=tour.ciudad_destino,
            fecha=fecha_tour,
            hora=timezone.localtime().time(),
            cant_personas=cotizacion["cant_personas"],
            medio_pago=medio_normalizado,
            estado=EstadoReserva.PENDIENTE,
            subtotal_base=cotizacion["subtotal_base"],
            subtotal_opciones=cotizacion["subtotal_opciones"],
            costo_total=cotizacion["costo_total"],
            comentarios=(comentarios or "").strip(),
        )

        for item in cotizacion["desglose_opciones"]:
            opcion = item["opcion"]
            ReservaOpcion.objects.create(
                reserva=reserva,
                opcion=opcion,
                nombre_opcion=opcion.nombre_op,
                precio_unitario=item["precio_unitario"],
                subtotal=item["subtotal"],
            )

        Cliente.objects.filter(pk=cliente.pk).update(contador_reservas=F("contador_reservas") + 1)
        if salida:
            salida.cupo_disponible -= cotizacion["cant_personas"]
            salida.save(update_fields=["cupo_disponible", "updated_at"])
        return reserva

    @staticmethod
    def listar_reservas_para_usuario(user) -> QuerySet[Reserva]:
        """
        Retorna las reservas del usuario autenticado (o todas si es staff/admin).
        Protege el aislamiento de datos entre clientes.
        """
        base_qs = Reserva.objects.select_related("tour", "cliente", "cliente__persona").prefetch_related(
            "detalle_opciones"
        )
        if user.is_staff:
            return base_qs.all()
        return base_qs.filter(cliente__persona__user=user)

    @staticmethod
    @transaction.atomic
    def actualizar_estado_reserva(
        *,
        user,
        reserva_id: int,
        nuevo_estado: str,
        motivo: str = "",
    ) -> Reserva:
        """
        Cambia el estado de una reserva verificando permisos por propietario y rol.
        """
        reserva = (
            Reserva.objects.select_related("tour", "cliente", "cliente__persona")
            .select_for_update()
            .prefetch_related("detalle_opciones")
            .filter(pk=reserva_id)
            .first()
        )
        if not reserva:
            raise DomainError("La reserva solicitada no existe.", status_code=404)

        es_propietario = reserva.cliente.persona.user_id == user.id
        if not user.is_staff and not es_propietario:
            raise DomainError("No tienes permiso para modificar una reserva de otro cliente.", status_code=403)

        estado_norm = (nuevo_estado or "").strip().upper()
        estados_validos = {choice[0] for choice in EstadoReserva.choices}
        if estado_norm not in estados_validos:
            raise DomainError(f"Estado '{nuevo_estado}' inválido.")

        estado_anterior = reserva.estado
        if estado_norm == estado_anterior:
            raise DomainError("La reserva ya se encuentra en ese estado.")

        es_staff = bool(user.is_staff or user.is_superuser)
        if not es_staff:
            if estado_norm != EstadoReserva.CANCELADA:
                raise DomainError("Como cliente solo puedes solicitar la cancelación de tu reserva.", status_code=403)
            if reserva.estado not in {EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA}:
                raise DomainError("Esta reserva no admite cancelación desde su estado actual.")
        else:
            transiciones_staff = {
                (EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA),
                (EstadoReserva.PENDIENTE, EstadoReserva.CANCELADA),
                (EstadoReserva.CONFIRMADA, EstadoReserva.COMPLETADA),
                (EstadoReserva.CONFIRMADA, EstadoReserva.CANCELADA),
            }
            if (estado_anterior, estado_norm) not in transiciones_staff:
                raise DomainError(
                    f"La transición {estado_anterior} -> {estado_norm} no está permitida."
                )

        if estado_norm == EstadoReserva.CONFIRMADA and not reserva.salida_id:
            raise DomainError(
                "No se puede confirmar una reserva sin una salida real asociada por fecha.",
                status_code=409,
            )

        if estado_anterior in {EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA} and estado_norm == EstadoReserva.CANCELADA:
            if reserva.salida_id:
                salida = TourSalida.objects.select_for_update().get(pk=reserva.salida_id)
                salida.cupo_disponible = min(
                    salida.cupo_total,
                    salida.cupo_disponible + reserva.cant_personas,
                )
                salida.save(update_fields=["cupo_disponible", "updated_at"])
            Cliente.objects.filter(pk=reserva.cliente_id).filter(contador_reservas__gt=0).update(
                contador_reservas=F("contador_reservas") - 1
            )

        reserva.estado = estado_norm
        reserva.save(update_fields=["estado", "updated_at"])
        CambioEstadoReserva.objects.create(
            reserva=reserva,
            usuario=user,
            estado_anterior=estado_anterior,
            estado_nuevo=estado_norm,
            motivo=(motivo or "").strip(),
        )
        return reserva
