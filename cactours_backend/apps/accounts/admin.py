from django.contrib import admin
from .models import Cliente, Empleado, Persona, TokenRevocado


@admin.register(Persona)
class PersonaAdmin(admin.ModelAdmin):
    list_display = ("identificacion", "nombre", "apellido", "correo", "telefono", "created_at")
    search_fields = ("identificacion", "nombre", "apellido", "correo")


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ("persona", "contador_reservas", "created_at")
    search_fields = ("persona__nombre", "persona__apellido", "persona__identificacion")


@admin.register(Empleado)
class EmpleadoAdmin(admin.ModelAdmin):
    list_display = ("persona", "cargo", "estado", "fecha_contratacion", "salario")
    list_filter = ("estado", "cargo")
    search_fields = ("persona__nombre", "persona__apellido", "cargo")


@admin.register(TokenRevocado)
class TokenRevocadoAdmin(admin.ModelAdmin):
    list_display = ("token_hash", "user", "motivo", "created_at")
    list_filter = ("motivo",)
    search_fields = ("token_hash", "user__username", "user__email")

