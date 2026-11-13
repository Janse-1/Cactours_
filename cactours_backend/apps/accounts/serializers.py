"""Serializadores del dominio de cuentas para respuestas JSON consistentes."""
from django.contrib.auth.models import User
from .models import Cliente, Persona


def serialize_user_profile(user: User) -> dict:
    """Serializa la cuenta de usuario junto con su perfil Persona y Cliente."""
    persona = Persona.objects.filter(user=user).first()
    cliente = Cliente.objects.filter(persona=persona).first() if persona else None

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": "admin" if user.is_staff else "cliente",
        "is_staff": user.is_staff,
        "persona": (
            {
                "id": persona.id,
                "nombre": persona.nombre,
                "apellido": persona.apellido,
                "nombre_completo": f"{persona.nombre} {persona.apellido}".strip(),
                "identificacion": persona.identificacion,
                "correo": persona.correo,
                "telefono": persona.telefono,
            }
            if persona
            else None
        ),
        "cliente": (
            {
                "id": cliente.id,
                "contador_reservas": cliente.contador_reservas,
            }
            if cliente
            else None
        ),
    }
