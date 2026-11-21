from django.contrib import admin
from .models import CambioEstadoReserva, Reserva, ReservaOpcion


class ReservaOpcionInline(admin.TabularInline):
    model = ReservaOpcion
    extra = 0
    readonly_fields = ("nombre_opcion", "precio_unitario", "subtotal")


@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = (
        "codigo_reserva",
        "cliente",
        "tour",
        "fecha",
        "cant_personas",
        "costo_total",
        "medio_pago",
        "estado",
    )
    list_filter = ("estado", "medio_pago", "fecha", "tour")
    search_fields = (
        "codigo_reserva",
        "cliente__persona__nombre",
        "cliente__persona__apellido",
        "cliente__persona__identificacion",
        "tour__nombre_tour",
    )
    readonly_fields = ("codigo_reserva", "subtotal_base", "subtotal_opciones", "costo_total", "created_at", "updated_at")
    inlines = [ReservaOpcionInline]


@admin.register(CambioEstadoReserva)
class CambioEstadoReservaAdmin(admin.ModelAdmin):
    list_display = ("reserva", "usuario", "estado_anterior", "estado_nuevo", "created_at")
    list_filter = ("estado_anterior", "estado_nuevo", "created_at")
    readonly_fields = ("reserva", "usuario", "estado_anterior", "estado_nuevo", "motivo", "created_at", "updated_at")
