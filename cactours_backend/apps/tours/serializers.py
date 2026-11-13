"""Serializadores del catálogo de tours y opciones adicionales."""
from .models import ImagenTour, OpcionTour, Tour


def serialize_opcion(opcion: OpcionTour) -> dict:
    return {
        "id": opcion.id,
        "nombre_op": opcion.nombre_op,
        "descripcion": opcion.descripcion,
        "precio_adic": str(opcion.precio_adic),
        "precio_adic_num": float(opcion.precio_adic),
        "cobro_por_persona": opcion.cobro_por_persona,
    }


def serialize_imagen(imagen: ImagenTour) -> dict:
    return {
        "id": imagen.id,
        "url": imagen.imagen.url if imagen.imagen else None,
        "descripcion": imagen.descripcion or f"Imagen de {imagen.tour.nombre_tour}",
        "orden": imagen.orden,
    }


def serialize_tour(tour: Tour, *, include_detail: bool = False) -> dict:
    imagenes = [serialize_imagen(img) for img in tour.imagenes.all()]
    portada_url = tour.imagen.url if tour.imagen else (imagenes[0]["url"] if imagenes else None)

    data = {
        "id": tour.id,
        "slug": tour.slug,
        "nombre_tour": tour.nombre_tour,
        "descripcion": tour.descripcion,
        "ciudad_destino": tour.ciudad_destino,
        "duracion_dias": tour.duracion_dias,
        "cupo_maximo": tour.cupo_maximo,
        "costo": str(tour.costo),
        "costo_num": float(tour.costo),
        "estado": tour.estado,
        "imagen_portada": portada_url,
        "imagenes": imagenes,
    }

    if include_detail:
        opciones_qs = tour.opciones.filter(activa=True)
        if not opciones_qs.exists():
            opciones_qs = OpcionTour.objects.filter(activa=True)
        data["opciones_disponibles"] = [serialize_opcion(op) for op in opciones_qs]

    return data
