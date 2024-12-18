# Generated by Django 5.1.3 on 2024-11-19 17:26

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_tour_ciudad_destino_tour_imagen'),
    ]

    operations = [
        migrations.CreateModel(
            name='ImagenTour',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('imagen', models.ImageField(upload_to='tours/')),
                ('descripcion', models.CharField(blank=True, max_length=100, null=True)),
                ('tour', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='imagenes', to='core.tour')),
            ],
        ),
    ]
