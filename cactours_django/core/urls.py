from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login_view, name='login'),
    path('usuario/', views.usuario, name='usuario'),
    path('reservas/', views.reservas, name='reservas'),
    path('registro/', views.registro, name='registro'),
    path('pagos/<int:tour_id>/', views.pagos, name='pagos'),
    path('pagos/personalizados/', views.pagos_personalizados, name='pagos_personalizados'),
    path('en-desarrollo/', views.en_desarrollo, name='en_desarrollo'),
    path('password_reset/', views.password_reset, name='password_reset'),
    
]