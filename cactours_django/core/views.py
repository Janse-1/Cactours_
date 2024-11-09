from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User

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
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        
        # Autenticar al usuario
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            # Si el usuario existe y es correcto, iniciar sesión
            login(request, user)
            
            # Verificar si es un administrador
            if user.is_staff:
                # Si es administrador, redirigir al panel de administración
                return redirect('/admin/')  # Cambia 'admin_dashboard' con la ruta de tu panel de admin
            else:
                # Si es un usuario normal, redirigir a la página principal
                return redirect('index')  # Cambia 'index' con la ruta que desees para usuarios normales
        else:
            # Si las credenciales no son correctas, mostrar mensaje de error
            return render(request, 'login.html', {'error': 'Credenciales inválidas'})
    
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


