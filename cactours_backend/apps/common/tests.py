"""Pruebas del contrato HTTP común de Cactours."""

from django.test import TestCase


class OpenAPIContractTests(TestCase):
    def test_schema_endpoint_expone_el_contrato_v1(self):
        response = self.client.get(
            "/api/v1/schema/",
            HTTP_ACCEPT="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("application/json", response["Content-Type"])
        self.assertIn("openapi", response.json())
        self.assertIn("paths", response.json())

    def test_documentacion_swagger_y_redoc_estan_disponibles(self):
        swagger = self.client.get("/api/v1/docs/")
        redoc = self.client.get("/api/v1/redoc/")

        self.assertEqual(swagger.status_code, 200)
        self.assertContains(swagger, "swagger-ui")
        self.assertEqual(redoc.status_code, 200)
        self.assertContains(redoc, "redoc")
