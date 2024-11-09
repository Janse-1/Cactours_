from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register, name='register'),
    path('reservas/', views.reservas, name='reservas'),
    path('registro/', views.registro, name='registro'),
    path('pagos/', views.pagos, name='pagos'),
    
]