from decimal import Decimal, InvalidOperation

from django.db.models import Count, Sum

from apps.accounts.models import Cliente
from apps.bookings.models import EstadoReserva, Reserva
from apps.common.http import api_handler, api_response, parse_json_body, DomainError
from apps.tours.models import EstadoTour, Tour
from apps.tours.serializers import serialize_tour
from apps.bookings.serializers import serialize_reserva


@api_handler(["GET"])
def admin_dashboard_view(request):
    tours = Tour.objects.all()
    reservas = Reserva.objects.all()

    estados_reserva = reservas.values("estado").annotate(total=Count("id"))
    estados_tour = tours.values("estado").annotate(total=Count("id"))

    ingresado = reservas.filter(
        estado__in=[EstadoReserva.CONFIRMADA, EstadoReserva.COMPLETADA]
    ).aggregate(total=Sum("costo_total"))["total"] or Decimal("0")

    recientes = reservas.select_related("cliente", "cliente__persona", "tour").order_by("-created_at")[:8]

    return api_response({
        "stats": {
            "tours": tours.count(),
            "tours_publicados": tours.filter(estado=EstadoTour.PUBLICADO).count(),
            "reservas": reservas.count(),
            "pendientes": reservas.filter(estado=EstadoReserva.PENDIENTE).count(),
            "confirmadas": reservas.filter(estado=EstadoReserva.CONFIRMADA).count(),
            "clientes": Cliente.objects.count(),
            "ingresos": float(ingresado),
        },
        "estados_reserva": list(estados_reserva),
        "estados_tour": list(estados_tour),
        "recientes": [serialize_reserva(reserva) for reserva in recientes],
    })


@api_handler(["GET", "POST"])
def admin_tours_view(request):
    if request.method == "GET":
        tours = Tour.objects.all().prefetch_related("opciones", "imagenes")
        return api_response({
            "count": tours.count(),
            "results": [serialize_tour(tour, include_detail=True) for tour in tours],
        })

    payload = parse_json_body(request)
    nombre = (payload.get("nombre_tour") or "").strip()
    descripcion = (payload.get("descripcion") or "").strip()
    destino = (payload.get("ciudad_destino") or "").strip()
    if not nombre or not descripcion or not destino:
        raise DomainError("Nombre, descripción y destino son obligatorios.")

    try:
        costo = Decimal(str(payload.get("costo", "0")))
        duracion = int(payload.get("duracion_dias", 1))
        cupo = int(payload.get("cupo_maximo", 20))
    except (InvalidOperation, TypeError, ValueError):
        raise DomainError("Costo, duración y cupo deben tener valores numéricos válidos.")

    if costo <= 0 or duracion < 1 or cupo < 1:
        raise DomainError("El costo debe ser mayor a cero y la duración/cupo deben ser positivos.")

    estado = payload.get("estado", EstadoTour.PUBLICADO)
    if estado not in EstadoTour.values:
        raise DomainError("Estado de tour inválido.")

    tour = Tour.objects.create(
        nombre_tour=nombre,
        descripcion=descripcion,
        ciudad_destino=destino,
        duracion_dias=duracion,
        cupo_maximo=cupo,
        costo=costo,
        estado=estado,
    )
    return api_response(
        {"tour": serialize_tour(tour, include_detail=True)},
        message="Plan creado correctamente.",
        status=201,
    )


@api_handler(["PATCH", "DELETE"])
def admin_tour_detail_view(request, tour_id):
    tour = Tour.objects.filter(pk=tour_id).first()
    if not tour:
        raise DomainError("Plan no encontrado.", status_code=404)

    if request.method == "DELETE":
        if tour.reservas.exists():
            tour.estado = EstadoTour.INACTIVO
            tour.save(update_fields=["estado"])
            return api_response(
                {"tour": serialize_tour(tour, include_detail=True)},
                message="El plan tiene reservas asociadas y quedó inactivo.",
            )
        tour.delete()
        return api_response({"deleted": True}, message="Plan eliminado correctamente.")

    payload = parse_json_body(request)
    fields = {
        "nombre_tour": "nombre_tour",
        "descripcion": "descripcion",
        "ciudad_destino": "ciudad_destino",
        "duracion_dias": "duracion_dias",
        "cupo_maximo": "cupo_maximo",
        "costo": "costo",
        "estado": "estado",
    }
    for source, field in fields.items():
        if source not in payload:
            continue
        value = payload[source]
        if field == "costo":
            try:
                value = Decimal(str(value))
            except (InvalidOperation, TypeError):
                raise DomainError("El costo debe ser un número válido.")
            if value <= 0:
                raise DomainError("El costo debe ser mayor a cero.")
        elif field in ("duracion_dias", "cupo_maximo"):
            try:
                value = int(value)
            except (TypeError, ValueError):
                raise DomainError(f"El campo {field} debe ser numérico.")
            if value < 1:
                raise DomainError(f"El campo {field} debe ser positivo.")
        elif field == "estado" and value not in EstadoTour.values:
            raise DomainError("Estado de tour inválido.")
        setattr(tour, field, value)

    tour.save()
    return api_response(
        {"tour": serialize_tour(tour, include_detail=True)},
        message="Plan actualizado correctamente.",
    )


@api_handler(["GET"])
def admin_bookings_view(request):
    reservas = Reserva.objects.select_related("cliente", "cliente__persona", "tour").order_by("-created_at")
    return api_response({
        "count": reservas.count(),
        "results": [serialize_reserva(reserva) for reserva in reservas],
    })


@api_handler(["PATCH"])
def admin_booking_detail_view(request, reserva_id):
    reserva = Reserva.objects.select_related("cliente", "cliente__persona", "tour").filter(pk=reserva_id).first()
    if not reserva:
        raise DomainError("Solicitud no encontrada.", status_code=404)

    payload = parse_json_body(request)
    estado = payload.get("estado")
    if estado not in EstadoReserva.values:
        raise DomainError("Estado de solicitud inválido.")

    reserva.estado = estado
    reserva.save(update_fields=["estado"])
    return api_response(
        {"reserva": serialize_reserva(reserva)},
        message=f"Solicitud actualizada a {reserva.get_estado_display()}.",
    )
