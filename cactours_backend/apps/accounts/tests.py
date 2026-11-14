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

    def test_revocacion_tokens_en_logout_e_inmediata_invalidacion(self):
        """Valida que tras hacer logout, los tokens de acceso y refresh queden revocados en la lista negra."""
        user, _, _ = AccountService.registrar_cliente(
            nombre="Pedro",
            apellido="Reyes",
            identificacion="77889900",
            correo="pedro@example.com",
            telefono="3007788990",
            password="PasswordPedro123!",
        )

        login_resp = self.client.post(
            "/api/v1/auth/login/",
            data=json.dumps({"correo": "pedro@example.com", "password": "PasswordPedro123!"}),
            content_type="application/json",
        )
        tokens = login_resp.json()["data"]["tokens"]
        access_token = tokens["access"]
        refresh_token = tokens["refresh"]

        # El token de acceso es válido inicialmente
        me_before = self.client.get(
            "/api/v1/auth/me/",
            HTTP_AUTHORIZATION=f"Bearer {access_token}",
        )
        self.assertEqual(me_before.status_code, 200)

        # Cierre de sesión enviando access token y refresh token
        logout_resp = self.client.post(
            "/api/v1/auth/logout/",
            data=json.dumps({"refresh": refresh_token}),
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {access_token}",
        )
        self.assertEqual(logout_resp.status_code, 200)

        # 1. El token de acceso debe ser rechazado inmediatamente con 401
        me_after = self.client.get(
            "/api/v1/auth/me/",
            HTTP_AUTHORIZATION=f"Bearer {access_token}",
        )
        self.assertEqual(me_after.status_code, 401)

        # 2. El token de refresco debe ser rechazado con 401
        refresh_fail = self.client.post(
            "/api/v1/auth/refresh/",
            data=json.dumps({"refresh": refresh_token}),
            content_type="application/json",
        )
        self.assertEqual(refresh_fail.status_code, 401)

    def test_rotacion_de_refresh_token_revoca_el_anterior(self):
        """Valida que al renovar un token, el refresh anterior quede revocado para prevenir ataques de repetición."""
        user, _, _ = AccountService.registrar_cliente(
            nombre="Sofia",
            apellido="Pardo",
            identificacion="12345678",
            correo="sofia@example.com",
            telefono="3001234560",
            password="PasswordSofia123!",
        )

        login_resp = self.client.post(
            "/api/v1/auth/login/",
            data=json.dumps({"correo": "sofia@example.com", "password": "PasswordSofia123!"}),
            content_type="application/json",
        )
        old_refresh = login_resp.json()["data"]["tokens"]["refresh"]

        # Rotación exitosa
        rot_resp = self.client.post(
            "/api/v1/auth/refresh/",
            data=json.dumps({"refresh": old_refresh}),
            content_type="application/json",
        )
        self.assertEqual(rot_resp.status_code, 200)
        new_refresh = rot_resp.json()["data"]["tokens"]["refresh"]
        self.assertNotEqual(old_refresh, new_refresh)

        # Intentar volver a usar el refresh viejo debe fallar con 401
        replay_resp = self.client.post(
            "/api/v1/auth/refresh/",
            data=json.dumps({"refresh": old_refresh}),
            content_type="application/json",
        )
        self.assertEqual(replay_resp.status_code, 401)


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
