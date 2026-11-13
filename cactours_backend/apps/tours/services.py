"""
Servicios de dominio del catálogo de tours y motor de recomendación por presupuesto (`apps.tours.services`).
Traslada la lógica de negocio que antes estaba hardcodeada en JavaScript dentro de `reservas.html`
hacia el backend de Django como única fuente de verdad.
"""
from decimal import Decimal, InvalidOperation
from django.db.models import Q, QuerySet
from apps.common.http import DomainError
from .models import EstadoTour, OpcionTour, Tour
from .serializers import serialize_opcion, serialize_tour


class TourCatalogService:
    """Consultas y reglas de negocio del catálogo de tours."""

    @staticmethod
    def listar_tours_publicados(
        *,
        destino: str | None = None,
        busqueda: str | None = None,
        presupuesto_max: str | Decimal | None = None,
    ) -> QuerySet[Tour]:
        qs = Tour.objects.filter(estado=EstadoTour.PUBLICADO).prefetch_related("imagenes", "opciones")

        if destino:
            qs = qs.filter(ciudad_destino__icontains=destino.strip())

        if busqueda:
            term = busqueda.strip()
            qs = qs.filter(
                Q(nombre_tour__icontains=term)
                | Q(descripcion__icontains=term)
                | Q(ciudad_destino__icontains=term)
            )

        if presupuesto_max is not None and str(presupuesto_max).strip() != "":
            try:
                max_val = Decimal(str(presupuesto_max))
                qs = qs.filter(costo__lte=max_val)
            except InvalidOperation as exc:
                raise DomainError("El presupuesto máximo debe ser un valor numérico válido.") from exc

        return qs

    @staticmethod
    def obtener_tour_publicado(tour_id: int) -> Tour:
        tour = (
            Tour.objects.filter(pk=tour_id, estado=EstadoTour.PUBLICADO)
            .prefetch_related("imagenes", "opciones")
            .first()
        )
        if not tour:
            raise DomainError("El tour solicitado no existe o no se encuentra disponible.", status_code=404)
        return tour

    @staticmethod
    def recomendar_por_presupuesto(*, presupuesto_cop, cantidad_personas: int = 1) -> dict:
        """
        Evalúa el presupuesto total del cliente (en COP) y el número de viajeros,
        retornando el plan sugerido y los tours reales del catálogo que se ajustan.
        """
        try:
            presupuesto_total = Decimal(str(presupuesto_cop))
        except (InvalidOperation, TypeError) as exc:
            raise DomainError("Ingresa un presupuesto numérico válido en COP.") from exc

        try:
            personas = int(cantidad_personas)
        except (ValueError, TypeError) as exc:
            raise DomainError("La cantidad de personas debe ser un número entero.") from exc

        if presupuesto_total <= Decimal("0"):
            raise DomainError("El presupuesto debe ser mayor a 0 COP.")
        if personas < 1:
            raise DomainError("La cantidad de personas debe ser al menos 1.")

        presupuesto_por_persona = (presupuesto_total / Decimal(personas)).quantize(Decimal("0.01"))

        if presupuesto_por_persona < Decimal("150000"):
            plan_sugerido = {
                "categoria": "ESENCIAL",
                "destino_sugerido": "Playas Cercanas y Ruta Cultural (Riohacha / Mayapo / Taganga)",
                "transporte": "Transporte compartido climatizado",
                "alimentacion": "Hidratación incluida (almuerzo opcional)",
                "duracion": "Medio día (1 día)",
            }
        elif presupuesto_por_persona < Decimal("250000"):
            plan_sugerido = {
                "categoria": "CONFORT",
                "destino_sugerido": "Cabo de la Vela / Montes de Oca / Eje Cafetero",
                "transporte": "Transporte privado 4x4",
                "alimentacion": "Almuerzo típico incluido",
                "duracion": "Día completo (1 a 2 días)",
            }
        else:
            plan_sugerido = {
                "categoria": "EXCLUSIVO VIP",
                "destino_sugerido": "Expedición Alta Guajira (Punta Gallinas / Cabo de la Vela) o Amazonas",
                "transporte": "Camioneta 4x4 VIP privada con guía bilingüe",
                "alimentacion": "Alimentación completa y experiencias gastronómicas incluidas",
                "duracion": "Multidía o Día completo Todo Incluido",
            }

        tours_compatibles = TourCatalogService.listar_tours_publicados(
            presupuesto_max=presupuesto_por_persona
        )
        opciones_activas = list(OpcionTour.objects.filter(activa=True))

        recomendaciones = []
        for tour in tours_compatibles:
            remanente_por_persona = presupuesto_por_persona - tour.costo
            opciones_incluidas = [
                serialize_opcion(op)
                for op in opciones_activas
                if op.precio_adic <= remanente_por_persona
            ]
            recomendaciones.append(
                {
                    "tour": serialize_tour(tour, include_detail=False),
                    "costo_base_grupo": str((tour.costo * Decimal(personas)).quantize(Decimal("0.01"))),
                    "presupuesto_restante_por_persona": str(remanente_por_persona.quantize(Decimal("0.01"))),
                    "opciones_sugeridas": opciones_incluidas,
                }
            )

        return {
            "presupuesto_total_cop": str(presupuesto_total.quantize(Decimal("0.01"))),
            "cantidad_personas": personas,
            "presupuesto_por_persona_cop": str(presupuesto_por_persona),
            "plan_sugerido": plan_sugerido,
            "tours_compatibles": recomendaciones,
        }
