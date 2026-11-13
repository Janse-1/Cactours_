"""
Configuración de Producción (config.settings.prod).
Exige que todas las credenciales y secretos provengan de variables de entorno.
"""
import os
from django.core.exceptions import ImproperlyConfigured
from .base import *  # noqa: F401,F403

DEBUG = False

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    raise ImproperlyConfigured(
        "DJANGO_SECRET_KEY es obligatorio en producción. Defínelo en las variables de entorno."
    )

ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS")
if not ALLOWED_HOSTS:
    raise ImproperlyConfigured(
        "DJANGO_ALLOWED_HOSTS es obligatorio en producción."
    )

DB_PASSWORD = os.environ.get("DB_PASSWORD")
if not DB_PASSWORD:
    raise ImproperlyConfigured(
        "DB_PASSWORD es obligatorio en producción. Nunca almacenes contraseñas en el código."
    )

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.environ.get("DB_NAME", "cactours_db"),
        "USER": os.environ.get("DB_USER", "cactours_user"),
        "PASSWORD": DB_PASSWORD,
        "HOST": os.environ.get("DB_HOST", "localhost"),
        "PORT": os.environ.get("DB_PORT", "3306"),
        "CONN_MAX_AGE": 60,
        "OPTIONS": {
            "charset": "utf8mb4",
        },
    }
}

# --- Cabeceras de Seguridad en Producción ---
SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", default=True)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
