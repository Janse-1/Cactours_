# Arquitectura de Cactours

> **Estado:** Arquitectura refactorizada y activa (Monorepo desacoplado API-first: Django Backend + Vue.js Web + React Native Mobile).

## 1. Objetivo

Cactours es una plataforma multiplataforma (Web y Móvil) de descubrimiento de tours y gestión de reservas turísticas. La arquitectura desacoplada garantiza:

- **Una única fuente de verdad** para datos, seguridad y reglas de negocio en `cactours_backend` (Django + REST API).
- **Escalabilidad de clientes independientes:** Web SPA en **Vue.js 3 + Vite** (`cactours_frontend`) y App Móvil nativa en **React Native + Expo** (`cactours_mobile`), consumiendo los mismos endpoints `/api/v1/`.
- **Modularidad por dominio (DDD pragmático):** separación en aplicaciones especializadas (`common`, `accounts`, `tours`, `bookings`, `payments`) con capa de servicios (`services.py`).
- **Seguridad desde el diseño (Zero Secrets in Repo):** configuración por variables de entorno (`.env`) y separación estricta de dependencias (`requirements/base.txt`, `dev.txt`, `prod.txt`).

## 2. Stack Tecnológico

```text
Clientes (Presentación)
  ├── Web SPA: cactours_frontend (Vue.js 3 + Vite + Pinia + Vue Router)
  └── App Móvil: cactours_mobile (React Native + Expo + SecureStore)
        │
        ▼  HTTPS / JSON (Bearer Token / JWT)
Backend API & Reglas de Negocio: cactours_backend (Django 5 + DRF)
  ├── /api/v1/auth/      -> apps.accounts (Registro seguro, Login, Tokens, Perfil)
  ├── /api/v1/tours/     -> apps.tours    (Catálogo, Opciones, Galería, Recomendador por Presupuesto)
  ├── /api/v1/bookings/  -> apps.bookings (Cotización en servidor, Solicitudes e Historial único)
  ├── /api/v1/payments/  -> apps.payments (Intenciones y transacciones desacopladas de la reserva)
  └── /admin/            -> Django Admin  (Operación y gestión de catálogo/reservas)
        │
        ▼
Persistencia
  └── MySQL (Producción / Estándar) y SQLite (Desarrollo rápido / Suite de pruebas)
```

## 3. Estructura del Repositorio

```text
Cactours/
├── .gitignore                        # Protección contra subida de secretos, .env, DBs y artefactos
├── .env.example                      # Plantilla global de variables de entorno
├── README.md                         # Guía maestra de instalación y arquitectura
├── Libreto/                          # Documentación viva de arquitectura y producto
│   ├── ARCHITECTURE.md
│   ├── DECISION.md
│   ├── DESIGN.md
│   ├── MEMORY.md
│   ├── PRD.md
│   ├── RULES.md
│   └── TASK.md
├── cactours_backend/                 # Backend Django exclusivamente API REST + Admin
│   ├── .env.example
│   ├── manage.py
│   ├── requirements.txt              # Apunta por defecto a requirements/dev.txt
│   ├── requirements/
│   │   ├── base.txt                  # Dependencias núcleo (Django, DRF, SimpleJWT, CORS, MySQL, Pillow)
│   │   ├── dev.txt                   # Testing y calidad (pytest, black, flake8, isort)
│   │   └── prod.txt                  # Despliegue (gunicorn, uvicorn, whitenoise, sentry-sdk)
│   ├── config/
│   │   ├── asgi.py
│   │   ├── wsgi.py
│   │   ├── urls.py
│   │   └── settings/
│   │       ├── base.py               # Configuración común basada en variables de entorno
│   │       ├── dev.py                # Desarrollo local y pruebas
│   │       └── prod.py               # Producción endurecida (HTTPS/HSTS/Secretos obligatorios)
│   ├── apps/
│   │   ├── common/                   # TimeStampedModel, tokens firmados, CORS y utilidades HTTP
│   │   ├── accounts/                 # Persona, Cliente, Empleado y AccountService
│   │   ├── tours/                    # Tour, OpcionTour, ImagenTour y TourCatalogService
│   │   ├── bookings/                 # Reserva canónica, ReservaOpcion y BookingService
│   │   └── payments/                 # TransaccionPago y PaymentService
│   └── media/
│       └── tours/                    # Recursos multimedia de tours
├── cactours_frontend/                # Aplicación Web SPA en Vue.js 3 + Vite
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── public/images/
│   └── src/
│       ├── api/                      # Cliente HTTP e integración con /api/v1/
│       ├── assets/styles/tokens.css  # Tokens visuales de marca Cactours
│       ├── components/               # Componentes reutilizables (Navbar, Footer, TourCard, Recommender)
│       ├── router/                   # Rutas SPA y guardias de autenticación
│       ├── stores/                   # Estado global con Pinia (auth, tours, bookings)
│       └── views/                    # Vistas de página (Home, Catálogo, Detalle, Checkout, Perfil, Auth)
└── cactours_mobile/                  # Aplicación Móvil en React Native + Expo
    ├── .env.example
    ├── package.json
    ├── app.json
    ├── App.js
    └── src/
        ├── api/client.js             # Cliente API móvil con Expo SecureStore
        ├── theme/tokens.js           # Tokens de marca equivalentes para React Native
        └── screens/                  # Pantallas nativas (Catálogo, Reserva, Perfil)
```

## 4. Mejoras de Dominio y Lógica de Negocio Aplicadas

1. **Eliminación de `TablaMaestra` genérica:** reemplazada por enumeraciones fuertemente tipadas (`models.TextChoices`: `EstadoEmpleado`, `EstadoTour`, `EstadoReserva`, `MedioPagoPreferido`, `EstadoTransaccion`), evitando fallos en tiempo de ejecución por catálogos vacíos.
2. **Unificación del modelo de Reservas:** se eliminaron las tablas duplicadas `ReservaUsuario`, `Viaje` y `ToursOpc`. Ahora existe una única entidad canónica `Reserva` acompañada de `ReservaOpcion` (que guarda una instantánea del precio de cada adición en el momento de reservar).
3. **Cálculo de precios en servidor con `Decimal`:** `BookingService` calcula `subtotal_base`, `subtotal_opciones` y `costo_total` exclusivamente en el backend usando `Decimal`, ignorando cualquier monto manipulado desde el cliente.
4. **Corrección de vulnerabilidad de escalación de privilegios:** `AccountService.registrar_cliente()` nunca asigna `is_staff = True` basándose en el dominio `@cactours.com` del correo registrado.
5. **Motor de recomendación por presupuesto en servidor:** la lógica de personalización por presupuesto (antes hardcodeada en el navegador) ahora reside en `TourCatalogService.recomendar_por_presupuesto()`.
