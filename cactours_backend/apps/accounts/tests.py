"""Pruebas de negocio y seguridad del módulo de cuentas (`apps.accounts`)."""
import json
from django.test import TestCase
from .services import AccountService


class AccountsDomainAndApiTests(TestCase):
    def test_registro_no_otorga_staff_por_dominio_cactours(self):
        """SEGURIDAD: Un correo @cactours.com autorregistrado NUNCA debe recibir is_staff=True."""
        user, persona, cliente = AccountService.registrar_cliente(
            nombre="Intruso",
            apellido="Prueba",
            identificacion="100200300",
            correo="hacker@cactours.com",
            telefono="3001234567",
            password="PasswordSeguro123!",
        )
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertEqual(persona.identificacion, "100200300")
        self.assertEqual(cliente.contador_reservas, 0)

    def test_api_register_login_and_me_flow(self):
        reg_resp = self.client.post(
            "/api/v1/auth/register/",
            data=json.dumps(
                {
                    "nombre": "Ana",
                    "apellido": "Wayuu",
                    "identificacion": "99887766",
                    "correo": "ana@example.com",
                    "telefono": "3109998877",
                    "password": "MiPasswordSeguro2026!",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(reg_resp.status_code, 201)
        body = reg_resp.json()
        self.assertTrue(body["ok"])
        access_token = body["data"]["tokens"]["access"]

        me_resp = self.client.get(
            "/api/v1/auth/me/",
            HTTP_AUTHORIZATION=f"Bearer {access_token}",
        )
        self.assertEqual(me_resp.status_code, 200)
        self.assertEqual(me_resp.json()["data"]["user"]["persona"]["nombre"], "Ana")

    def test_api_register_returns_password_validation_message(self):
        response = self.client.post(
            "/api/v1/auth/register/",
            data=json.dumps(
                {
                    "nombre": "Ana",
                    "apellido": "Wayuu",
                    "identificacion": "99887766",
                    "correo": "ana@example.com",
                    "telefono": "3109998877",
                    "password": "password",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertNotEqual(response.json()["error"], "Error de validación en los datos enviados.")
        self.assertIn("non_field_errors", response.json()["details"])

    def test_registro_correo_duplicado_retorna_400(self):
        """NEGATIVA: No permite registrar dos usuarios con el mismo correo."""
        payload = {
            "nombre": "Usuario1",
            "apellido": "Test",
            "identificacion": "111222333",
            "correo": "duplicado@example.com",
            "telefono": "3001112233",
            "password": "PasswordSeguro123!",
        }
        resp1 = self.client.post("/api/v1/auth/register/", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(resp1.status_code, 201)

        payload2 = payload.copy()
        payload2["identificacion"] = "444555666"
        resp2 = self.client.post("/api/v1/auth/register/", data=json.dumps(payload2), content_type="application/json")
        self.assertEqual(resp2.status_code, 400)
        self.assertIn("correo electrónico ya se encuentra registrado", resp2.json()["error"])

    def test_registro_campos_faltantes_retorna_400(self):
        """NEGATIVA: Campos incompletos deben ser rechazados."""
        resp = self.client.post(
            "/api/v1/auth/register/",
            data=json.dumps({"nombre": "Incompleto"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 400)
        self.assertIn("obligatorios", resp.json()["error"])

    def test_login_credenciales_incorrectas_retorna_401(self):
        """NEGATIVA: Intento de inicio de sesión con clave errónea."""
        AccountService.registrar_cliente(
            nombre="Carlos",
            apellido="Ríos",
            identificacion="55566677",
            correo="carlos.rios@example.com",
            telefono="3009990011",
            password="PasswordSeguro123!",
        )
        resp = self.client.post(
            "/api/v1/auth/login/",
            data=json.dumps({"correo": "carlos.rios@example.com", "password": "ClaveIncorrecta"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 401)
        self.assertFalse(resp.json()["ok"])

    def test_me_sin_token_retorna_401(self):
        """SEGURIDAD: Acceso al perfil sin token es bloqueado."""
        resp = self.client.get("/api/v1/auth/me/")
        self.assertEqual(resp.status_code, 401)

    def test_me_patch_actualiza_perfil_exitosamente(self):
        """POSITIVA: Actualización parcial de campos de contacto del usuario."""
        user, _, _ = AccountService.registrar_cliente(
            nombre="Diana",
            apellido="Palacio",
            identificacion="77889900",
            correo="diana@example.com",
            telefono="3001122334",
            password="PasswordSeguro123!",
        )
        login_resp = self.client.post(
            "/api/v1/auth/login/",
            data=json.dumps({"correo": "diana@example.com", "password": "PasswordSeguro123!"}),
            content_type="application/json",
        )
        token = login_resp.json()["data"]["tokens"]["access"]

        patch_resp = self.client.patch(
            "/api/v1/auth/me/",
            data=json.dumps({"telefono": "3150009988", "apellido": "Palacios"}),
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )
        self.assertEqual(patch_resp.status_code, 200)
        persona_data = patch_resp.json()["data"]["user"]["persona"]
        self.assertEqual(persona_data["telefono"], "3150009988")
        self.assertEqual(persona_data["apellido"], "Palacios")

    def test_refresh_token_invalido_retorna_401(self):
        """NEGATIVA: Renovación de sesión con refresh token apócrifo."""
        resp = self.client.post(
            "/api/v1/auth/refresh/",
            data=json.dumps({"refresh": "token_totalmente_falso_123"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 401)

    def test_metodo_http_no_permitido_retorna_405(self):
        """LÍMITE: Endpoint de login no acepta peticiones GET o DELETE."""
        resp = self.client.get("/api/v1/auth/login/")
        self.assertEqual(resp.status_code, 405)
