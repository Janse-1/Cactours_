"""Endpoints REST de Pagos (`/api/v1/payments/`)."""
from apps.common.http import DomainError, api_handler, api_response, parse_json_body
from .models import TransaccionPago
from .services import PaymentService, serialize_transaccion


@api_handler(["GET", "POST"], auth_required=True)
def payment_list_create_view(request):
    """
    GET /api/v1/payments/ - Lista las transacciones de pago del usuario autenticado.
    POST /api/v1/payments/ - Registra una intención de pago asociada a una reserva propia.
    """
    if request.method == "GET":
        qs = TransaccionPago.objects.select_related("reserva", "reserva__cliente__persona")
        if not request.user.is_staff:
            qs = qs.filter(reserva__cliente__persona__user=request.user)
        return api_response(
            {
                "count": qs.count(),
                "results": [serialize_transaccion(tx) for tx in qs],
            }
        )

    payload = parse_json_body(request)
    reserva_id = payload.get("reserva_id")
    if not reserva_id:
        raise DomainError("El campo 'reserva_id' es obligatorio.")

    tx = PaymentService.registrar_intencion_pago(
        user=request.user,
        reserva_id=int(reserva_id),
        proveedor=payload.get("proveedor", "MANUAL_AGENCIA"),
    )
    return api_response(
        {"transaccion": serialize_transaccion(tx)},
        message="Intención de pago registrada en estado pendiente de verificación.",
        status=201,
    )
