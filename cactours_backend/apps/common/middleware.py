"""
Middleware de soporte CORS y autenticación por Bearer Token para la API `/api/v1/`.
Permite que Vue.js y React Native consuman la API de forma segura y desacoplada.
"""
from django.conf import settings
from django.http import HttpResponse
from .tokens import verify_access_token


class CorsAndTokenAuthMiddleware:
    """
    1. Gestiona cabeceras CORS y peticiones OPTIONS para orígenes permitidos.
    2. Autentica peticiones a `/api/` que incluyan `Authorization: Bearer <token>`.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith("/api/"):
            # Eximir CSRF en endpoints API que usan autenticación por token o JSON puro
            request._dont_enforce_csrf_checks = True

            auth_header = request.META.get("HTTP_AUTHORIZATION", "")
            if auth_header.startswith("Bearer "):
                raw_token = auth_header.split(" ", 1)[1].strip()
                token_user = verify_access_token(raw_token)
                if token_user is not None:
                    request._token_user = token_user

        if request.method == "OPTIONS" and request.path.startswith("/api/"):
            response = HttpResponse(status=204)
            return self._add_cors_headers(request, response)

        response = self.get_response(request)
        if request.path.startswith("/api/"):
            if hasattr(request, "_token_user") and request._token_user is not None:
                request.user = request._token_user
            response = self._add_cors_headers(request, response)
        return response

    def process_view(self, request, view_func, view_args, view_kwargs):
        if hasattr(request, "_token_user") and request._token_user is not None:
            request.user = request._token_user
        return None

    @staticmethod
    def _add_cors_headers(request, response):
        origin = request.META.get("HTTP_ORIGIN")
        allowed = getattr(settings, "CORS_ALLOWED_ORIGINS", [])
        if origin and (origin in allowed or getattr(settings, "DEBUG", False)):
            response["Access-Control-Allow-Origin"] = origin
            response["Access-Control-Allow-Credentials"] = "true"
            response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
            response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-CSRFToken"
        return response
