from django.shortcuts import render, redirect
from django.http import HttpResponse

# Lista de usuarios y contraseñas predefinidos para el admin
ADMIN_USERS = {
    'admin1': 'password123',
    'admin2': 'securepass456'
}

# Vista principal
def index(request):
    return render(request, 'index.html')

# Vista para el login de cliente
def login_view(request):
    return render(request, 'login.html')

# Vista para el registro de cliente
def register(request):
    return render(request, 'register.html')

# Vista para las reservas
def reservas(request):
    return render(request, 'reservas.html')

# Vista para el formulario de reserva (registro)
def registro(request):
    return render(request, 'registro.html')

# Vista para el pago
def pagos(request):
    return render(request, 'pagos.html')

# Vista para el login del administrador (verificación básica)
def admin_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        # Verificar si el usuario y la contraseña son correctos
        if ADMIN_USERS.get(username) == password:
            return redirect('admin_dashboard')  # Redirigir al dashboard
        else:
            return HttpResponse("Usuario o contraseña incorrectos.", status=403)

    return render(request, 'admin_login.html')

# Vista para el dashboard del administrador
def admin_dashboard(request):
    return render(request, 'admin_dashboard.html')
