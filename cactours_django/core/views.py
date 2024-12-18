from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login
from django.utils.timezone import now
from django.contrib.auth.models import User
from django.contrib import messages
from .models import Viaje, ReservaUsuario, Persona, Reserva, Tour, Opcion

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


# Vista para el cliente
def usuario(request):
    usuario_actual = request.user  # El usuario autenticado
    
    # Obtener los viajes del usuario autenticado
    mis_viajes = Viaje.objects.filter(user=usuario_actual)
    
    # Obtener las reservas del usuario autenticado
    mis_reservas = ReservaUsuario.objects.filter(user=usuario_actual)

    # Contexto para pasar a la plantilla
    context = {
        'mis_viajes': mis_viajes,
        'mis_reservas': mis_reservas,
    }
    return render(request, 'usuario.html', context)



# Vista para las reservas
def reservas(request):
    tours = Tour.objects.all()
    if not tours.exists():
        return render(request, 'reservas.html', {'error': 'No hay tours disponibles.'})
    return render(request, 'reservas.html', {'tours': tours})


# Vista de registro
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

        # Crear una entrada en la tabla de Persona
        persona = Persona(user=user, nombre=nombre, apellido=apellido, telefono=telefono, identificacion=identificacion, correo=correo)
        persona.save()

        messages.success(request, "Te has registrado correctamente.")
        return redirect('login')

    return render(request, 'registro.html')



# Vista para el pago
def pagos(request, tour_id):
    user = request.user
    tour = get_object_or_404(Tour, id=tour_id)

    try:
        persona = Persona.objects.get(user=user)
    except Persona.DoesNotExist:
        persona = None  

    opciones = Opcion.objects.all()
    
    medios_pago = [
        ('tarjeta', 'Tarjeta de Crédito'),
        ('paypal', 'PayPal'),
        ('transferencia', 'Transferencia Bancaria'),
    ]
    
    if request.method == "POST":
        # Obtener los datos del formulario
        lugar_salida = request.POST.get('lugar_salida', None)
        num_personas = request.POST.get('num_personas', None)
        medio_pago = request.POST.get('medio_pago', None)
        comentarios = request.POST.get('comentarios', None)

        # Verificar si falta algún campo
        if not lugar_salida or not num_personas or not medio_pago:
            messages.error(request, "Por favor, completa todos los campos.")
            return redirect('pagos', tour_id=tour_id)

        # Convertir num_personas a un entero y calcular el costo total
        try:
            num_personas = int(num_personas)
            costo_total = float(tour.costo) * num_personas
        except ValueError:
            messages.error(request, "Número de personas no válido.")
            return redirect('pagos', tour_id=tour_id)

        # Obtener la fecha y hora actuales
        fecha_actual = now().date()
        hora_actual = now().time()

        # Guardar en la tabla Reserva
        reserva = Reserva.objects.create(
            cliente=user,
            tour=tour,
            costo_total=costo_total,
            fecha=fecha_actual,  # Usar la fecha actual
            hora=hora_actual,  # Usar la hora actual
            medio_pago=medio_pago,
            destino=lugar_salida,
            cant_personas=num_personas,
            comentarios=comentarios
        )

        # Guardar en la tabla ReservaUsuario
        ReservaUsuario.objects.create(
            user=user,
            fecha=fecha_actual,
            tipo_tour=tour.nombre_tour,
            medio_pago=medio_pago,
            costo=costo_total,
            adiciones="",  # Si es necesario, agregar las adiciones
            comentarios=comentarios
        )

        # Mensaje de éxito
        messages.success(request, "¡Reserva realizada con éxito!")

        # Redirigir a la página de usuario
        return redirect('usuario')  # Aquí es donde se redirige al usuario

    context = {
        'persona': persona,  
        'tour': tour,
        'opciones': opciones,
        'medios_pago': medios_pago,
    }
    return render(request, 'pagos.html', context)



def pagos_personalizados(request):
    
    return render(request, 'pagos_personalizado.html')


# Vista para la página de desarrollo
def en_desarrollo(request):
    return render(request, 'en_desarrollo.html')

def login_views(request):
    return render(request, 'login.html')

def password_reset(request):
    if request.method == "POST":
        email = request.POST.get("email")
        
        # Verificar si el correo existe en la base de datos
        if User.objects.filter(email=email).exists():
            # Lógica para enviar el enlace de restablecimiento (agrega la funcionalidad aquí)
            message = "Correo enviado"
        else:
            message = "El correo ingresado no está registrado"
        
        # Pasar el mensaje al contexto para mostrar en la plantilla
        return render(request, "password_reset.html", {"message": message})
    
    return render(request, 'password_reset.html')
