"""
Emisión, verificación, expiración y revocación de tokens firmados para Web y Móvil.
Cumple con la tarea #14 incorporando lista negra de revocación (Blacklist) y rotación segura.
"""
import hashlib
import time
import uuid
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core import signing

ACCESS_SALT = "cactours.api.access.v1"
REFRESH_SALT = "cactours.api.refresh.v1"


def hash_token(raw_token: str) -> str:
    """Genera un hash SHA-256 determinista para indexar el token sin almacenar su firma cruda."""
    return hashlib.sha256((raw_token or "").strip().encode("utf-8")).hexdigest()


def is_token_revoked(token: str) -> bool:
    """Comprueba si un token ha sido revocado e ingresado en la lista negra."""
    if not token:
        return True
    try:
        from apps.accounts.models import TokenRevocado

        return TokenRevocado.objects.filter(token_hash=hash_token(token)).exists()
    except Exception:
        # En caso de entornos de migración inicial o fallas de BD temporales
        return False


def revoke_token(token: str, *, user=None, motivo: str = "LOGOUT") -> bool:
    """
    Registra un token en la lista negra de revocación para invalidarlo de inmediato.
    """
    if not token:
        return False
    try:
        from apps.accounts.models import TokenRevocado

        TokenRevocado.objects.get_or_create(
            token_hash=hash_token(token),
            defaults={
                "user": user,
                "motivo": motivo,
            },
        )
        return True
    except Exception:
        return False


def issue_token_pair(user) -> dict[str, str]:
    """
    Genera un par de tokens (`access` y `refresh`) firmados criptográficamente.
    Incluye identificador único `jti` y marca temporal `iat` para garantizar unicidad y trazabilidad.
    """
    now_ts = int(time.time())
    payload = {
        "uid": user.pk,
        "username": user.username,
        "is_staff": user.is_staff,
        "jti": uuid.uuid4().hex,
        "iat": now_ts,
    }
    access_token = signing.dumps(payload, salt=ACCESS_SALT)
    refresh_token = signing.dumps(
        {
            "uid": user.pk,
            "jti": uuid.uuid4().hex,
            "iat": now_ts,
        },
        salt=REFRESH_SALT,
    )
    return {
        "access": access_token,
        "refresh": refresh_token,
        "token_type": "Bearer",
    }



def verify_access_token(token: str):
    """
    Valida un token de acceso:
    1. Verifica que no haya sido revocado en la lista negra.
    2. Comprueba la firma criptográfica HMAC y su tiempo de expiración (TTL).
    3. Retorna la instancia de User activa o None.
    """
    if not token or is_token_revoked(token):
        return None

    ttl_hours = getattr(settings, "API_TOKEN_TTL_HOURS", 24)
    max_age = ttl_hours * 3600
    try:
        data = signing.loads(token, salt=ACCESS_SALT, max_age=max_age)
    except (signing.BadSignature, signing.SignatureExpired):
        return None

    User = get_user_model()
    return User.objects.filter(pk=data.get("uid"), is_active=True).first()


def rotate_from_refresh_token(refresh_token: str) -> dict[str, str] | None:
    """
    Valida un refresh token (vigencia 7 días) y emite un nuevo par de tokens.
    SEGURIDAD: Revoca el refresh token anterior para prevenir ataques de repetición (Token Rotation).
    """
    if not refresh_token or is_token_revoked(refresh_token):
        return None

    try:
        data = signing.loads(refresh_token, salt=REFRESH_SALT, max_age=7 * 24 * 3600)
    except (signing.BadSignature, signing.SignatureExpired):
        return None

    User = get_user_model()
    user = User.objects.filter(pk=data.get("uid"), is_active=True).first()
    if not user:
        return None

    # Rotación: revocar el refresh token consumido
    revoke_token(refresh_token, user=user, motivo="ROTATION")
    return issue_token_pair(user)
