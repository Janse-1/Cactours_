from django.contrib import admin
from .models import Cliente, Empleado, Tour, ToursOpc, Reserva, Opcion, Persona, Viaje,ReservaUsuario, TablaMaestra, ImagenTour

admin.site.register(Cliente)
admin.site.register(Empleado)
admin.site.register(ToursOpc)
admin.site.register(Reserva)
admin.site.register(Opcion)
admin.site.register(Persona)
admin.site.register(Viaje)
admin.site.register(ReservaUsuario)
admin.site.register(TablaMaestra)

class ImagenTourAdmin(admin.TabularInline):
    model = ImagenTour
    extra = 1  # Número de formularios vacíos para agregar imágenes

class TourAdmin(admin.ModelAdmin):
    inlines = [ImagenTourAdmin]

admin.site.register(Tour, TourAdmin)
admin.site.register(ImagenTour)