"""Endpoints REST para Autenticación y Perfil (`/api/v1/auth/`)."""
from django.contrib.auth import login, logout
from apps.common.http import DomainError, api_handler, api_response, parse_json_body
from apps.common.tokens import issue_token_pair, rotate_from_refresh_token, revoke_token
from .serializers import serialize_user_profile
from .services import AccountService


@api_handler(["POST"])
def register_view(request):
    """POST /api/v1/auth/register/ - Registro de nuevo cliente y emisión de tokens."""
    payload = parse_json_body(request)
    user, _, _ = AccountService.registrar_cliente(
        nombre=payload.get("nombre", ""),
        apellido=payload.get("apellido", ""),
        identificacion=payload.get("identificacion", ""),
        correo=payload.get("correo") or payload.get("email", ""),
        telefono=payload.get("telefono", ""),
        password=payload.get("password", ""),
    )
    tokens = issue_token_pair(user)
    return api_response(
        {
            "user": serialize_user_profile(user),
            "tokens": tokens,
        },
        message="Cuenta creada exitosamente.",
        status=201,
    )


@api_handler(["POST"])
def login_view(request):
    """POST /api/v1/auth/login/ - Inicio de sesión para Web (Vue.js) y Móvil (React Native)."""
    payload = parse_json_body(request)
    identificador = payload.get("username") or payload.get("correo") or payload.get("email") or ""
    password = payload.get("password") or ""

    user = AccountService.autenticar_usuario(request, identificador=identificador, password=password)
    login(request, user)
    tokens = issue_token_pair(user)
    return api_response(
        {
            "user": serialize_user_profile(user),
            "tokens": tokens,
        },
        message="Sesión iniciada correctamente.",
    )


@api_handler(["POST"])
def refresh_token_view(request):
    """POST /api/v1/auth/refresh/ - Renovación de token de acceso mediante refresh token."""
    payload = parse_json_body(request)
    refresh_token = payload.get("refresh") or ""
    if not refresh_token:
        raise DomainError("El campo 'refresh' es obligatorio.")
    tokens = rotate_from_refresh_token(refresh_token)
    if not tokens:
        raise DomainError("El token de renovación es inválido o ha expirado.", status_code=401)
    return api_response({"tokens": tokens}, message="Token renovado.")


@api_handler(["POST"])
def logout_view(request):
    """
    POST /api/v1/auth/logout/ - Cierra la sesión activa y revoca tokens.
    Invalida el Bearer token activo y el refresh token (si se proporciona) en la lista negra.
    """
    auth_user = getattr(request, "user", None)
    if auth_user and not auth_user.is_authenticated:
        auth_user = None

    # Revocar access token si viene en la cabecera Authorization
    auth_header = request.META.get("HTTP_AUTHORIZATION", "")
    if auth_header.startswith("Bearer "):
        access_token = auth_header.split(" ", 1)[1].strip()
        revoke_token(access_token, user=auth_user, motivo="LOGOUT")

    # Revocar refresh token si se envía en el cuerpo JSON
    payload = parse_json_body(request)
    refresh_token = payload.get("refresh")
    if refresh_token:
        revoke_token(refresh_token, user=auth_user, motivo="LOGOUT")

    logout(request)
    return api_response(message="Sesión cerrada y tokens revocados correctamente.")



@api_handler(["GET", "PATCH"], auth_required=True)
def me_view(request):
    """GET/PATCH /api/v1/auth/me/ - Consulta o actualiza el perfil del usuario autenticado."""
    if request.method == "PATCH":
        payload = parse_json_body(request)
        AccountService.actualizar_perfil(
            request.user,
            nombre=payload.get("nombre"),
            apellido=payload.get("apellido"),
            telefono=payload.get("telefono"),
        )
        return api_response(
            {"user": serialize_user_profile(request.user)},
            message="Perfil actualizado correctamente.",
        )

    return api_response({"user": serialize_user_profile(request.user)})


@api_handler(["POST"], auth_required=True)
def password_change_view(request):
    """POST /api/v1/auth/password-change/ - Cambio de contraseña para usuario autenticado."""
    payload = parse_json_body(request)
    password_actual = payload.get("password_actual") or ""
    password_nuevo = payload.get("password_nuevo") or ""

    AccountService.cambiar_password(
        request.user,
        password_actual=password_actual,
        password_nuevo=password_nuevo,
    )
    return api_response(message="Contraseña actualizada exitosamente.")


@api_handler(["POST"])
def password_reset_request_view(request):
    """POST /api/v1/auth/password-reset/ - Solicita restablecimiento de contraseña."""
    payload = parse_json_body(request)
    correo = payload.get("correo") or payload.get("email") or ""

    AccountService.solicitar_recuperacion_password(correo=correo)
    return api_response(
        message="Si el correo ingresado se encuentra registrado, recibirás un mensaje con las instrucciones para restablecer tu contraseña."
    )


@api_handler(["POST"])
def password_reset_confirm_view(request):
    """POST /api/v1/auth/password-reset-confirm/ - Aplica nueva contraseña con token temporal."""
    payload = parse_json_body(request)
    uid = payload.get("uid") or payload.get("uidb64") or ""
    token = payload.get("token") or ""
    password_nuevo = payload.get("password_nuevo") or payload.get("new_password") or ""

    AccountService.confirmar_recuperacion_password(
        uidb64=uid,
        token=token,
        password_nuevo=password_nuevo,
    )
    return api_response(
        message="Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña."
    )

