"""
Modelos del dominio de Cuentas (`apps.accounts`).
Refactoriza los antiguos modelos `Persona`, `Cliente` y `Empleado` de `core`,
eliminando la dependencia frágil de `TablaMaestra` mediante `TextChoices` tipados
y garantizando relaciones `OneToOneField` consistentes.
"""
from django.contrib.auth.models import User
from django.db import models
from apps.common.models import TimeStampedModel


class EstadoEmpleado(models.TextChoices):
    ACTIVO = "ACTIVO", "Activo"
    INACTIVO = "INACTIVO", "Inactivo"
    LICENCIA = "LICENCIA", "En licencia"


class Persona(TimeStampedModel):
    """Datos personales asociados de forma única a una cuenta de usuario."""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="persona",
        verbose_name="Usuario",
    )
    nombre = models.CharField(max_length=80, verbose_name="Nombre")
    apellido = models.CharField(max_length=80, verbose_name="Apellido")
    identificacion = models.CharField(
        max_length=30,
        unique=True,
        verbose_name="Documento de identificación",
    )
    correo = models.EmailField(max_length=120, unique=True, verbose_name="Correo electrónico")
    telefono = models.CharField(max_length=20, verbose_name="Teléfono de contacto")

    class Meta:
        verbose_name = "Persona"
        verbose_name_plural = "Personas"
        ordering = ["apellido", "nombre"]

    def __str__(self) -> str:
        return f"{self.nombre} {self.apellido} ({self.identificacion})"


class Cliente(TimeStampedModel):
    """Perfil de cliente turístico asociado a una Persona."""

    persona = models.OneToOneField(
        Persona,
        on_delete=models.CASCADE,
        related_name="perfil_cliente",
        verbose_name="Persona",
    )
    contador_reservas = models.PositiveIntegerField(
        default=0,
        verbose_name="Total de reservas realizadas",
    )

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"

    def __str__(self) -> str:
        return f"Cliente: {self.persona}"


class Empleado(TimeStampedModel):
    """Perfil de colaborador/operador de la agencia Cactours."""

    persona = models.OneToOneField(
        Persona,
        on_delete=models.CASCADE,
        related_name="perfil_empleado",
        verbose_name="Persona",
    )
    fecha_contratacion = models.DateField(verbose_name="Fecha de contratación")
    cargo = models.CharField(max_length=80, verbose_name="Cargo")
    salario = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Salario mensual (COP)",
    )
    estado = models.CharField(
        max_length=20,
        choices=EstadoEmpleado.choices,
        default=EstadoEmpleado.ACTIVO,
        verbose_name="Estado laboral",
    )

    class Meta:
        verbose_name = "Empleado"
        verbose_name_plural = "Empleados"

    def __str__(self) -> str:
        return f"{self.persona} - {self.cargo} ({self.get_estado_display()})"


class TokenRevocado(TimeStampedModel):
    """
    Lista negra (Blacklist) de tokens revocados antes de su expiración natural.
    Permite invalidar access tokens y refresh tokens en cierre de sesión (logout) o rotación.
    """

    token_hash = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        verbose_name="Hash SHA-256 del token",
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="tokens_revocados",
        null=True,
        blank=True,
        verbose_name="Usuario propietario",
    )
    motivo = models.CharField(
        max_length=50,
        default="LOGOUT",
        verbose_name="Motivo de revocación",
    )
    expiracion = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha de expiración estimada",
    )

    class Meta:
        verbose_name = "Token Revocado"
        verbose_name_plural = "Tokens Revocados"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Token revocado ({self.motivo}) - {self.token_hash[:12]}..."

