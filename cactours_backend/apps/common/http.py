"""
Utilidades de entrada/salida JSON, manejo de errores de dominio y decoradores de permisos
para los endpoints REST de Cactours Backend.
"""
import json
from functools import wraps
from django.core.exceptions import ValidationError
from django.http import JsonResponse


class DomainError(Exception):
    """Excepción de negocio controlada con código HTTP asociado."""

    def __init__(self, message: str, status_code: int = 400, details: dict | None = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}


def parse_json_body(request) -> dict:
    """Parsea el cuerpo JSON de una petición o lanza DomainError si es inválido."""
    if not request.body:
        return {}
    try:
        data = json.loads(request.body.decode("utf-8"))
        if not isinstance(data, dict):
            raise DomainError("El cuerpo de la petición debe ser un objeto JSON.")
        return data
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise DomainError("Formato JSON inválido en la solicitud.") from exc


def api_response(data=None, *, message: str | None = None, status: int = 200) -> JsonResponse:
    """Construye una respuesta JSON estándar para la API de Cactours."""
    payload = {"ok": 200 <= status < 300}
    if message:
        payload["message"] = message
    if data is not None:
        payload["data"] = data
    return JsonResponse(payload, status=status)


def api_error(message: str, *, status: int = 400, details: dict | None = None) -> JsonResponse:
    """Construye una respuesta de error JSON estándar."""
    payload = {
        "ok": False,
        "error": message,
    }
    if details:
        payload["details"] = details
    return JsonResponse(payload, status=status)


def api_handler(allowed_methods: list[str], *, auth_required: bool = False, staff_required: bool = False):
    """
    Decorador para vistas API que valida método HTTP, autenticación, rol y captura
    excepciones de dominio (`DomainError` y `ValidationError`).
    """

    def decorator(view_func):
        @wraps(view_func)
        def _wrapped(request, *args, **kwargs):
            if request.method not in allowed_methods:
                return api_error(
                    f"Método {request.method} no permitido. Usa: {', '.join(allowed_methods)}.",
                    status=405,
                )
            user = getattr(request, "_token_user", None) or request.user
            if user and getattr(user, "is_authenticated", False):
                request.user = user

            if auth_required and (not request.user or not request.user.is_authenticated):
                return api_error("Autenticación requerida para acceder a este recurso.", status=401)

            if staff_required and (not request.user or not request.user.is_staff):
                return api_error("Permisos de administrador requeridos.", status=403)

            try:
                return view_func(request, *args, **kwargs)
            except DomainError as exc:
                return api_error(exc.message, status=exc.status_code, details=exc.details)
            except ValidationError as exc:
                details = exc.message_dict if hasattr(exc, "message_dict") else {"non_field_errors": exc.messages}
                message = " ".join(exc.messages) or "Error de validación en los datos enviados."
                return api_error(message, status=400, details=details)

        return _wrapped

    return decorator
