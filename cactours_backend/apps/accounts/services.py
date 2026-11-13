"""
Servicios de dominio para Cuentas y Autenticación (`apps.accounts.services`).
Centraliza las reglas de negocio y seguridad para registro, login y perfil.
"""
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from apps.common.http import DomainError
from .models import Cliente, Persona


class AccountService:
    """Casos de uso de cuentas de usuario y perfiles."""

    @staticmethod
    @transaction.atomic
    def registrar_cliente(
        *,
        nombre: str,
        apellido: str,
        identificacion: str,
        correo: str,
        telefono: str,
        password: str,
    ) -> tuple[User, Persona, Cliente]:
        """
        Registra un nuevo cliente de manera atómica.
        SEGURIDAD: Nunca otorga privilegios administrativos (`is_staff`) según el dominio
        del correo autorregistrado (corrige vulnerabilidad previa en `core/views.py`).
        """
        nombre = (nombre or "").strip()
        apellido = (apellido or "").strip()
        identificacion = (identificacion or "").strip()
        correo = (correo or "").strip().lower()
        telefono = (telefono or "").strip()

        if not all([nombre, apellido, identificacion, correo, telefono, password]):
            raise DomainError("Todos los campos del registro son obligatorios.")

        if User.objects.filter(email__iexact=correo).exists() or Persona.objects.filter(correo__iexact=correo).exists():
            raise DomainError("Este correo electrónico ya se encuentra registrado.")

        if Persona.objects.filter(identificacion=identificacion).exists():
            raise DomainError("Este número de identificación ya se encuentra registrado.")

        if len(password) < 8:
            raise DomainError("La contraseña debe tener al menos 8 caracteres.")

        user = User(
            username=correo,
            email=correo,
            first_name=nombre,
            last_name=apellido,
            is_staff=False,
            is_superuser=False,
        )
        validate_password(password, user=user)
        user.set_password(password)
        user.save()

        persona = Persona.objects.create(
            user=user,
            nombre=nombre,
            apellido=apellido,
            identificacion=identificacion,
            correo=correo,
            telefono=telefono,
        )
        cliente = Cliente.objects.create(persona=persona, contador_reservas=0)
        return user, persona, cliente

    @staticmethod
    def autenticar_usuario( request, *, identificador: str, password: str) -> User:
        """
        Autentica un usuario mediante correo o nombre de usuario.
        """
        identificador = (identificador or "").strip()
        if not identificador or not password:
            raise DomainError("Debes ingresar tu usuario/correo y contraseña.")

        username = identificador
        if "@" in identificador:
            matched_user = User.objects.filter(email__iexact=identificador).first()
            if matched_user:
                username = matched_user.username

        user = authenticate(request, username=username, password=password)
        if user is None:
            raise DomainError("Credenciales inválidas. Verifica tu correo y contraseña.", status_code=401)
        if not user.is_active:
            raise DomainError("Esta cuenta se encuentra desactivada.", status_code=403)
        return user

    @staticmethod
    @transaction.atomic
    def actualizar_perfil(user: User, *, nombre: str | None = None, apellido: str | None = None, telefono: str | None = None) -> Persona:
        """Actualiza los datos de contacto permitidos del perfil del usuario."""
        persona = Persona.objects.filter(user=user).first()
        if not persona:
            raise DomainError("El usuario no tiene un perfil de persona asociado.", status_code=404)

        if nombre is not None and nombre.strip():
            persona.nombre = nombre.strip()
            user.first_name = persona.nombre
        if apellido is not None and apellido.strip():
            persona.apellido = apellido.strip()
            user.last_name = persona.apellido
        if telefono is not None and telefono.strip():
            persona.telefono = telefono.strip()

        user.save(update_fields=["first_name", "last_name"])
        persona.save()
        return persona
