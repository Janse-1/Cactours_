from django.contrib import admin
from .models import ImagenTour, OpcionTour, Tour, TourSalida


class ImagenTourInline(admin.TabularInline):
    model = ImagenTour
    extra = 1


@admin.register(Tour)
class TourAdmin(admin.ModelAdmin):
    list_display = ("nombre_tour", "ciudad_destino", "costo", "duracion_dias", "cupo_maximo", "estado")
    list_filter = ("estado", "ciudad_destino", "duracion_dias")
    search_fields = ("nombre_tour", "ciudad_destino", "descripcion")
    prepopulated_fields = {"slug": ("nombre_tour",)}
    filter_horizontal = ("opciones",)
    inlines = [ImagenTourInline]


@admin.register(OpcionTour)
class OpcionTourAdmin(admin.ModelAdmin):
    list_display = ("nombre_op", "precio_adic", "cobro_por_persona", "activa")
    list_filter = ("activa", "cobro_por_persona")
    search_fields = ("nombre_op", "descripcion")


@admin.register(ImagenTour)
class ImagenTourAdmin(admin.ModelAdmin):
    list_display = ("tour", "descripcion", "orden")
    list_filter = ("tour",)


@admin.register(TourSalida)
class TourSalidaAdmin(admin.ModelAdmin):
    list_display = ("tour", "fecha", "hora", "cupo_total", "cupo_disponible", "activa")
    list_filter = ("activa", "fecha", "tour")
