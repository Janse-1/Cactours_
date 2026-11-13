from django.urls import path
from . import views

app_name = "bookings"

urlpatterns = [
    path("", views.booking_list_create_view, name="booking-list-create"),
    path("cotizar/", views.quote_booking_view, name="booking-quote"),
    path("<int:reserva_id>/", views.booking_detail_view, name="booking-detail"),
]
