"""
Modelos del dominio de Catálogo Turístico (`apps.tours`).
Reemplaza `Tour`, `Opcion`, `ImagenTour` y elimina la tabla huérfana `ToursOpc`
de la antigua app `core`, añadiendo estados tipados, cupos, duración y validaciones.
"""
from decimal import Decimal
from django.core.validators import MinValueValidator
from django.db import models
from django.utils.text import slugify
from apps.common.models import TimeStampedModel


class EstadoTour(models.TextChoices):
    BORRADOR = "BORRADOR", "Borrador"
    PUBLICADO = "PUBLICADO", "Publicado"
    INACTIVO = "INACTIVO", "Inactivo"


class OpcionTour(TimeStampedModel):
    """Servicio o adición opcional para un tour (transporte privado, alimentación, guía, etc.)."""

    nombre_op = models.CharField(max_length=80, verbose_name="Nombre de la opción")
    descripcion = models.TextField(blank=True, default="", verbose_name="Descripción")
    precio_adic = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
        verbose_name="Precio adicional (COP)",
    )
    cobro_por_persona = models.BooleanField(
        default=True,
        verbose_name="¿Se cobra por cada persona?",
    )
    activa = models.BooleanField(default=True, verbose_name="Opción activa")

    class Meta:
        verbose_name = "Opción de Tour"
        verbose_name_plural = "Opciones de Tour"
        ordering = ["precio_adic", "nombre_op"]

    def __str__(self) -> str:
        return f"{self.nombre_op} (+${self.precio_adic:,.2f} COP)"


class Tour(TimeStampedModel):
    """Paquete o experiencia turística ofrecida por Cactours."""

    nombre_tour = models.CharField(max_length=100, verbose_name="Nombre del tour")
    slug = models.SlugField(max_length=120, unique=True, blank=True, verbose_name="Slug URL")
    descripcion = models.TextField(verbose_name="Descripción detallada")
    ciudad_destino = models.CharField(max_length=80, verbose_name="Ciudad o destino principal")
    duracion_dias = models.PositiveSmallIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name="Duración (días)",
    )
    cupo_maximo = models.PositiveSmallIntegerField(
        default=20,
        validators=[MinValueValidator(1)],
        verbose_name="Cupo máximo por salida",
    )
    costo = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        verbose_name="Precio base por persona (COP)",
    )
    estado = models.CharField(
        max_length=20,
        choices=EstadoTour.choices,
        default=EstadoTour.PUBLICADO,
        verbose_name="Estado de publicación",
    )
    opciones = models.ManyToManyField(
        OpcionTour,
        blank=True,
        related_name="tours",
        verbose_name="Opciones adicionales disponibles",
    )
    imagen = models.ImageField(
        upload_to="tours/",
        blank=True,
        null=True,
        verbose_name="Imagen de portada",
    )

    class Meta:
        verbose_name = "Tour"
        verbose_name_plural = "Tours"
        ordering = ["nombre_tour"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.nombre_tour) or "tour"
            slug_candidate = base_slug
            counter = 1
            while Tour.objects.filter(slug=slug_candidate).exclude(pk=self.pk).exists():
                counter += 1
                slug_candidate = f"{base_slug}-{counter}"
            self.slug = slug_candidate
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.nombre_tour} - {self.ciudad_destino}"


class TourSalida(TimeStampedModel):
    """Cupo disponible para una salida concreta de un tour en una fecha."""

    tour = models.ForeignKey(
        Tour,
        on_delete=models.PROTECT,
        related_name="salidas",
        verbose_name="Tour",
    )
    fecha = models.DateField(verbose_name="Fecha de salida")
    hora = models.TimeField(null=True, blank=True, verbose_name="Hora de salida")
    cupo_total = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name="Cupo total",
    )
    cupo_disponible = models.PositiveSmallIntegerField(
        default=0,
        verbose_name="Cupo disponible",
    )
    activa = models.BooleanField(default=True, verbose_name="Salida activa")

    class Meta:
        verbose_name = "Salida de tour"
        verbose_name_plural = "Salidas de tour"
        unique_together = ("tour", "fecha")
        ordering = ["fecha", "hora"]

    def save(self, *args, **kwargs):
        if not self.pk:
            self.cupo_disponible = self.cupo_total
        super().save(*args, **kwargs)


class ImagenTour(TimeStampedModel):
    """Galería de imágenes asociadas a un Tour."""

    tour = models.ForeignKey(
        Tour,
        related_name="imagenes",
        on_delete=models.CASCADE,
        verbose_name="Tour",
    )
    imagen = models.ImageField(upload_to="tours/", verbose_name="Archivo de imagen")
    descripcion = models.CharField(
        max_length=120,
        blank=True,
        default="",
        verbose_name="Texto alternativo / descripción",
    )
    orden = models.PositiveSmallIntegerField(default=0, verbose_name="Orden de aparición")

    class Meta:
        verbose_name = "Imagen de Tour"
        verbose_name_plural = "Imágenes de Tours"
        ordering = ["orden", "id"]

    def __str__(self) -> str:
        return self.descripcion or f"Imagen de {self.tour.nombre_tour}"
