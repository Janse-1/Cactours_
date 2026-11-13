"""Pruebas de negocio del catálogo de tours y recomendador por presupuesto (`apps.tours`)."""
from decimal import Decimal
from django.test import TestCase
from .models import EstadoTour, OpcionTour, Tour
from .services import TourCatalogService


class ToursCatalogTests(TestCase):
    def setUp(self):
        self.opcion_almuerzo = OpcionTour.objects.create(
            nombre_op="Almuerzo Típico",
            descripcion="Pescado frito con arroz de camarón",
            precio_adic=Decimal("35000.00"),
            cobro_por_persona=True,
        )
        self.tour_cabo = Tour.objects.create(
            nombre_tour="Expedición Cabo de la Vela",
            descripcion="Recorrido por el Pilón de Azúcar y Faro.",
            ciudad_destino="Cabo de la Vela",
            duracion_dias=2,
            cupo_maximo=12,
            costo=Decimal("180000.00"),
            estado=EstadoTour.PUBLICADO,
        )
        self.tour_cabo.opciones.add(self.opcion_almuerzo)

    def test_recomendador_por_presupuesto_calcula_plan_y_tours(self):
        resultado = TourCatalogService.recomendar_por_presupuesto(
            presupuesto_cop="450000",
            cantidad_personas=2,
        )
        self.assertEqual(resultado["presupuesto_por_persona_cop"], "225000.00")
        self.assertEqual(resultado["plan_sugerido"]["categoria"], "CONFORT")
        self.assertEqual(len(resultado["tours_compatibles"]), 1)
        self.assertEqual(
            resultado["tours_compatibles"][0]["tour"]["nombre_tour"],
            "Expedición Cabo de la Vela",
        )

    def test_tour_serializers_structure_and_types(self):
        from .serializers import OpcionTourSerializer, TourDetailSerializer, TourListSerializer

        list_data = TourListSerializer(self.tour_cabo).data
        self.assertEqual(list_data["id"], self.tour_cabo.id)
        self.assertEqual(list_data["nombre_tour"], "Expedición Cabo de la Vela")
        self.assertEqual(list_data["costo"], "180000.00")
        self.assertEqual(list_data["costo_num"], 180000.0)
        self.assertIn("imagen_portada", list_data)
        self.assertIn("imagenes", list_data)

        detail_data = TourDetailSerializer(self.tour_cabo).data
        self.assertIn("opciones_disponibles", detail_data)
        self.assertEqual(len(detail_data["opciones_disponibles"]), 1)
        self.assertEqual(detail_data["opciones_disponibles"][0]["nombre_op"], "Almuerzo Típico")

        opcion_data = OpcionTourSerializer(self.opcion_almuerzo).data
        self.assertEqual(opcion_data["precio_adic"], "35000.00")
        self.assertEqual(opcion_data["precio_adic_num"], 35000.0)
