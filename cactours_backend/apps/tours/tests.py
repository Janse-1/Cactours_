"""Pruebas de negocio del catálogo de tours y recomendador por presupuesto (`apps.tours`)."""
import json
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
            activa=True,
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

        self.tour_punta = Tour.objects.create(
            nombre_tour="Aventura Punta Gallinas",
            descripcion="Dunas de Taroa y el punto más norte de Suramérica.",
            ciudad_destino="Punta Gallinas",
            duracion_dias=3,
            cupo_maximo=8,
            costo=Decimal("320000.00"),
            estado=EstadoTour.PUBLICADO,
        )

        self.tour_inactivo = Tour.objects.create(
            nombre_tour="Tour Borrador Oculto",
            descripcion="Ruta en diseño no publicada.",
            ciudad_destino="Riohacha",
            duracion_dias=1,
            cupo_maximo=5,
            costo=Decimal("90000.00"),
            estado=EstadoTour.BORRADOR,
        )

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

    def test_catalogo_solo_retorna_tours_publicados(self):
        """POSITIVA/SEGURIDAD: Tours en BORRADOR o INACTIVO no deben ser visibles en la API pública."""
        resp = self.client.get("/api/v1/tours/")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()["data"]
        self.assertEqual(data["count"], 2)
        nombres = [t["nombre_tour"] for t in data["results"]]
        self.assertIn("Expedición Cabo de la Vela", nombres)
        self.assertIn("Aventura Punta Gallinas", nombres)
        self.assertNotIn("Tour Borrador Oculto", nombres)

    def test_filtro_por_destino(self):
        """POSITIVA: Filtrar por destino retorna sólo tours correspondientes."""
        resp = self.client.get("/api/v1/tours/?destino=Gallinas")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()["data"]
        self.assertEqual(data["count"], 1)
        self.assertEqual(data["results"][0]["nombre_tour"], "Aventura Punta Gallinas")

    def test_filtro_por_busqueda_texto(self):
        """POSITIVA: Búsqueda libre 'q' en nombre o descripción."""
        resp = self.client.get("/api/v1/tours/?q=Pilón")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()["data"]
        self.assertEqual(data["count"], 1)
        self.assertEqual(data["results"][0]["nombre_tour"], "Expedición Cabo de la Vela")

    def test_filtro_por_presupuesto_max(self):
        """POSITIVA: Filtro de presupuesto máximo."""
        resp = self.client.get("/api/v1/tours/?presupuesto_max=200000")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()["data"]
        self.assertEqual(data["count"], 1)
        self.assertEqual(data["results"][0]["nombre_tour"], "Expedición Cabo de la Vela")

    def test_filtro_por_presupuesto_invalido_retorna_400(self):
        """NEGATIVA: Parámetro de presupuesto malformado."""
        resp = self.client.get("/api/v1/tours/?presupuesto_max=no_es_un_numero")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("numérico válido", resp.json()["error"])

    def test_detalle_tour_publicado(self):
        """POSITIVA: Detalle completo con opciones y galería."""
        resp = self.client.get(f"/api/v1/tours/{self.tour_cabo.id}/")
        self.assertEqual(resp.status_code, 200)
        tour_data = resp.json()["data"]["tour"]
        self.assertEqual(tour_data["nombre_tour"], "Expedición Cabo de la Vela")
        self.assertEqual(len(tour_data["opciones_disponibles"]), 1)
        self.assertEqual(tour_data["opciones_disponibles"][0]["nombre_op"], "Almuerzo Típico")

    def test_detalle_tour_inactivo_retorna_404(self):
        """LÍMITE/SEGURIDAD: Intentar consultar por ID un tour no publicado retorna 404."""
        resp = self.client.get(f"/api/v1/tours/{self.tour_inactivo.id}/")
        self.assertEqual(resp.status_code, 404)

    def test_recomendador_presupuesto_cero_o_negativo_retorna_400(self):
        """LÍMITE: Presupuesto menor o igual a cero es rechazado."""
        resp = self.client.post(
            "/api/v1/tours/recomendador/",
            data=json.dumps({"presupuesto": "-50000", "cantidad_personas": 2}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 400)
        self.assertIn("mayor a 0", resp.json()["error"])

    def test_recomendador_personas_menor_a_uno_retorna_400(self):
        """LÍMITE: Cantidad de viajeros menor a 1 es rechazada."""
        resp = self.client.post(
            "/api/v1/tours/recomendador/",
            data=json.dumps({"presupuesto": "400000", "cantidad_personas": 0}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 400)
        self.assertIn("al menos 1", resp.json()["error"])
