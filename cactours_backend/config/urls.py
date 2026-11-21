"""
Enrutador principal de Cactours Backend (API-first + Django Admin).
Expone endpoints versionados bajo `/api/v1/` para Web (Vue.js) y Móvil (React Native).
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from .admin_demo import (
    admin_dashboard_view,
    admin_tours_view,
    admin_tour_detail_view,
    admin_bookings_view,
    admin_booking_detail_view,
)


def api_healthcheck(request):
    """Endpoint de salud y metadatos de la API de Cactours."""
    return JsonResponse(
        {
            "service": "cactours_backend",
            "version": "v1",
            "status": "ok",
            "endpoints": {
                "auth": "/api/v1/auth/",
                "tours": "/api/v1/tours/",
                "bookings": "/api/v1/bookings/",
                "payments": "/api/v1/payments/",
                "admin": "/admin/",
            },
        }
    )


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/admin/demo/dashboard/", admin_dashboard_view, name="admin-demo-dashboard"),
    path("api/v1/admin/demo/tours/", admin_tours_view, name="admin-demo-tours"),
    path("api/v1/admin/demo/tours/<int:tour_id>/", admin_tour_detail_view, name="admin-demo-tour-detail"),
    path("api/v1/admin/demo/bookings/", admin_bookings_view, name="admin-demo-bookings"),
    path("api/v1/admin/demo/bookings/<int:reserva_id>/", admin_booking_detail_view, name="admin-demo-booking-detail"),
    path("api/v1/health/", api_healthcheck, name="api-health"),
    path("api/v1/schema/", SpectacularAPIView.as_view(), name="api-schema"),
    path("api/v1/docs/", SpectacularSwaggerView.as_view(url_name="api-schema"), name="api-docs"),
    path("api/v1/redoc/", SpectacularRedocView.as_view(url_name="api-schema"), name="api-redoc"),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/tours/", include("apps.tours.urls")),
    path("api/v1/bookings/", include("apps.bookings.urls")),
    path("api/v1/payments/", include("apps.payments.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
