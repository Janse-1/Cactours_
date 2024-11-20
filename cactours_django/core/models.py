from django.db import models
from django.db import models
from django.contrib.auth.models import User

class TablaMaestra(models.Model):
    categoria = models.CharField(max_length=50)
    valor = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField()

    def __str__(self):
        return self.valor

class Persona(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)   
    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50)
    identificacion = models.CharField(max_length=50, unique=True)
    correo = models.EmailField(max_length=50)
    telefono = models.CharField(max_length=10)

    def __str__(self):
        return f'{self.nombre} {self.apellido}'

class Cliente(models.Model):
    persona = models.ForeignKey(Persona, on_delete=models.CASCADE)
    contador_reservas = models.IntegerField(default=0)

class Empleado(models.Model):
    persona = models.ForeignKey(Persona, on_delete=models.CASCADE)
    fecha_contratacion = models.DateField()
    cargo = models.CharField(max_length=50)
    salario = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.ForeignKey(TablaMaestra, on_delete=models.CASCADE, related_name='empleados')
    
class Opcion(models.Model):
    nombre_op = models.CharField(max_length=50)
    descripcion = models.TextField()
    precio_adic = models.DecimalField(max_digits=10, decimal_places=2)

class Tour(models.Model):
    nombre_tour = models.CharField(max_length=50)
    descripcion = models.TextField()
    costo = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.ForeignKey('TablaMaestra', on_delete=models.CASCADE, related_name='tours')
    opciones = models.ManyToManyField('Opcion')
    ciudad_destino = models.CharField(max_length=50)  # Nuevo campo para el destino
    imagen = models.ImageField(upload_to='tours/', blank=True, null=True)  # Nuevo campo para la imagen

    def __str__(self):
        return self.nombre_tour
    
class ImagenTour(models.Model):
    tour = models.ForeignKey(Tour, related_name='imagenes', on_delete=models.CASCADE)
    imagen = models.ImageField(upload_to='tours/')
    descripcion = models.CharField(max_length=100, blank=True, null=True)  # Descripción opcional

    def __str__(self):
        return self.descripcion or f"Imagen del tour {self.tour.nombre_tour}"




class Reserva(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE)
    costo_total = models.DecimalField(max_digits=10, decimal_places=2)
    fecha = models.DateField()
    hora = models.TimeField()
    medio_pago = models.ForeignKey(TablaMaestra, on_delete=models.CASCADE, related_name='reservas')
    destino = models.CharField(max_length=50)
    cant_personas = models.IntegerField()
    comentarios = models.TextField()



class ToursOpc(models.Model):
    opcion = models.ForeignKey(Opcion, on_delete=models.CASCADE)
    class Meta:
        pass
    

class Viaje(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Relación con User
    salida = models.CharField(max_length=100)
    destino = models.CharField(max_length=100)
    fecha = models.DateField()
    

class ReservaUsuario(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Relación con User
    fecha = models.DateField()
    tipo_tour = models.CharField(max_length=100)
    medio_pago = models.CharField(max_length=50)
    costo = models.DecimalField(max_digits=10, decimal_places=2)
    adiciones = models.TextField()
    comentarios = models.TextField()
    


