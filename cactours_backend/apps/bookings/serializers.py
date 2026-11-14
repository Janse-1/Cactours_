"""Serializadores de Django REST Framework para reservas y desgloses de cotización."""
from rest_framework import serializers
from .models import Reserva, ReservaOpcion


class ReservaOpcionDetalleSerializer(serializers.ModelSerializer):
    """Serializador DRF para una opción contratada dentro de una reserva."""

    precio_unitario = serializers.CharField()
    subtotal = serializers.CharField()

    class Meta:
        model = ReservaOpcion
        fields = ["opcion_id", "nombre_opcion", "precio_unitario", "subtotal"]


class ReservaDetailSerializer(serializers.ModelSerializer):
    """Serializador DRF para la consulta completa de una reserva."""

    estado_display = serializers.CharField(source="get_estado_display", read_only=True)
    medio_pago_display = serializers.CharField(source="get_medio_pago_display", read_only=True)
    es_solicitud_sin_cobro_en_linea = serializers.BooleanField(default=True, read_only=True)
    tour = serializers.SerializerMethodField()
    cliente = serializers.SerializerMethodField()
    opciones = serializers.SerializerMethodField()
    subtotal_base = serializers.CharField()
    subtotal_opciones = serializers.CharField()
    costo_total = serializers.CharField()
    costo_total_num = serializers.SerializerMethodField()
    fecha = serializers.DateField(format="%Y-%m-%d")
    hora = serializers.TimeField(format="%H:%M:%S")
    created_at = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%S%z")

    class Meta:
        model = Reserva
        fields = [
            "id",
            "codigo_reserva",
            "estado",
            "estado_display",
            "es_solicitud_sin_cobro_en_linea",
            "tour",
            "cliente",
            "lugar_salida",
            "destino",
            "fecha",
            "hora",
            "cant_personas",
            "medio_pago",
            "medio_pago_display",
            "subtotal_base",
            "subtotal_opciones",
            "costo_total",
            "costo_total_num",
            "opciones",
            "comentarios",
            "created_at",
        ]

    def get_tour(self, obj) -> dict:
        return {
            "id": obj.tour_id,
            "nombre_tour": obj.tour.nombre_tour,
            "ciudad_destino": obj.tour.ciudad_destino,
            "duracion_dias": obj.tour.duracion_dias,
        }

    def get_cliente(self, obj) -> dict:
        return {
            "id": obj.cliente_id,
            "nombre_completo": str(obj.cliente.persona),
        }

    def get_opciones(self, obj) -> list[dict]:
        return ReservaOpcionDetalleSerializer(obj.detalle_opciones.all(), many=True).data

    def get_costo_total_num(self, obj) -> float:
        return float(obj.costo_total)


class ReservaCreateInputSerializer(serializers.Serializer):
    """Validador DRF de entrada para registrar una solicitud de reserva."""

    tour_id = serializers.IntegerField(min_value=1)
    lugar_salida = serializers.CharField(max_length=120)
    cant_personas = serializers.IntegerField(min_value=1)
    medio_pago = serializers.CharField(max_length=30)
    fecha = serializers.DateField(required=False, allow_null=True)
    opciones_ids = serializers.ListField(child=serializers.IntegerField(min_value=1), required=False, default=list)
    comentarios = serializers.CharField(required=False, allow_blank=True, default="")


# --- Función de compatibilidad ---
def serialize_reserva(reserva: Reserva) -> dict:
    return ReservaDetailSerializer(reserva).data
