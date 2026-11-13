# Memoria del proyecto

Documento de continuidad para sesiones de arquitectura, diseño y desarrollo.

## Contexto actual (Post-Refactorización Arquitectónica)

- El proyecto fue refactorizado a una arquitectura monorepo de tres capas limpias:
  1. `cactours_backend/`: Backend API REST en Django modularizado por dominio (`apps/common`, `apps/accounts`, `apps/tours`, `apps/bookings`, `apps/payments`) y configuración por entorno (`config/settings/base.py`, `dev.py`, `prod.py`).
  2. `cactours_frontend/`: Aplicación Web SPA en **Vue.js 3 + Vite + Pinia + Vue Router** con los tokens de diseño oficiales de Cactours.
  3. `cactours_mobile/`: Aplicación Móvil en **React Native + Expo** conectada a la misma API `/api/v1/`.
- Se agregó `.gitignore` en la raíz del repositorio y plantillas `.env.example` para evitar subir claves secretas, contraseñas de base de datos, entornos virtuales (`.venv/`) o bases locales (`db.sqlite3`).
- Se organizaron las dependencias del backend por caso de uso en `cactours_backend/requirements/` (`base.txt`, `dev.txt`, `prod.txt`).

## Mejoras de lógica de negocio implementadas

- **Modelo canónico de reservas:** se eliminó la duplicación entre `Reserva`, `ReservaUsuario`, `Viaje` y `ToursOpc`. Ahora `apps.bookings.models.Reserva` y `ReservaOpcion` son la única fuente de verdad.
- **Seguridad en registro:** se eliminó la asignación automática de `is_staff = True` para correos terminados en `@cactours.com`.
- **Cálculo en servidor:** `BookingService` calcula todos los subtotales y totales con `Decimal` en el backend, incluyendo las opciones adicionales seleccionadas.
- **Suite de pruebas automatizadas:** pruebas unitarias y de integración en `apps.accounts`, `apps.tours`, `apps.bookings` y `apps.payments` verificadas con `manage.py test`.
