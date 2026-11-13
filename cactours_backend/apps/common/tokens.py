"""
Emisión y verificación de tokens firmados para clientes Web (Vue.js) y Móvil (React Native).
Usa criptografía HMAC nativa de Django (`django.core.signing`) o SimpleJWT si está configurado.
"""
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core import signing

ACCESS_SALT = "cactours.api.access.v1"
REFRESH_SALT = "cactours.api.refresh.v1"


def issue_token_pair(user) -> dict[str, str]:
    """Genera un par de tokens (`access` y `refresh`) firmados criptográficamente."""
    payload = {
        "uid": user.pk,
        "username": user.username,
        "is_staff": user.is_staff,
    }
    access_token = signing.dumps(payload, salt=ACCESS_SALT)
    refresh_token = signing.dumps({"uid": user.pk}, salt=REFRESH_SALT)
    return {
        "access": access_token,
        "refresh": refresh_token,
        "token_type": "Bearer",
    }


def verify_access_token(token: str):
    """Valida un token de acceso y retorna el usuario activo o None."""
    ttl_hours = getattr(settings, "API_TOKEN_TTL_HOURS", 24)
    max_age = ttl_hours * 3600
    try:
        data = signing.loads(token, salt=ACCESS_SALT, max_age=max_age)
    except signing.BadSignature:
        return None
    User = get_user_model()
    return User.objects.filter(pk=data.get("uid"), is_active=True).first()


def rotate_from_refresh_token(refresh_token: str) -> dict[str, str] | None:
    """Valida un refresh token (vigencia 7 días) y emite un nuevo par de tokens."""
    try:
        data = signing.loads(refresh_token, salt=REFRESH_SALT, max_age=7 * 24 * 3600)
    except signing.BadSignature:
        return None
    User = get_user_model()
    user = User.objects.filter(pk=data.get("uid"), is_active=True).first()
    if not user:
        return None
    return issue_token_pair(user)
