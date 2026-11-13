"""
Modelos del dominio de Pagos (`apps.payments`).
Mantiene la entidad de pago separada del estado de la reserva y cumple la regla
de seguridad de NUNCA almacenar números de tarjeta, CVV ni datos sensibles en el sistema.
"""
import uuid
from decimal import Decimal
from django.core.validators import MinValueValidator
from django.db import models
from apps.common.models import TimeStampedModel


class EstadoTransaccion(models.TextChoices):
    INICIADA = "INICIADA", "Intención de pago iniciada"
    PENDIENTE = "PENDIENTE", "Pendiente de confirmación bancaria"
    APROBADA = "APROBADA", "Transacción aprobada"
    RECHAZADA = "RECHAZADA", "Transacción rechazada"
    REEMBOLSADA = "REEMBOLSADA", "Reembolsada"


def _generar_referencia_pago() -> str:
    return f"PAY-{uuid.uuid4().hex[:10].upper()}"


class TransaccionPago(TimeStampedModel):
    """Registro auditable de intentos o confirmaciones de pago asociados a una Reserva."""

    referencia_interna = models.CharField(
        max_length=30,
        unique=True,
        default=_generar_referencia_pago,
        editable=False,
        verbose_name="Referencia interna",
    )
    reserva = models.ForeignKey(
        "bookings.Reserva",
        on_delete=models.PROTECT,
        related_name="transacciones",
        verbose_name="Reserva asociada",
    )
    monto = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        verbose_name="Monto (COP)",
    )
    moneda = models.CharField(max_length=10, default="COP", verbose_name="Moneda")
    proveedor = models.CharField(
        max_length=40,
        default="MANUAL_AGENCIA",
        verbose_name="Proveedor / Pasarela (Wompi, PayU, Manual, etc.)",
    )
    referencia_externa = models.CharField(
        max_length=100,
        blank=True,
        default="",
        verbose_name="ID de transacción del proveedor",
    )
    estado = models.CharField(
        max_length=25,
        choices=EstadoTransaccion.choices,
        default=EstadoTransaccion.INICIADA,
        verbose_name="Estado de la transacción",
    )
    notas_verificacion = models.TextField(blank=True, default="", verbose_name="Notas de verificación")

    class Meta:
        verbose_name = "Transacción de Pago"
        verbose_name_plural = "Transacciones de Pago"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.referencia_interna} ({self.reserva.codigo_reserva}) - {self.get_estado_display()}"
