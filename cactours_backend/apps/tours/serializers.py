"""Serializadores de Django REST Framework para el catálogo de tours y opciones."""
from rest_framework import serializers
from .models import ImagenTour, OpcionTour, Tour


class OpcionTourSerializer(serializers.ModelSerializer):
    """Serializador DRF para opciones adicionales de un tour."""

    precio_adic = serializers.CharField()
    precio_adic_num = serializers.SerializerMethodField()

    class Meta:
        model = OpcionTour
        fields = [
            "id",
            "nombre_op",
            "descripcion",
            "precio_adic",
            "precio_adic_num",
            "cobro_por_persona",
        ]

    def get_precio_adic_num(self, obj) -> float:
        return float(obj.precio_adic)


class ImagenTourSerializer(serializers.ModelSerializer):
    """Serializador DRF para la galería de imágenes de un tour."""

    url = serializers.SerializerMethodField()
    descripcion = serializers.SerializerMethodField()

    class Meta:
        model = ImagenTour
        fields = ["id", "url", "descripcion", "orden"]

    def get_url(self, obj) -> str | None:
        return obj.imagen.url if obj.imagen else None

    def get_descripcion(self, obj) -> str:
        return obj.descripcion or f"Imagen de {obj.tour.nombre_tour}"


class TourListSerializer(serializers.ModelSerializer):
    """Serializador DRF para el catálogo general de tours (listado)."""

    costo = serializers.CharField()
    costo_num = serializers.SerializerMethodField()
    imagen_portada = serializers.SerializerMethodField()
    imagenes = ImagenTourSerializer(many=True, read_only=True)

    class Meta:
        model = Tour
        fields = [
            "id",
            "slug",
            "nombre_tour",
            "descripcion",
            "ciudad_destino",
            "duracion_dias",
            "cupo_maximo",
            "costo",
            "costo_num",
            "estado",
            "imagen_portada",
            "imagenes",
        ]

    def get_costo_num(self, obj) -> float:
        return float(obj.costo)

    def get_imagen_portada(self, obj) -> str | None:
        if obj.imagen:
            return obj.imagen.url
        primera = obj.imagenes.first()
        return primera.imagen.url if (primera and primera.imagen) else None


class TourDetailSerializer(TourListSerializer):
    """Serializador DRF para el detalle completo de un tour con sus opciones adicionales."""

    opciones_disponibles = serializers.SerializerMethodField()

    class Meta(TourListSerializer.Meta):
        fields = TourListSerializer.Meta.fields + ["opciones_disponibles"]

    def get_opciones_disponibles(self, obj) -> list[dict]:
        opciones_qs = obj.opciones.filter(activa=True)
        if not opciones_qs.exists():
            opciones_qs = OpcionTour.objects.filter(activa=True)
        return OpcionTourSerializer(opciones_qs, many=True).data


# --- Funciones de compatibilidad para vistas existentes ---
def serialize_opcion(opcion: OpcionTour) -> dict:
    return OpcionTourSerializer(opcion).data


def serialize_imagen(imagen: ImagenTour) -> dict:
    return ImagenTourSerializer(imagen).data


def serialize_tour(tour: Tour, *, include_detail: bool = False) -> dict:
    serializer_cls = TourDetailSerializer if include_detail else TourListSerializer
    return serializer_cls(tour).data
