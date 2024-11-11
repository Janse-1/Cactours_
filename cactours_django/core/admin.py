from django.contrib import admin
from .models import Cliente, Empleado, Tour, ToursOpc, Reserva, Opcion, Persona

admin.site.register(Cliente)
admin.site.register(Empleado)
admin.site.register(Tour)
admin.site.register(ToursOpc)
admin.site.register(Reserva)
admin.site.register(Opcion)
admin.site.register(Persona)

