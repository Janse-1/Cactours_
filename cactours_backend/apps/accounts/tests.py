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

    def test_cambio_de_password_autenticado(self):
        """Valida que un usuario autenticado pueda cambiar su contraseña de forma segura."""
        user, _, _ = AccountService.registrar_cliente(
            nombre="Mario",
            apellido="Suárez",
            identificacion="55667788",
            correo="mario@example.com",
            telefono="3005556677",
            password="PasswordOriginal123!",
        )

        login_resp = self.client.post(
            "/api/v1/auth/login/",
            data=json.dumps({"correo": "mario@example.com", "password": "PasswordOriginal123!"}),
            content_type="application/json",
        )
        token = login_resp.json()["data"]["tokens"]["access"]

        # Intento con contraseña actual incorrecta
        fail_resp = self.client.post(
            "/api/v1/auth/password-change/",
            data=json.dumps(
                {
                    "password_actual": "ClaveEquivocada123!",
                    "password_nuevo": "NuevaClaveValida123!",
                }
            ),
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )
        self.assertEqual(fail_resp.status_code, 400)

        # Cambio exitoso
        success_resp = self.client.post(
            "/api/v1/auth/password-change/",
            data=json.dumps(
                {
                    "password_actual": "PasswordOriginal123!",
                    "password_nuevo": "NuevaClaveValida123!",
                }
            ),
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )
        self.assertEqual(success_resp.status_code, 200)

        # Verificar que el login ahora funciona con la nueva clave
        new_login = self.client.post(
            "/api/v1/auth/login/",
            data=json.dumps({"correo": "mario@example.com", "password": "NuevaClaveValida123!"}),
            content_type="application/json",
        )
        self.assertEqual(new_login.status_code, 200)

    def test_flujo_recuperacion_de_password_y_antienumeracion(self):
        """Valida el flujo de recuperación por correo y la protección contra enumeración de usuarios."""
        from django.core import mail
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes

        user, _, _ = AccountService.registrar_cliente(
            nombre="Diana",
            apellido="Gómez",
            identificacion="44332211",
            correo="diana@example.com",
            telefono="3004443322",
            password="ClaveInicial123!",
        )

        # 1. Solicitar para usuario inexistente: responde ok=True (anti-enumeración) y no envía correo
        mail.outbox = []
        ghost_resp = self.client.post(
            "/api/v1/auth/password-reset/",
            data=json.dumps({"correo": "noexiste@example.com"}),
            content_type="application/json",
        )
        self.assertEqual(ghost_resp.status_code, 200)
        self.assertTrue(ghost_resp.json()["ok"])
        self.assertEqual(len(mail.outbox), 0)

        # 2. Solicitar para usuario real: envía 1 correo
        reset_req = self.client.post(
            "/api/v1/auth/password-reset/",
            data=json.dumps({"correo": "diana@example.com"}),
            content_type="application/json",
        )
        self.assertEqual(reset_req.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Restablece tu contraseña", mail.outbox[0].subject)

        # 3. Confirmar con token válido
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        confirm_resp = self.client.post(
            "/api/v1/auth/password-reset-confirm/",
            data=json.dumps(
                {
                    "uid": uidb64,
                    "token": token,
                    "password_nuevo": "NuevaClaveDiana2026!",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(confirm_resp.status_code, 200)

        # 4. Iniciar sesión con la nueva clave restablecida
        relogin = self.client.post(
            "/api/v1/auth/login/",
            data=json.dumps({"correo": "diana@example.com", "password": "NuevaClaveDiana2026!"}),
            content_type="application/json",
        )
        self.assertEqual(relogin.status_code, 200)

        # 5. Intentar reutilizar el mismo token ya usado (debe fallar)
        reuse_resp = self.client.post(
            "/api/v1/auth/password-reset-confirm/",
            data=json.dumps(
                {
                    "uid": uidb64,
                    "token": token,
                    "password_nuevo": "OtraClaveMas123!",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(reuse_resp.status_code, 400)

