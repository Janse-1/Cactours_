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
