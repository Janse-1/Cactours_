"""Serializadores de Django REST Framework para el dominio de cuentas y usuarios."""
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Cliente, Persona


class PersonaSerializer(serializers.ModelSerializer):
    """Serializador DRF para los datos personales de un usuario."""

    nombre_completo = serializers.SerializerMethodField()

    class Meta:
        model = Persona
        fields = [
            "id",
            "nombre",
            "apellido",
            "nombre_completo",
            "identificacion",
            "correo",
            "telefono",
        ]

    def get_nombre_completo(self, obj) -> str:
        return f"{obj.nombre} {obj.apellido}".strip()


class ClienteSerializer(serializers.ModelSerializer):
    """Serializador DRF para el perfil de cliente turístico."""

    class Meta:
        model = Cliente
        fields = ["id", "contador_reservas"]


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializador DRF para el perfil completo de usuario con rol y perfiles anidados."""

    role = serializers.SerializerMethodField()
    persona = serializers.SerializerMethodField()
    cliente = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "is_staff", "persona", "cliente"]

    def get_role(self, obj) -> str:
        return "admin" if obj.is_staff else "cliente"

    def get_persona(self, obj) -> dict | None:
        persona = getattr(obj, "persona", None) or Persona.objects.filter(user=obj).first()
        return PersonaSerializer(persona).data if persona else None

    def get_cliente(self, obj) -> dict | None:
        persona = getattr(obj, "persona", None) or Persona.objects.filter(user=obj).first()
        if not persona:
            return None
        cliente = getattr(persona, "perfil_cliente", None) or Cliente.objects.filter(persona=persona).first()
        return ClienteSerializer(cliente).data if cliente else None


# --- Función de compatibilidad ---
def serialize_user_profile(user: User) -> dict:
    return UserProfileSerializer(user).data
