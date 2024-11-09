from django import forms
from .models import Reserva

class ReservaForm(forms.ModelForm):
    class Meta:
        model = Reserva
        fields = ['cliente_id', 'tour_id', 'costo_total', 'fecha', 'hora', 'medio_pago_id', 'destino', 'cant_personas', 'comentarios']
