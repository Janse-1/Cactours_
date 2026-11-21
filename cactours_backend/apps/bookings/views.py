"""Endpoints REST de Reservas y Cotizaciones (`/api/v1/bookings/`)."""
from apps.common.http import DomainError, api_handler, api_response, parse_json_body
from .serializers import serialize_reserva
from .services import BookingService


@api_handler(["POST"])
def quote_booking_view(request):
    """POST /api/v1/bookings/cotizar/ - Calcula en servidor el total de un tour y sus adiciones."""
    payload = parse_json_body(request)
    tour_id = payload.get("tour_id")
    if not tour_id:
        raise DomainError("El campo 'tour_id' es obligatorio para cotizar.")

    cotizacion = BookingService.cotizar_reserva(
        tour_id=int(tour_id),
        cant_personas=payload.get("cant_personas", 1),
        opciones_ids=payload.get("opciones_ids", []),
    )
    return api_response(
        {
            "tour_id": cotizacion["tour"].id,
            "nombre_tour": cotizacion["tour"].nombre_tour,
            "cant_personas": cotizacion["cant_personas"],
            "subtotal_base": str(cotizacion["subtotal_base"]),
            "subtotal_opciones": str(cotizacion["subtotal_opciones"]),
            "costo_total": str(cotizacion["costo_total"]),
            "costo_total_num": float(cotizacion["costo_total"]),
            "opciones": [
                {
                    "id": item["opcion"].id,
                    "nombre_op": item["opcion"].nombre_op,
                    "precio_unitario": str(item["precio_unitario"]),
                    "subtotal": str(item["subtotal"]),
                }
                for item in cotizacion["desglose_opciones"]
            ],
        }
    )


@api_handler(["GET", "POST"], auth_required=True)
def booking_list_create_view(request):
    """
    GET /api/v1/bookings/ - Historial de reservas del usuario autenticado.
    POST /api/v1/bookings/ - Crea una nueva solicitud de reserva con precio calculado en servidor.
    """
    if request.method == "GET":
        reservas = BookingService.listar_reservas_para_usuario(request.user)
        return api_response(
            {
                "count": reservas.count(),
                "results": [serialize_reserva(r) for r in reservas],
            }
        )

    payload = parse_json_body(request)
    tour_id = payload.get("tour_id")
    if not tour_id:
        raise DomainError("El campo 'tour_id' es obligatorio.")

    reserva = BookingService.crear_solicitud_reserva(
        user=request.user,
        tour_id=int(tour_id),
        lugar_salida=payload.get("lugar_salida", ""),
        cant_personas=payload.get("cant_personas", 1),
        medio_pago=payload.get("medio_pago", "TRANSFERENCIA"),
        fecha=payload.get("fecha"),
        opciones_ids=payload.get("opciones_ids", []),
        comentarios=payload.get("comentarios", ""),
    )
    return api_response(
        {"reserva": serialize_reserva(reserva)},
        message="Solicitud de reserva registrada correctamente. Estado actual: Pendiente de confirmación.",
        status=201,
    )


@api_handler(["GET", "PATCH"], auth_required=True)
def booking_detail_view(request, reserva_id: int):
    """
    GET /api/v1/bookings/<id>/ - Detalle de una reserva propia (o cualquiera si es admin).
    PATCH /api/v1/bookings/<id>/ - Actualiza el estado (ej. cancelar solicitud).
    """
    if request.method == "PATCH":
        payload = parse_json_body(request)
        reserva = BookingService.actualizar_estado_reserva(
            user=request.user,
            reserva_id=reserva_id,
            nuevo_estado=payload.get("estado", ""),
            motivo=payload.get("motivo", ""),
        )
        return api_response(
            {"reserva": serialize_reserva(reserva)},
            message=f"Estado de la reserva actualizado a {reserva.get_estado_display()}.",
        )

    reservas = BookingService.listar_reservas_para_usuario(request.user)
    reserva = reservas.filter(pk=reserva_id).first()
    if not reserva:
        raise DomainError("Reserva no encontrada o sin permisos de acceso.", status_code=404)
    return api_response({"reserva": serialize_reserva(reserva)})
