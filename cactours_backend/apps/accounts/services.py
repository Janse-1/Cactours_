"""
Servicios de dominio para Cuentas y Autenticación (`apps.accounts.services`).
Centraliza las reglas de negocio y seguridad para registro, login y perfil.
"""
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.db import transaction
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
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

    @staticmethod
    @transaction.atomic
    def cambiar_password(user: User, *, password_actual: str, password_nuevo: str) -> None:
        """
        Permite a un usuario autenticado cambiar su contraseña actual verificando su validez.
        """
        password_actual = (password_actual or "").strip()
        password_nuevo = (password_nuevo or "").strip()

        if not password_actual or not password_nuevo:
            raise DomainError("Debes ingresar la contraseña actual y la nueva contraseña.")

        if not user.check_password(password_actual):
            raise DomainError("La contraseña actual es incorrecta.", status_code=400)

        if password_actual == password_nuevo:
            raise DomainError("La nueva contraseña no puede ser idéntica a la actual.", status_code=400)

        if len(password_nuevo) < 8:
            raise DomainError("La nueva contraseña debe tener al menos 8 caracteres.")

        validate_password(password_nuevo, user=user)
        user.set_password(password_nuevo)
        user.save(update_fields=["password"])

    @staticmethod
    def solicitar_recuperacion_password(*, correo: str) -> bool:
        """
        Genera un token de un solo uso y envía las instrucciones de restablecimiento.
        SEGURIDAD (OWASP): No revela si el correo está registrado o no en la plataforma
        para evitar ataques de enumeración de usuarios.
        """
        correo = (correo or "").strip().lower()
        if not correo:
            raise DomainError("El correo electrónico es obligatorio.")

        user = User.objects.filter(email__iexact=correo, is_active=True).first()
        if not user:
            # Retorno silencioso: el cliente siempre recibe mensaje de confirmación genérico
            return False

        token = default_token_generator.make_token(user)
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

        asunto = f"{getattr(settings, 'EMAIL_SUBJECT_PREFIX', '')}Restablece tu contraseña"
        mensaje = (
            f"Hola {user.first_name or user.username},\n\n"
            f"Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Cactours.\n\n"
            f"Para continuar con el restablecimiento, usa los siguientes datos de verificación en la app o sitio web:\n"
            f"UID: {uidb64}\n"
            f"Token: {token}\n\n"
            f"Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.\n"
        )

        send_mail(
            asunto,
            mensaje,
            getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@cactours.com"),
            [user.email],
            fail_silently=True,
        )
        return True

    @staticmethod
    @transaction.atomic
    def confirmar_recuperacion_password(*, uidb64: str, token: str, password_nuevo: str) -> User:
        """
        Verifica el token de seguridad temporal y aplica la nueva contraseña de forma atómica.
        """
        uidb64 = (uidb64 or "").strip()
        token = (token or "").strip()
        password_nuevo = (password_nuevo or "").strip()

        if not uidb64 or not token or not password_nuevo:
            raise DomainError("UID, token y la nueva contraseña son obligatorios.")

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.filter(pk=uid, is_active=True).first()
        except (TypeError, ValueError, OverflowError):
            user = None

        if not user or not default_token_generator.check_token(user, token):
            raise DomainError(
                "El enlace o token de restablecimiento es inválido o ha expirado. Por favor solicita uno nuevo.",
                status_code=400,
            )

        if len(password_nuevo) < 8:
            raise DomainError("La nueva contraseña debe tener al menos 8 caracteres.")

        validate_password(password_nuevo, user=user)
        user.set_password(password_nuevo)
        user.save(update_fields=["password"])
        return user

