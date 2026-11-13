"""Pruebas de negocio y permisos del módulo de reservas (`apps.bookings`)."""
import json
from decimal import Decimal
from django.test import TestCase
from apps.accounts.services import AccountService
from apps.tours.models import EstadoTour, OpcionTour, Tour


class BookingsBusinessLogicTests(TestCase):
    def setUp(self):
        self.user_a, _, _ = AccountService.registrar_cliente(
            nombre="Carlos",
            apellido="Gómez",
            identificacion="11111111",
            correo="carlos@example.com",
            telefono="3001112233",
            password="PasswordSeguro123!",
        )
        self.user_b, _, _ = AccountService.registrar_cliente(
            nombre="Laura",
            apellido="Díaz",
            identificacion="22222222",
            correo="laura@example.com",
            telefono="3004445566",
            password="PasswordSeguro123!",
        )
        self.opcion_transporte = OpcionTour.objects.create(
            nombre_op="Transporte 4x4 Privado",
            descripcion="Recogida en hotel",
            precio_adic=Decimal("50000.00"),
            cobro_por_persona=True,
        )
        self.tour = Tour.objects.create(
            nombre_tour="Montes de Oca",
            descripcion="Reserva natural y senderismo",
            ciudad_destino="Maicao - La Guajira",
            duracion_dias=1,
            cupo_maximo=10,
            costo=Decimal("120000.00"),
            estado=EstadoTour.PUBLICADO,
        )
        self.tour.opciones.add(self.opcion_transporte)

    def test_calculo_de_precio_en_servidor_y_aislamiento_entre_clientes(self):
        login_a = self.client.post(
            "/api/v1/auth/login/",
            data=json.dumps({"correo": "carlos@example.com", "password": "PasswordSeguro123!"}),
            content_type="application/json",
        ).json()
        token_a = login_a["data"]["tokens"]["access"]

        login_b = self.client.post(
            "/api/v1/auth/login/",
            data=json.dumps({"correo": "laura@example.com", "password": "PasswordSeguro123!"}),
            content_type="application/json",
        ).json()
        token_b = login_b["data"]["tokens"]["access"]

        # Intentar enviar un costo falso desde el cliente: el servidor debe ignorarlo y calcular (120000 + 50000) * 3 = 510000.00
        create_resp = self.client.post(
            "/api/v1/bookings/",
            data=json.dumps(
                {
                    "tour_id": self.tour.id,
                    "lugar_salida": "Riohacha - Centro",
                    "cant_personas": 3,
                    "medio_pago": "TRANSFERENCIA",
                    "opciones_ids": [self.opcion_transporte.id],
                    "costo_total": "1.00",
                    "comentarios": "Salida temprano",
                }
            ),
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {token_a}",
        )
        self.assertEqual(create_resp.status_code, 201)
        reserva_data = create_resp.json()["data"]["reserva"]
        self.assertEqual(reserva_data["subtotal_base"], "360000.00")
        self.assertEqual(reserva_data["subtotal_opciones"], "150000.00")
        self.assertEqual(reserva_data["costo_total"], "510000.00")

        # Usuario B no puede ver ni cancelar la reserva del Usuario A
        detail_b = self.client.get(
            f"/api/v1/bookings/{reserva_data['id']}/",
            HTTP_AUTHORIZATION=f"Bearer {token_b}",
        )
        self.assertEqual(detail_b.status_code, 404)
