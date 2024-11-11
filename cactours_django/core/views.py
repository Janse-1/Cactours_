from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User


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
                return redirect('usuario')  # Cambia 'index' con la ruta que desees para usuarios normales
        else:
            # Si las credenciales no son correctas, mostrar mensaje de error
            return render(request, 'login.html', {'error': 'Credenciales inválidas'})
    
    return render(request, 'login.html')


# Vista para el  cliente
def usuario(request):
    return render(request, 'usuario.html')

# Vista para las reservas
def reservas(request):
    return render(request, 'reservas.html')

# Vista para el formulario de reserva (registro)
def registro(request):
    return render(request, 'registro.html')

# Vista para el pago
def pagos(request):
    return render(request, 'pagos.html')


