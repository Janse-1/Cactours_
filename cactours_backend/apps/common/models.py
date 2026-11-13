"""Modelos base reutilizables para todas las entidades del dominio."""
from django.db import models


class TimeStampedModel(models.Model):
    """Modelo abstracto con marcas de tiempo de creación y actualización."""

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Última actualización")

    class Meta:
        abstract = True
