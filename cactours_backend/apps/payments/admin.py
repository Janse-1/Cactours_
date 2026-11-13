from django.contrib import admin
from .models import TransaccionPago


@admin.register(TransaccionPago)
class TransaccionPagoAdmin(admin.ModelAdmin):
    list_display = ("referencia_interna", "reserva", "monto", "moneda", "proveedor", "estado", "created_at")
    list_filter = ("estado", "proveedor", "moneda")
    search_fields = ("referencia_interna", "referencia_externa", "reserva__codigo_reserva")
    readonly_fields = ("referencia_interna", "created_at", "updated_at")
