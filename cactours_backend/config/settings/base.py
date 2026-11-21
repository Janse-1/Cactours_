"""
Configuración base de Django para Cactours Backend.
Lee variables desde el entorno (.env) sin exponer credenciales ni claves secretas en el código.
"""
import importlib.util
import os
from pathlib import Path

# BASE_DIR apunta a Cactours/cactours_backend/
BASE_DIR = Path(__file__).resolve().parent.parent.parent
REPO_ROOT = BASE_DIR.parent


def _load_env_file(env_path: Path) -> None:
    """Carga variables de un archivo .env usando python-dotenv o parser nativo."""
    if not env_path.exists():
        return
    try:
        from dotenv import load_dotenv

        load_dotenv(dotenv_path=env_path, override=False)
    except ImportError:
        for raw_line in env_path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip().strip("'\""))


# Cargar primero .env del backend y luego .env de la raíz como respaldo
_load_env_file(BASE_DIR / ".env")
_load_env_file(REPO_ROOT / ".env")


def env_bool(name: str, default: bool = False) -> bool:
    val = os.environ.get(name)
    if val is None:
        return default
    return val.strip().lower() in ("1", "true", "yes", "on")


def env_list(name: str, default: list[str] | None = None) -> list[str]:
    val = os.environ.get(name)
    if not val:
        return default or []
    return [item.strip() for item in val.split(",") if item.strip()]


def _is_installed(package_name: str) -> bool:
    return importlib.util.find_spec(package_name) is not None


# --- Aplicaciones instaladas ---
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    pkg
    for pkg in (
        "corsheaders",
        "rest_framework",
        "rest_framework_simplejwt",
        "django_filters",
        "drf_spectacular",
    )
    if _is_installed(pkg)
]

LOCAL_APPS = [
    "apps.common",
    "apps.accounts",
    "apps.tours",
    "apps.bookings",
    "apps.payments",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# --- Middleware ---
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    *(["corsheaders.middleware.CorsMiddleware"] if _is_installed("corsheaders") else []),
    "django.contrib.sessions.middleware.SessionMiddleware",
    "apps.common.middleware.CorsAndTokenAuthMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# --- Validación de contraseñas ---
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --- Internacionalización (Colombia) ---
LANGUAGE_CODE = "es-co"
TIME_ZONE = "America/Bogota"
USE_I18N = True
USE_TZ = True

# --- Archivos estáticos y multimedia ---
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# --- Configuración de Correo Transaccional ---
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "no-reply@cactours.com")
EMAIL_SUBJECT_PREFIX = "[Cactours] "

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- CORS para clientes Web (Vue.js) y Móvil (React Native) ---
CORS_ALLOWED_ORIGINS = env_list(
    "CORS_ALLOWED_ORIGINS",
    default=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8081",
    ],
)
CORS_ALLOW_CREDENTIALS = True

# --- Configuración de Django REST Framework (cuando está instalado) ---
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        *(
            ["rest_framework_simplejwt.authentication.JWTAuthentication"]
            if _is_installed("rest_framework_simplejwt")
            else []
        ),
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 12,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Cactours API",
    "DESCRIPTION": (
        "API REST versionada de Cactours para los clientes Web Vue.js y Mobile React Native."
    ),
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SCHEMA_PATH_PREFIX": "/api/v1",
    "COMPONENT_SPLIT_REQUEST": True,
    "TAGS": [
        {"name": "auth", "description": "Registro, autenticación y recuperación de cuenta"},
        {"name": "tours", "description": "Catálogo y opciones de tours"},
        {"name": "bookings", "description": "Cotización y solicitudes de reserva"},
        {"name": "payments", "description": "Intenciones y registro de pagos"},
    ],
    "SECURITY": [{"bearerAuth": []}],
    "APPEND_COMPONENTS": {
        "securitySchemes": {
            "bearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "Cactours Bearer Token",
            }
        }
    },
}

API_TOKEN_TTL_HOURS = int(os.environ.get("API_TOKEN_TTL_HOURS", "24"))
