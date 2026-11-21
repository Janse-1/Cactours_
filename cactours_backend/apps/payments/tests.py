"""Pruebas del módulo de pagos (`apps.payments`)."""
import json
from decimal import Decimal
from django.test import TestCase
from apps.accounts.services import AccountService
from apps.bookings.services import BookingService
from apps.common.http import DomainError
from apps.tours.models import EstadoTour, Tour
from .models import EstadoTransaccion, TransaccionPago
from .services import PaymentService


class PaymentsServiceTests(TestCase):
    def setUp(self):
        self.user_a, _, _ = AccountService.registrar_cliente(
            nombre="Pedro",
            apellido="Paz",
            identificacion="33333333",
            correo="pedro@example.com",
            telefono="3007778899",
            password="PasswordSeguro123!",
        )
        self.user_b, _, _ = AccountService.registrar_cliente(
            nombre="Marta",
            apellido="Soto",
            identificacion="44444444",
            correo="marta@example.com",
            telefono="3008889900",
            password="PasswordSeguro123!",
        )
        self.tour = Tour.objects.create(
            nombre_tour="Taganga Express",
            descripcion="Día de playa y careteo",
            ciudad_destino="Santa Marta",
            duracion_dias=1,
            cupo_maximo=15,
            costo=Decimal("100000.00"),
            estado=EstadoTour.PUBLICADO,
        )
        self.reserva = BookingService.crear_solicitud_reserva(
            user=self.user_a,
            tour_id=self.tour.id,
            lugar_salida="Santa Marta",
            cant_personas=2,
            medio_pago="TARJETA",
        )

    def test_registro_intencion_pago_usa_costo_de_reserva(self):
        tx = PaymentService.registrar_intencion_pago(
            user=self.user_a,
            reserva_id=self.reserva.id,
            proveedor="WOMPI",
        )
        self.assertEqual(tx.monto, Decimal("200000.00"))
        self.assertEqual(tx.proveedor, "WOMPI")
        self.assertEqual(tx.estado, EstadoTransaccion.PENDIENTE)

    def test_cliente_no_puede_pagar_reserva_ajena_retorna_403(self):
        """SEGURIDAD: Usuario B no puede registrar intención de pago sobre la reserva de Usuario A."""
        with self.assertRaises(DomainError) as ctx:
            PaymentService.registrar_intencion_pago(
                user=self.user_b,
                reserva_id=self.reserva.id,
                proveedor="WOMPI",
            )
        self.assertEqual(ctx.exception.status_code, 403)
        self.assertIn("reserva ajena", str(ctx.exception))

    def test_pago_reserva_inexistente_retorna_404(self):
        """LÍMITE: Pagar reserva inexistente lanza 404."""
        with self.assertRaises(DomainError) as ctx:
            PaymentService.registrar_intencion_pago(
                user=self.user_a,
                reserva_id=99999,
                proveedor="WOMPI",
            )
        self.assertEqual(ctx.exception.status_code, 404)

    def test_api_list_create_payment_flow(self):
        """POSITIVA: Flujo completo a través de la API REST /api/v1/payments/."""
        login_resp = self.client.post(
            "/api/v1/auth/login/",
            data=json.dumps({"correo": "pedro@example.com", "password": "PasswordSeguro123!"}),
            content_type="application/json",
        )
        token = login_resp.json()["data"]["tokens"]["access"]

        # Crear intención de pago
        create_resp = self.client.post(
            "/api/v1/payments/",
            data=json.dumps({"reserva_id": self.reserva.id, "proveedor": "WOMPI"}),
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )
        self.assertEqual(create_resp.status_code, 201)
        tx_data = create_resp.json()["data"]["transaccion"]
        self.assertEqual(tx_data["monto"], "200000.00")
        self.assertEqual(tx_data["proveedor"], "WOMPI")

        # Consultar historial de pagos del usuario
        list_resp = self.client.get(
            "/api/v1/payments/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )
        self.assertEqual(list_resp.status_code, 200)
        self.assertEqual(list_resp.json()["data"]["count"], 1)

    def test_pago_sin_token_retorna_401(self):
        """SEGURIDAD: Intentar registrar pago sin autenticación."""
        resp = self.client.post(
            "/api/v1/payments/",
            data=json.dumps({"reserva_id": self.reserva.id, "proveedor": "WOMPI"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 401)
