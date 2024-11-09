from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register, name='register'),
    path('reservas/', views.reservas, name='reservas'),
    path('registro/', views.registro, name='registro'),
    path('pagos/', views.pagos, name='pagos'),
    path('admin/login/', views.admin_login, name='admin_login'),
    path('admin/dashboard/', views.admin_dashboard, name='admin_dashboard'),
]