"""Serializadores de Django REST Framework para transacciones de pago."""
from rest_framework import serializers
from .models import TransaccionPago


class TransaccionPagoSerializer(serializers.ModelSerializer):
    """Serializador DRF para consultar transacciones de pago."""

    estado_display = serializers.CharField(source="get_estado_display", read_only=True)
    monto = serializers.CharField()
    monto_num = serializers.SerializerMethodField()
    codigo_reserva = serializers.CharField(source="reserva.codigo_reserva", read_only=True)
    created_at = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%S%z")

    class Meta:
        model = TransaccionPago
        fields = [
            "id",
            "referencia_interna",
            "reserva_id",
            "codigo_reserva",
            "monto",
            "monto_num",
            "moneda",
            "proveedor",
            "referencia_externa",
            "estado",
            "estado_display",
            "notas_verificacion",
            "created_at",
        ]

    def get_monto_num(self, obj) -> float:
        return float(obj.monto)


# --- Función de compatibilidad ---
def serialize_transaccion(tx: TransaccionPago) -> dict:
    return TransaccionPagoSerializer(tx).data
