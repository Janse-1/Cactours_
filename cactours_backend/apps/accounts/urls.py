from django.urls import path
from . import views

app_name = "accounts"

urlpatterns = [
    path("register/", views.register_view, name="register"),
    path("login/", views.login_view, name="login"),
    path("refresh/", views.refresh_token_view, name="refresh"),
    path("logout/", views.logout_view, name="logout"),
    path("me/", views.me_view, name="me"),
    path("password-change/", views.password_change_view, name="password-change"),
    path("password-reset/", views.password_reset_request_view, name="password-reset"),
    path("password-reset-confirm/", views.password_reset_confirm_view, name="password-reset-confirm"),
]
