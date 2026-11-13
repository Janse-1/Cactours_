"""Endpoints REST del Catálogo de Tours (`/api/v1/tours/`)."""
from apps.common.http import api_handler, api_response, parse_json_body
from .models import OpcionTour
from .serializers import serialize_opcion, serialize_tour
from .services import TourCatalogService


@api_handler(["GET"])
def tour_list_view(request):
    """GET /api/v1/tours/ - Lista tours publicados con filtros opcionales."""
    destino = request.GET.get("destino")
    busqueda = request.GET.get("q") or request.GET.get("search")
    presupuesto_max = request.GET.get("presupuesto_max")

    tours = TourCatalogService.listar_tours_publicados(
        destino=destino,
        busqueda=busqueda,
        presupuesto_max=presupuesto_max,
    )
    return api_response(
        {
            "count": tours.count(),
            "results": [serialize_tour(tour, include_detail=False) for tour in tours],
        }
    )


@api_handler(["GET"])
def tour_detail_view(request, tour_id: int):
    """GET /api/v1/tours/<tour_id>/ - Obtiene el detalle completo de un tour y sus opciones."""
    tour = TourCatalogService.obtener_tour_publicado(tour_id)
    return api_response({"tour": serialize_tour(tour, include_detail=True)})


@api_handler(["GET"])
def opciones_list_view(request):
    """GET /api/v1/tours/opciones/ - Lista las opciones adicionales activas."""
    opciones = OpcionTour.objects.filter(activa=True)
    return api_response(
        {
            "count": opciones.count(),
            "results": [serialize_opcion(op) for op in opciones],
        }
    )


@api_handler(["POST", "GET"])
def budget_recommender_view(request):
    """POST/GET /api/v1/tours/recomendador/ - Recomienda tours y adiciones según presupuesto."""
    if request.method == "POST":
        payload = parse_json_body(request)
        presupuesto = payload.get("presupuesto")
        personas = payload.get("cantidad_personas", 1)
    else:
        presupuesto = request.GET.get("presupuesto")
        personas = request.GET.get("cantidad_personas", 1)

    resultado = TourCatalogService.recomendar_por_presupuesto(
        presupuesto_cop=presupuesto,
        cantidad_personas=personas,
    )
    return api_response(resultado)
