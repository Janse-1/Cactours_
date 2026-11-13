# Arquitectura de Cactours

> Estado: propuesta de arquitectura para el MVP. Este documento define la estructura objetivo del sistema, la organización del código y la distribución del proyecto, sin asumir que todas las funcionalidades ya están implementadas.

## 1. Objetivo

Cactours es una plataforma de reservas y gestión turística orientada a una experiencia web inicial, con posibilidad de expansión a una aplicación móvil en una segunda etapa. La arquitectura propuesta prioriza:

- una base tecnológica estable y mantenible,
- una única fuente de verdad para datos y reglas de negocio,
- una separación clara entre presentación, negocio y persistencia,
- una evolución gradual sin introducir complejidad innecesaria.

## 2. Principios arquitectónicos

- Django será la capa central de negocio y persistencia.
- La web y la app móvil consumen la misma información y reglas del negocio.
- La validación del precio, disponibilidad, autenticación y permisos se realiza en el backend.
- Se evita la fragmentación innecesaria en microservicios.
- La experiencia web debe mantenerse rápida y accesible; la animación y 3D solo se incorporan si aportan valor real al usuario.
- La solución debe estar lista para crecer sin reescribir la base del proyecto.

## 3. Stack tecnológico propuesto

```text
Cliente web
  └── Django Templates + HTML/CSS/JS
        └── Django Application
              ├── Autenticación
              ├── Catálogo de tours
              ├── Reservas
              ├── Gestión de imágenes
              └── Administración

App móvil (futuro)
  └── React Native + Expo
        └── API REST versionada
              └── Django REST Framework

Base de datos
  └── PostgreSQL (recomendado para nuevo despliegue)
      o MySQL si el proyecto ya requiere continuidad con datos existentes
```

## 4. Arquitectura lógica

```text
Navegador / Usuario
    │
    ▼
Django Templates (web)
    │
    ├── Vistas web
    ├── Formularios
    ├── Render de páginas
    └── Validación de sesión/CSRF
    │
    ▼
Django backend
    ├── Auth / Roles / Permisos
    ├── Modelo de dominio
    ├── Reglas de negocio
    ├── Gestión de reservas
    ├── Cálculo de precios y opciones
    └── Administración
    │
    ▼
Base de datos relacional
    ├── Usuarios
    ├── Clientes
    ├── Tours
    ├── Destinos
    ├── Imágenes
    └── Reservas
```

## 5. Decisiones de implementación

### 5.1 Backend
- Mantener Django como base central del sistema.
- Organizar el código por módulos funcionales y servicios de dominio.
- Exponer endpoints REST bajo una versión estable, por ejemplo `/api/v1/`.

### 5.2 Frontend web
- Mantener Django Templates para el MVP.
- Usar Tailwind o CSS modular para una interfaz consistente y mantenible.
- No introducir un frontend SPA separado mientras la web siga cubriendo el caso de uso principal.

### 5.3 Aplicación móvil
- Desarrollar una capa API reutilizable para web y móvil.
- Implementar autenticación segura con tokens y renovaciones.
- Utilizar almacenamiento seguro del dispositivo para credenciales.

### 5.4 Persistencia
- Consolidar modelos y migraciones dentro de Django.
- Para despliegue nuevo: priorizar PostgreSQL.
- Si ya existe una base productiva en MySQL, mantenerla y migrar de forma controlada.

### 5.5 Imágenes
- Guardar metadatos e identificadores de las imágenes en la base de datos.
- Servir archivos desde almacenamiento apropiado en producción.
- Evitar depender de archivos temporales o del disco local del servidor.

### 5.6 Administración
- Usar Django Admin como herramienta principal para operación inicial.
- Definir permisos por rol y funcionalidad.
- Añadir un panel custom si la operación lo exige en una fase posterior.

## 6. Responsabilidades del backend

- Gestionar autenticación y autorización por usuario y rol.
- Validar y publicar tours disponibles para consulta y reserva.
- Calcular el precio final a partir de las tarifas y opciones configuradas.
- Crear reservas con un estado único y consultable por web, móvil y administración.
- Centralizar la validación de entradas para evitar manipulación del cliente.
- Proteger la lógica de negocio de cambios del frontend.

## 7. Autenticación y autorización

- Web: sesiones de Django con protección CSRF en formularios.
- Móvil: uso de tokens de acceso y renovación con expiración.
- Los clientes no deben recibir privilegios administrativos por defecto.
- Los permisos administrativos deben asignarse mediante una operación controlada y auditable.

## 8. Modelo de dominio mínimo

El dominio inicial debe considerar:

- Usuario y perfil de cliente.
- Tour, destino, imágenes, opciones y precios.
- Reserva asociada a usuario, tour, fecha/turno, cantidad, precio y estado.
- Entidad de pago futura, separada del estado de la reserva.

La definición precisa de disponibilidad, cancelación, historial y política de reembolso debe validarse con el negocio antes de expandir el dominio.

## 9. Estructura recomendada del repositorio

A continuación se muestra la distribución esperada del proyecto, con una organización clara y escalable para Django:

```text
Cactours_
├── APP.py
├── cactours.sql
├── README.md (opcional)
├── .env.example (opcional)
├── Libreto/
│   ├── ARCHITECTURE.md
│   ├── DECISION.md
│   ├── DESIGN.md
│   ├── MEMORY.md
│   ├── PRD.md
│   ├── RULES.md
│   └── TASK.md
├── cactours_django/
│   ├── manage.py
│   ├── db.sqlite3
│   ├── cactours_django/
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings/
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── dev.py
│   │   │   └── prod.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── forms.py
│   │   ├── models.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   ├── views.py
│   │   ├── migrations/
│   │   │   └── __init__.py
│   │   ├── templates/
│   │   │   ├── base.html
│   │   │   ├── index.html
│   │   │   ├── login.html
│   │   │   ├── registro.html
│   │   │   ├── usuario.html
│   │   │   ├── reservas.html
│   │   │   ├── pagos.html
│   │   │   └── ...
│   │   └── static/
│   │       ├── css/
│   │       ├── js/
│   │       └── images/
│   ├── media/
│   │   ├── tours/
│   │   └── ...
│   └── requirements.txt
└── docs/ (opcional, para despliegue y operación)
    ├── deployment.md
    ├── environment.md
    └── api.md
```

## 10. Estructura funcional recomendada para crecimiento

A medida que el sistema escala, conviene separar módulos por dominio para evitar que la app `core` crezca sin control. Una propuesta de organización es:

```text
cactours_django/
├── apps/
│   ├── accounts/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── forms.py
│   │   └── urls.py
│   ├── tours/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   ├── bookings/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── services.py
│   │   └── urls.py
│   └── payments/ (futuro)
│       ├── models.py
│       ├── services.py
│       └── urls.py
├── common/
│   ├── mixins.py
│   ├── utils.py
│   └── permissions.py
├── templates/
├── static/
├── media/
├── cactours_django/
│   ├── settings/
│   ├── urls.py
│   └── wsgi.py
└── manage.py
```

## 11. Fuera del alcance arquitectónico del MVP

Los siguientes elementos no forman parte de la arquitectura mínima del MVP:

- microservicios y múltiples fuentes de verdad,
- cobro en línea completo sin decidir proveedor,
- frontend web separado basado en SPA mientras Django Templates cubra la necesidad,
- renderizado 3D obligatorio o persistente,
- complejidad de integración excesiva antes de validar el negocio.

## 12. Recomendación final

La arquitectura propuesta es sólida para un MVP de reservas turísticas con Django, y mantiene la posibilidad de evolución hacia API móvil y módulos especializados. El principal punto de mejora es organizar el dominio y la estructura del código de forma más modular, evitando que la app `core` acumule responsabilidades de diferentes dominios.

La definición de disponibilidad, cancelación, historial y pagos debe validarse con el negocio antes de cerrar la capa de dominio. Asimismo, se recomienda revisar [cactours_django/core/models.py](../cactours_django/core/models.py), las migraciones y [cactours.sql](../cactours.sql) antes de migrar cualquier dato o consolidar la base de producción.

