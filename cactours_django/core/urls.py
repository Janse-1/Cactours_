from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login_view, name='login'),
    path('usuario/', views.usuario, name='usuario'),
    path('reservas/', views.reservas, name='reservas'),
    path('registro/', views.registro, name='registro'),
    path('pagos/', views.pagos, name='pagos'),
    
]