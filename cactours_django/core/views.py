from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.contrib import messages

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
            # Iniciar sesión
            login(request, user)

            # Verificar si es un administrador
            if user.is_staff:
                return redirect('/admin/')  # Redirigir al panel de administración
            else:
                return redirect('usuario')  # Redirigir a la página de cliente
        else:
            return render(request, 'login.html', {'error': 'Credenciales inválidas'})
    
    return render(request, 'login.html')



# Vista para el  cliente
def usuario(request):
    return render(request, 'usuario.html')

# Vista para las reservas
def reservas(request):
    return render(request, 'reservas.html')

# Vista de registro
def registro(request):
    if request.method == 'POST':
        nombre = request.POST['nombre']
        apellido = request.POST['apellido']
        correo = request.POST['correo']
        password = request.POST['password']
        telefono = request.POST['telefono']
        identificacion = request.POST['identificacion']
        
        # Comprobar si el correo pertenece al dominio de administradores
        if correo.endswith('@cactours.com'):
            tipo_usuario = 'admin'  # Es un administrador
        else:
            tipo_usuario = 'cliente'  # Es un cliente

        # Verificar si el correo ya está registrado
        if User.objects.filter(email=correo).exists():
            messages.error(request, "Este correo ya está registrado.")
            return redirect('registro')

        # Verificar si la identificación ya está registrada
        if User.objects.filter(username=identificacion).exists():
            messages.error(request, "Este número de identificación ya está registrado.")
            return redirect('registro')

        # Crear el nuevo usuario
        user = User.objects.create_user(username=correo, email=correo, password=password)
        user.first_name = nombre
        user.last_name = apellido
        user.save()

        # Asignar rol según el tipo de usuario
        if tipo_usuario == 'admin':
            user.is_staff = True  # Hacer al usuario administrador
            user.save()

        # Crear una entrada en la tabla de Persona si la tienes
        # persona = Persona(user=user, telefono=telefono, identificacion=identificacion, tipo=tipo_usuario)
        # persona.save()

        messages.success(request, "Te has registrado correctamente.")
        return redirect('login')

    return render(request, 'registro.html')


# Vista para el pago
def pagos(request):
    return render(request, 'pagos.html')