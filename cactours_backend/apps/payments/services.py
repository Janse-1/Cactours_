"""Servicios y serialización del módulo de pagos (`apps.payments`)."""
from django.db import transaction
from apps.bookings.models import Reserva
from apps.common.http import DomainError
from .models import EstadoTransaccion, TransaccionPago


def serialize_transaccion(tx: TransaccionPago) -> dict:
    return {
        "id": tx.id,
        "referencia_interna": tx.referencia_interna,
        "reserva_id": tx.reserva_id,
        "codigo_reserva": tx.reserva.codigo_reserva,
        "monto": str(tx.monto),
        "moneda": tx.moneda,
        "proveedor": tx.proveedor,
        "referencia_externa": tx.referencia_externa,
        "estado": tx.estado,
        "estado_display": tx.get_estado_display(),
        "created_at": tx.created_at.isoformat(),
    }


class PaymentService:
    """Gestión de intenciones de pago sin almacenar datos sensibles de tarjetas."""

    @staticmethod
    @transaction.atomic
    def registrar_intencion_pago(*, user, reserva_id: int, proveedor: str = "MANUAL_AGENCIA") -> TransaccionPago:
        reserva = Reserva.objects.select_related("cliente__persona").filter(pk=reserva_id).first()
        if not reserva:
            raise DomainError("La reserva indicada no existe.", status_code=404)

        if not user.is_staff and reserva.cliente.persona.user_id != user.id:
            raise DomainError("No tienes permiso para registrar pagos sobre una reserva ajena.", status_code=403)

        tx = TransaccionPago.objects.create(
            reserva=reserva,
            monto=reserva.costo_total,
            moneda="COP",
            proveedor=(proveedor or "MANUAL_AGENCIA").strip().upper(),
            estado=EstadoTransaccion.PENDIENTE,
        )
        return tx
