from django.urls import path
from . import views

app_name = "tours"

urlpatterns = [
    path("", views.tour_list_view, name="tour-list"),
    path("opciones/", views.opciones_list_view, name="opciones-list"),
    path("recomendador/", views.budget_recommender_view, name="budget-recommender"),
    path("<int:tour_id>/", views.tour_detail_view, name="tour-detail"),
]
