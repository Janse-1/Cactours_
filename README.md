# Cactours — Plataforma Turística Multiplataforma (Backend Django + Web Vue.js + Móvil React Native)

Plataforma escalable para descubrir experiencias turísticas en La Guajira y Colombia, cotizar planes según presupuesto y gestionar solicitudes de reserva desde Web y Móvil sobre una única fuente de verdad.

## Arquitectura del Monorepo

```text
Cactours/
├── .gitignore                   # Reglas para excluir secretos (.env), entornos (.venv, node_modules) y artefactos
├── .env.example                 # Variables de entorno de referencia global
├── Libreto/                     # Documentación de arquitectura, decisiones, PRD, diseño y tareas
├── cactours_backend/            # Backend API REST en Django 5 (antes cactours_django)
│   ├── config/settings/         # Configuración modular por entorno: base.py, dev.py, prod.py
│   ├── requirements/            # Dependencias por caso: base.txt, dev.txt, prod.txt
│   ├── apps/
│   │   ├── common/              # Modelos base, autenticación Bearer Token, CORS y respuestas JSON
│   │   ├── accounts/            # Usuarios, Personas, Clientes, Empleados y AccountService
│   │   ├── tours/               # Catálogo de Tours, Opciones, Galería y Recomendador por Presupuesto
│   │   ├── bookings/            # Modelo canónico de Reservas, Cotizador y BookingService
│   │   └── payments/            # Registro de Transacciones de Pago desacoplado de la reserva
│   └── media/tours/             # Imágenes del catálogo de tours
├── cactours_frontend/           # Aplicación Web SPA en Vue.js 3 + Vite + Pinia + Vue Router
└── cactours_mobile/             # Aplicación Móvil en React Native + Expo (iOS y Android)
```

---

## 1. Configuración del Backend (`cactours_backend`)

### 1.1 Activar entorno virtual e instalar dependencias según el caso

Desde la raíz del repositorio en PowerShell:

```powershell
# Crear entorno virtual si no existe
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Instalar dependencias según el entorno:
# Caso Desarrollo y Testing:
pip install -r .\cactours_backend\requirements\dev.txt

# Caso Base:
pip install -r .\cactours_backend\requirements\base.txt

# Caso Producción:
pip install -r .\cactours_backend\requirements\prod.txt
```

### 1.2 Variables de entorno

Copia la plantilla `.env.example` a `.env` dentro de `cactours_backend/` (nunca se sube al repositorio):

```powershell
Copy-Item .\cactours_backend\.env.example .\cactours_backend\.env
```

> En desarrollo local, si `DB_ENGINE=sqlite` (o si aún no has definido `DB_PASSWORD` para MySQL), el proyecto utiliza automáticamente SQLite para facilitar pruebas rápidas. Para usar MySQL, define `DB_ENGINE=mysql` y tus credenciales locales en `cactours_backend/.env`.

### 1.3 Migraciones, pruebas y ejecución

```powershell
Set-Location .\cactours_backend
python manage.py makemigrations
python manage.py migrate
python manage.py test
python manage.py runserver
```

### 1.4 Endpoints principales de la API REST (`/api/v1/`)

| Método | Endpoint | Descripción |
| --- | --- | --- |
| `GET` | `/api/v1/health/` | Estado del servicio y mapa de endpoints |
| `POST` | `/api/v1/auth/register/` | Registro seguro de cliente y emisión de tokens |
| `POST` | `/api/v1/auth/login/` | Inicio de sesión (retorna `access` y `refresh` token) |
| `POST` | `/api/v1/auth/refresh/` | Renovación de token de acceso |
| `GET / PATCH` | `/api/v1/auth/me/` | Perfil del usuario autenticado |
| `GET` | `/api/v1/tours/` | Catálogo de tours publicados (filtros: `destino`, `q`, `presupuesto_max`) |
| `GET` | `/api/v1/tours/<id>/` | Detalle de un tour con galería y opciones adicionales |
| `POST` | `/api/v1/tours/recomendador/` | Recomendador de tours y adiciones según presupuesto en COP |
| `POST` | `/api/v1/bookings/cotizar/` | Cálculo exacto de precio en servidor (base + opciones) |
| `GET / POST` | `/api/v1/bookings/` | Historial del cliente y creación de solicitud de reserva |
| `GET / PATCH` | `/api/v1/bookings/<id>/` | Detalle o cancelación de una solicitud de reserva |
| `GET / POST` | `/api/v1/payments/` | Consulta y registro de intenciones de pago |

### 1.5 Contrato OpenAPI

El contrato de integración está disponible mientras el backend ejecuta Django en desarrollo:

- Esquema OpenAPI: `http://localhost:8000/api/v1/schema/`
- Interfaz Swagger: `http://localhost:8000/api/v1/docs/`
- Interfaz ReDoc: `http://localhost:8000/api/v1/redoc/`

Los endpoints protegidos usan el esquema Bearer:

```text
Authorization: Bearer <access_token>
```

---

## 2. Configuración del Frontend Web en Vue.js (`cactours_frontend`)

```powershell
Set-Location .\cactours_frontend
Copy-Item .\.env.example .\.env
npm install
npm run dev
```

La aplicación web estará disponible en `http://localhost:5173` conectada a `http://localhost:8000/api/v1`.

### Sistema visual compartido

- Los colores, tipografías, escalas, controles y foco global se definen en `cactours_frontend/src/assets/styles/tokens.css`.
- `cactours_frontend/src/components/feedback/FeedbackState.vue` unifica estados de carga, error, vacío y éxito. Usa `variant`, `title` y `message`; las acciones opcionales van en el slot `actions`.
- Conserva las etiquetas nativas de los formularios y ofrece una vista estática cuando el usuario prefiere movimiento reducido.

---

## 3. Configuración de la App Móvil en React Native (`cactours_mobile`)

```powershell
Set-Location .\cactours_mobile
Copy-Item .\.env.example .\.env
npm install
npx expo start
```

La app móvil comparte con la web el catálogo, la autenticación, el perfil, las cotizaciones y las solicitudes de reserva. En el primer inicio presenta una bienvenida animada y un onboarding de tres pasos; la preferencia se guarda en el dispositivo para no repetirlo. El acceso permite iniciar sesión, registrarse y solicitar un restablecimiento de contraseña por correo.

Para el emulador Android, configura `EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api/v1`; en un teléfono físico, usa la IP local del computador y asegúrate de que el backend escuche en la red local. Las reservas son solicitudes sujetas a confirmación; la app no procesa pagos en línea.

---

## Documentación Técnica (`Libreto/`)

- [Arquitectura](Libreto/ARCHITECTURE.md)
- [Decisiones Arquitectónicas](Libreto/DECISION.md)
- [Sistema de Diseño UX/UI](Libreto/DESIGN.md)
- [PRD — Requisitos del Producto](Libreto/PRD.md)
- [Reglas de Desarrollo y Seguridad](Libreto/RULES.md)
- [Memoria del Proyecto](Libreto/MEMORY.md)
- [Hoja de Ruta y Tareas](Libreto/TASK.md)
