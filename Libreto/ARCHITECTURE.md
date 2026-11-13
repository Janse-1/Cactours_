# Arquitectura de Cactours

> Estado: propuesta para el MVP. Este documento describe la arquitectura objetivo, no funcionalidades ya implementadas.

## Principios

- Django es la fuente única de verdad para reglas de negocio y datos.
- La web y la app móvil consumen los mismos tours, perfiles y reservas.
- Las reglas de precio, disponibilidad y permisos se validan en el servidor.
- Separar responsabilidades sin dividir el producto en servicios innecesarios.
- Mantener la web accesible y rápida; usar animación y 3D solo cuando mejoren la experiencia.

## Componentes propuestos

```text
Navegador web
  └── Django Templates + Tailwind CSS
        └── Django: vistas web y servicios de dominio

App iOS / Android
  └── React Native + Expo
        └── API REST versionada: Django REST Framework

Django
  ├── Autenticación, permisos y reglas de negocio
  ├── Catálogo, opciones y reservas
  ├── Django Admin para operación inicial
  └── Base de datos relacional + almacenamiento de imágenes
```

## Decisiones de implementación

- **Backend:** conservar el proyecto Django y organizar endpoints bajo `/api/v1/`.
- **Web:** mantener Django Templates para el MVP. Tailwind se compila como CSS estático; no introducir un segundo frontend web sin una necesidad comprobada.
- **Móvil:** React Native + Expo, consumiendo la API común. Usar almacenamiento seguro del dispositivo para credenciales.
- **Persistencia:** consolidar los modelos y migraciones de Django. Elegir PostgreSQL para un despliegue nuevo si no hay una base productiva que preservar; mantener MySQL si la continuidad de datos lo requiere.
- **Imágenes:** guardar referencias en la base de datos y servir archivos desde almacenamiento apropiado para producción; no depender del disco local del servidor.
- **Administración:** usar Django Admin para el MVP, con permisos y vistas adaptadas al trabajo de catálogo y reservas. Un panel personalizado puede añadirse si las necesidades operativas lo justifican.

## Responsabilidades del backend

- Autenticar usuarios y autorizar operaciones según rol y propietario.
- Publicar solo tours disponibles para consulta y reserva.
- Calcular el precio final a partir de tarifas y opciones almacenadas.
- Crear una solicitud de reserva y mantener un estado único consultable por web, móvil y administración.
- Validar todas las entradas; el cliente nunca es autoridad sobre el precio ni sobre la identidad del propietario de una reserva.

## Autenticación

- **Web:** sesiones de Django y protección CSRF para formularios.
- **App móvil:** tokens de acceso/renovación con vencimiento y almacenamiento seguro. Seleccionar e implementar una estrategia compatible con Django antes de iniciar la app.
- El alta de clientes no debe asignar privilegios administrativos. Los roles administrativos se conceden mediante una operación controlada.

## Modelo de dominio mínimo

- Usuario y perfil de cliente.
- Tour, destino, imágenes, opciones y precios.
- Reserva vinculada a un usuario y a un tour, con fecha/turno, cantidad, precio calculado y estado.
- En una fase futura: intento/transacción de pago asociado a una reserva, separado del estado de reserva.

La definición de disponibilidad, cancelación y conservación histórica queda pendiente de validación con el negocio. Revisar [models.py](../cactours_django/core/models.py), las migraciones y [cactours.sql](../cactours.sql) antes de migrar datos.

## Fuera del MVP arquitectónico

- Microservicios y múltiples fuentes de verdad.
- Cobro en línea hasta elegir proveedor y diseñar estados/webhooks.
- Un frontend web SPA independiente mientras Django Templates cubra el MVP.
- Renderizado 3D obligatorio o persistente en todos los dispositivos.

