# Registro de decisiones

Este registro conserva las decisiones arquitectónicas del proyecto Cactours.

## DEC-001 — Django exclusivamente como Backend API y Administración

- **Estado:** aprobado e implementado.
- **Decisión:** dedicar `cactours_backend` (antes `cactours_django`) exclusivamente a la capa de negocio, persistencia, administración (`Django Admin`) y exposición de una API REST versionada (`/api/v1/`).
- **Motivo:** permitir que tanto el cliente web como el cliente móvil consuman exactamente las mismas reglas de negocio y validaciones sin acoplar el backend al renderizado de plantillas HTML.

## DEC-002 — Aplicación móvil multiplataforma en React Native + Expo

- **Estado:** aprobado e implementado en estructura base (`cactours_mobile/`).
- **Decisión:** utilizar React Native con Expo y almacenamiento seguro (`expo-secure-store`) para iOS y Android.
- **Motivo:** compartir una sola base de código móvil conectada a `/api/v1/`.

## DEC-003 — Frontend Web SPA en Vue.js 3 + Vite

- **Estado:** aprobado e implementado (`cactours_frontend/`).
- **Decisión:** migrar la capa de presentación web de Django Templates a una Single Page Application (SPA) modular en **Vue.js 3 + Vite + Pinia + Vue Router**.
- **Motivo:** requerimiento directo de arquitectura para escalar la experiencia web de manera independiente del backend y homologar el consumo de la API REST entre Web (Vue.js) y Móvil (React Native).

## DEC-004 — Modularización del Backend por Dominios de Negocio

- **Estado:** aprobado e implementado (`cactours_backend/apps/`).
- **Decisión:** dividir la antigua aplicación monolítica `core` en 5 paquetes modulares:
  - `apps.common`: utilidades transversales, modelos base, autenticación por tokens y manejo de errores.
  - `apps.accounts`: usuarios, perfiles (`Persona`, `Cliente`, `Empleado`) y `AccountService`.
  - `apps.tours`: catálogo (`Tour`, `OpcionTour`, `ImagenTour`) y `TourCatalogService` (incluyendo recomendador por presupuesto).
  - `apps.bookings`: entidad canónica `Reserva`, `ReservaOpcion` y `BookingService`.
  - `apps.payments`: entidad `TransaccionPago` y `PaymentService` desacoplados de la solicitud de reserva.

## DEC-005 — Gestión de Secretos y Dependencias por Entorno

- **Estado:** aprobado e implementado.
- **Decisión:**
  - Prohibir claves secretas y contraseñas en el código fuente; utilizar variables de entorno (`.env` ignorado en `.gitignore` y documentado en `.env.example`).
  - Separar la configuración de Django en `config/settings/base.py`, `dev.py` y `prod.py`.
  - Separar los requerimientos de Python en `requirements/base.txt`, `requirements/dev.txt` y `requirements/prod.txt`.

## DEC-006 — Sistema de Diseño y Tokens de Marca

- **Estado:** confirmado.
- **Paleta:** Mineral Ivory `#F2EFE6`, Turquesa Cactours `#026374`, Azul petróleo `#156275`, Azul brillante `#069BE0`, Blanco `#FFFFFF` y Carbón `#111111`.
- **Tipografía:** Manrope para títulos/encabezados; DM Sans para interfaz y textos; Cormorant Garamond para detalles editoriales breves.
