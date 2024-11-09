from django.db import models

class TablaMaestra(models.Model):
    categoria = models.CharField(max_length=50)
    valor = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField()

    def __str__(self):
        return self.valor

class Persona(models.Model):
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

class Tour(models.Model):
    nombre_tour = models.CharField(max_length=50)
    descripcion = models.TextField()
    costo = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.ForeignKey(TablaMaestra, on_delete=models.CASCADE, related_name='tours')

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

class Opcion(models.Model):
    nombre_op = models.CharField(max_length=50)
    descripcion = models.TextField()
    precio_adic = models.DecimalField(max_digits=10, decimal_places=2)

class ToursOpc(models.Model):
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE)
    opcion = models.ForeignKey(Opcion, on_delete=models.CASCADE)
    class Meta:
        unique_together = ('tour', 'opcion')
