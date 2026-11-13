# Cactours

Plataforma web para descubrir tours y gestionar reservas. El proyecto utiliza Django para el backend y las páginas web, con MySQL como motor de base de datos.

> **Estado:** MVP en desarrollo. Algunas capacidades descritas en la arquitectura —como la API móvil, la autenticación móvil y los pagos en línea— todavía no están implementadas.

## Contenido

- [Descripción](#descripción)
- [Tecnologías](#tecnologías)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos](#requisitos)
- [Configuración local](#configuración-local)
- [Comandos habituales](#comandos-habituales)
- [Rutas principales](#rutas-principales)
- [Documentación](#documentación)
- [Notas de seguridad y despliegue](#notas-de-seguridad-y-despliegue)

## Descripción

Cactours es una aplicación web para una agencia turística. La implementación actual contiene páginas Django para el catálogo y el flujo de reservas, junto con modelos para usuarios, personas, tours y reservas. La lógica del backend y las plantillas están en la aplicación Django `core`.

El repositorio también conserva `APP.py` y `cactours.sql` en la raíz. El punto de entrada web de Django es `cactours_django/manage.py`.

## Tecnologías

- **Python y Django:** backend y renderizado de páginas.
- **MySQL:** base de datos configurada para el proyecto.
- **Django Templates:** interfaz web actual.
- **HTML, CSS y JavaScript:** recursos de la interfaz.
- **Vite:** compila los recursos web; sus dependencias se administran con npm y `package.json`.
- **React Native + Expo:** opción prevista para una aplicación móvil futura, no incluida en el estado actual.

## Estructura del repositorio

```text
Cactours_/
├── APP.py                         # Aplicación Flask heredada
├── cactours.sql                   # Script SQL existente
├── README.md
├── Libreto/                       # Documentación funcional y técnica
│   ├── ARCHITECTURE.md
│   ├── DECISION.md
│   ├── DESIGN.md
│   ├── MEMORY.md
│   ├── PRD.md
│   ├── RULES.md
│   └── TASK.md
└── cactours_django/               # Aplicación web Django
    ├── manage.py
    ├── requirements.txt
    ├── package.json                # Herramientas del frontend
    ├── package-lock.json
    ├── vite.config.js
    ├── cactours_django/           # Configuración del proyecto Django
    │   ├── settings.py
    │   ├── urls.py
    │   ├── asgi.py
    │   └── wsgi.py
    ├── core/                      # Funcionalidad principal
    │   ├── models.py
    │   ├── views.py
    │   ├── forms.py
    │   ├── urls.py
    │   ├── migrations/
    │   ├── templates/
    │   └── static/
    ├── frontend/                  # Código fuente y salida de Vite
    │   ├── src/
    │   │   ├── main.js
    │   │   └── styles.css
    │   └── dist/                  # Salida generada (no se versiona)
    ├── media/                     # Archivos multimedia subidos
    └── tours/                     # Recursos de tours existentes
```

## Requisitos

- Python compatible con Django 5.1 (se recomienda Python 3.12 o 3.13).
- MySQL Server en ejecución.
- Git.
- Node.js 20.19+ o 22.12+ y npm para Vite.

## Configuración local

Los siguientes comandos están escritos para PowerShell y se ejecutan desde la raíz del repositorio.

### 1. Crear y activar un entorno virtual

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Si PowerShell impide activar el entorno, consulta la política de ejecución de tu equipo o activa el entorno desde una terminal compatible.

### 2. Instalar dependencias de Python

```powershell
python -m pip install --upgrade pip
python -m pip install -r .\cactours_django\requirements.txt
```

### 3. Instalar dependencias del frontend

```powershell
Set-Location .\cactours_django
npm ci
Set-Location ..
```

### 4. Crear la base de datos MySQL

En MySQL, crea una base de datos con el nombre configurado por el proyecto:

```sql
CREATE DATABASE cactours_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

La conexión se define actualmente en `cactours_django/cactours_django/settings.py`. Antes de ejecutar la aplicación, configura ahí el host, el puerto, el usuario y la contraseña de tu instancia MySQL. Usa un usuario de base de datos dedicado y no publiques credenciales.

### 5. Aplicar migraciones

```powershell
Set-Location .\cactours_django
python manage.py migrate
```

### 6. Crear un usuario administrador

```powershell
python manage.py createsuperuser
```

### 7. Iniciar Django y Vite

Abre dos terminales, activa el entorno virtual en ambas y ejecuta:

**Terminal 1 — Django**

```powershell
Set-Location .\cactours_django
python manage.py runserver
```

**Terminal 2 — Vite**

```powershell
Set-Location .\cactours_django
npm run dev
```

Abre <http://127.0.0.1:8000/> en el navegador. El panel de administración está disponible en <http://127.0.0.1:8000/admin/>.

En desarrollo, las plantillas que usan `base.html` reciben los recursos desde el servidor Vite con recarga en caliente. Las páginas independientes pueden seguir cargando sus archivos estáticos directamente desde Django.

## Comandos habituales

Ejecuta estos comandos desde `cactours_django/` con el entorno virtual activado:

```powershell
python manage.py check
python manage.py makemigrations
python manage.py migrate
python manage.py test
```

Para recopilar los archivos estáticos en una preparación de despliegue:

```powershell
Set-Location .\cactours_django
npm run build
python manage.py collectstatic
```

En producción, configura `DEBUG = False` y ejecuta la compilación de Vite antes de `collectstatic`; Django-Vite lee el manifiesto generado en `frontend/dist/manifest.json`.

## Rutas principales

| Ruta | Descripción |
| --- | --- |
| `/` | Página principal |
| `/reservas/` | Consulta de tours y comienzo del flujo de reserva |
| `/registro/` | Registro de usuario |
| `/login/` | Inicio de sesión |
| `/usuario/` | Página del usuario autenticado |
| `/pagos/<tour_id>/` | Formulario asociado a un tour |
| `/admin/` | Administración de Django |

Las rutas pueden cambiar conforme evolucione el MVP. El cobro en línea no debe considerarse disponible solo por la existencia de una página de pago.

## Documentación

- [Arquitectura](Libreto/ARCHITECTURE.md): componentes, estructura objetivo y decisiones técnicas.
- [Requisitos del producto](Libreto/PRD.md): alcance funcional.
- [Diseño](Libreto/DESIGN.md): lineamientos de interfaz.
- [Decisiones](Libreto/DECISION.md): decisiones y alternativas del proyecto.
- [Tareas](Libreto/TASK.md): trabajo pendiente.
- [Reglas](Libreto/RULES.md): convenciones y criterios de trabajo.

## Notas de seguridad y despliegue

- No despliegues con `DEBUG = True`.
- No uses credenciales de administrador de MySQL para la aplicación.
- Mantén la clave secreta y las credenciales fuera del control de versiones; la configuración actual debe migrarse a variables de entorno antes de un despliegue.
- Configura `ALLOWED_HOSTS`, HTTPS, archivos estáticos y almacenamiento de medios para el entorno de producción.
- Ejecuta y revisa las migraciones antes de desplegar cambios de modelos.
- No uses `runserver` como servidor de producción.
- Valida y prueba los flujos de autenticación y reservas antes de habilitarlos para usuarios reales.