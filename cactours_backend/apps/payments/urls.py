from django.urls import path
from . import views

app_name = "payments"

urlpatterns = [
    path("", views.payment_list_create_view, name="payment-list-create"),
]
