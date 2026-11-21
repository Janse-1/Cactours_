"""
Modelos del dominio de Reservas (`apps.bookings`).
Unifica las antiguas tablas duplicadas (`Reserva`, `ReservaUsuario` y `Viaje`)
en una única fuente de verdad auditable (`Reserva` + `ReservaOpcion`).
"""
import uuid
from decimal import Decimal
from django.core.validators import MinValueValidator
from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.common.models import TimeStampedModel


class EstadoReserva(models.TextChoices):
    PENDIENTE = "PENDIENTE", "Solicitud pendiente"
    CONFIRMADA = "CONFIRMADA", "Reserva confirmada"
    CANCELADA = "CANCELADA", "Cancelada"
    COMPLETADA = "COMPLETADA", "Viaje completado"


class MedioPagoPreferido(models.TextChoices):
    TARJETA = "TARJETA", "Tarjeta de Crédito / Débito"
    TRANSFERENCIA = "TRANSFERENCIA", "Transferencia Bancaria / PSE"
    PAYPAL = "PAYPAL", "PayPal"
    EFECTIVO = "EFECTIVO", "Efectivo en agencia"


def _generar_codigo_reserva() -> str:
    fecha_str = timezone.now().strftime("%Y%m%d")
    sufijo = uuid.uuid4().hex[:6].upper()
    return f"CAC-{fecha_str}-{sufijo}"


class Reserva(TimeStampedModel):
    """
    Entidad canónica de solicitud de reserva turística.
    Los montos (`subtotal_base`, `subtotal_opciones`, `costo_total`) son calculados
    exclusivamente en el servidor por `BookingService`.
    """

    codigo_reserva = models.CharField(
        max_length=25,
        unique=True,
        default=_generar_codigo_reserva,
        editable=False,
        verbose_name="Código de reserva",
    )
    cliente = models.ForeignKey(
        "accounts.Cliente",
        on_delete=models.PROTECT,
        related_name="reservas",
        verbose_name="Cliente",
    )
    tour = models.ForeignKey(
        "tours.Tour",
        on_delete=models.PROTECT,
        related_name="reservas",
        verbose_name="Tour reservado",
    )
    salida = models.ForeignKey(
        "tours.TourSalida",
        on_delete=models.PROTECT,
        related_name="reservas",
        null=True,
        blank=True,
        verbose_name="Salida reservada",
    )
    lugar_salida = models.CharField(max_length=120, verbose_name="Lugar de salida")
    destino = models.CharField(max_length=120, verbose_name="Ciudad / Destino")
    fecha = models.DateField(verbose_name="Fecha programada del tour")
    hora = models.TimeField(verbose_name="Hora de registro / salida")
    cant_personas = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name="Cantidad de personas",
    )
    medio_pago = models.CharField(
        max_length=25,
        choices=MedioPagoPreferido.choices,
        default=MedioPagoPreferido.TRANSFERENCIA,
        verbose_name="Medio de pago preferido",
    )
    estado = models.CharField(
        max_length=20,
        choices=EstadoReserva.choices,
        default=EstadoReserva.PENDIENTE,
        verbose_name="Estado de la solicitud",
    )
    subtotal_base = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name="Subtotal base del tour (COP)",
    )
    subtotal_opciones = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name="Subtotal adiciones (COP)",
    )
    costo_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Costo total calculado (COP)",
    )
    comentarios = models.TextField(blank=True, default="", verbose_name="Comentarios o requerimientos")
    opciones_seleccionadas = models.ManyToManyField(
        "tours.OpcionTour",
        through="ReservaOpcion",
        related_name="reservas",
        blank=True,
        verbose_name="Opciones adicionales contratadas",
    )

    class Meta:
        verbose_name = "Reserva"
        verbose_name_plural = "Reservas"
        ordering = ["-fecha", "-created_at"]

    def __str__(self) -> str:
        return f"{self.codigo_reserva} - {self.tour.nombre_tour} ({self.get_estado_display()})"


class ReservaOpcion(TimeStampedModel):
    """
    Detalle histórico de opciones adicionales seleccionadas en una reserva.
    Conserva una instantánea (`snapshot`) del precio al momento de reservar.
    """

    reserva = models.ForeignKey(
        Reserva,
        on_delete=models.CASCADE,
        related_name="detalle_opciones",
        verbose_name="Reserva",
    )
    opcion = models.ForeignKey(
        "tours.OpcionTour",
        on_delete=models.PROTECT,
        related_name="usos_en_reservas",
        verbose_name="Opción",
    )
    nombre_opcion = models.CharField(max_length=80, verbose_name="Nombre en el momento de reserva")
    precio_unitario = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Precio unitario aplicado (COP)",
    )
    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Subtotal aplicado (COP)",
    )

    class Meta:
        verbose_name = "Opción de Reserva"
        verbose_name_plural = "Opciones de Reserva"
        unique_together = ("reserva", "opcion")

    def __str__(self) -> str:
        return f"{self.nombre_opcion} en {self.reserva.codigo_reserva}"


class CambioEstadoReserva(TimeStampedModel):
    """Registro auditable de cada transición de estado de una reserva."""

    reserva = models.ForeignKey(
        Reserva,
        on_delete=models.PROTECT,
        related_name="cambios_estado",
        verbose_name="Reserva",
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="cambios_estado_reserva",
        verbose_name="Usuario",
    )
    estado_anterior = models.CharField(max_length=20, choices=EstadoReserva.choices)
    estado_nuevo = models.CharField(max_length=20, choices=EstadoReserva.choices)
    motivo = models.TextField(blank=True, default="")

    class Meta:
        verbose_name = "Cambio de estado de reserva"
        verbose_name_plural = "Cambios de estado de reserva"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.reserva.codigo_reserva}: {self.estado_anterior} -> {self.estado_nuevo}"
