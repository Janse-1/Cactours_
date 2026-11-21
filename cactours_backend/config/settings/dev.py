"""
Configuración de Desarrollo Local (config.settings.dev).
Usa variables de entorno si están definidas o valores seguros de desarrollo local.
"""
import os
import sys
from .base import *  # noqa: F401,F403

DEBUG = env_bool("DJANGO_DEBUG", default=True)

# En desarrollo se permite una clave local efímera si no se definió DJANGO_SECRET_KEY en .env
SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "dev-only-key-do-not-use-in-production-cactours-local",
)

ALLOWED_HOSTS = env_list(
    "DJANGO_ALLOWED_HOSTS",
    default=["localhost", "127.0.0.1", "10.0.2.2", "testserver"],
)

# En desarrollo los correos se muestran directamente en la consola sin requerir servidor SMTP
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Usa MySQL si DB_ENGINE=mysql y DB_PASSWORD está configurado en .env;
# de lo contrario o durante pruebas automatizadas (`manage.py test`), usa SQLite local.
_db_engine = os.environ.get("DB_ENGINE", "sqlite").lower()
_is_testing = "test" in sys.argv

if _db_engine == "mysql" and not _is_testing and os.environ.get("DB_PASSWORD"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "NAME": os.environ.get("DB_NAME", "cactours_db"),
            "USER": os.environ.get("DB_USER", "cactours_user"),
            "PASSWORD": os.environ["DB_PASSWORD"],
            "HOST": os.environ.get("DB_HOST", "localhost"),
            "PORT": os.environ.get("DB_PORT", "3306"),
            "OPTIONS": {
                "charset": "utf8mb4",
            },
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
