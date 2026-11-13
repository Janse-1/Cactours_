"""Pruebas del módulo de pagos (`apps.payments`)."""
from decimal import Decimal
from django.test import TestCase
from apps.accounts.services import AccountService
from apps.bookings.services import BookingService
from apps.tours.models import EstadoTour, Tour
from .services import PaymentService


class PaymentsServiceTests(TestCase):
    def test_registro_intencion_pago_usa_costo_de_reserva(self):
        user, _, _ = AccountService.registrar_cliente(
            nombre="Pedro",
            apellido="Paz",
            identificacion="33333333",
            correo="pedro@example.com",
            telefono="3007778899",
            password="PasswordSeguro123!",
        )
        tour = Tour.objects.create(
            nombre_tour="Taganga Express",
            descripcion="Día de playa y careteo",
            ciudad_destino="Santa Marta",
            duracion_dias=1,
            cupo_maximo=15,
            costo=Decimal("100000.00"),
            estado=EstadoTour.PUBLICADO,
        )
        reserva = BookingService.crear_solicitud_reserva(
            user=user,
            tour_id=tour.id,
            lugar_salida="Santa Marta",
            cant_personas=2,
            medio_pago="TARJETA",
        )
        tx = PaymentService.registrar_intencion_pago(
            user=user,
            reserva_id=reserva.id,
            proveedor="WOMPI",
        )
        self.assertEqual(tx.monto, Decimal("200000.00"))
        self.assertEqual(tx.proveedor, "WOMPI")
