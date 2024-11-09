# Generated by Django 5.1.3 on 2024-11-08 22:02

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Opcion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre_op', models.CharField(max_length=50)),
                ('descripcion', models.TextField()),
                ('precio_adic', models.DecimalField(decimal_places=2, max_digits=10)),
            ],
        ),
        migrations.CreateModel(
            name='Persona',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=50)),
                ('apellido', models.CharField(max_length=50)),
                ('identificacion', models.CharField(max_length=50, unique=True)),
                ('correo', models.EmailField(max_length=50)),
                ('telefono', models.CharField(max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='TablaMaestra',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('categoria', models.CharField(max_length=50)),
                ('valor', models.CharField(max_length=50, unique=True)),
                ('descripcion', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Cliente',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('contador_reservas', models.IntegerField(default=0)),
                ('persona', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.persona')),
            ],
        ),
        migrations.CreateModel(
            name='Empleado',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha_contratacion', models.DateField()),
                ('cargo', models.CharField(max_length=50)),
                ('salario', models.DecimalField(decimal_places=2, max_digits=10)),
                ('persona', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.persona')),
                ('estado', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='empleados', to='core.tablamaestra')),
            ],
        ),
        migrations.CreateModel(
            name='Tour',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre_tour', models.CharField(max_length=50)),
                ('descripcion', models.TextField()),
                ('costo', models.DecimalField(decimal_places=2, max_digits=10)),
                ('estado', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tours', to='core.tablamaestra')),
            ],
        ),
        migrations.CreateModel(
            name='Reserva',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('costo_total', models.DecimalField(decimal_places=2, max_digits=10)),
                ('fecha', models.DateField()),
                ('hora', models.TimeField()),
                ('destino', models.CharField(max_length=50)),
                ('cant_personas', models.IntegerField()),
                ('comentarios', models.TextField()),
                ('cliente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.cliente')),
                ('medio_pago', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reservas', to='core.tablamaestra')),
                ('tour', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.tour')),
            ],
        ),
        migrations.CreateModel(
            name='ToursOpc',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('opcion', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.opcion')),
                ('tour', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.tour')),
            ],
            options={
                'unique_together': {('tour', 'opcion')},
            },
        ),
    ]