# Hoja de ruta y tareas

## Fase 1 — Refactorización Arquitectónica y Dominio (Completado)

- [x] Traer los últimos cambios del repositorio remoto (`Libreto/`, `README.md`, limpieza de archivos antiguos).
- [x] Crear `.gitignore` en la raíz y plantillas `.env.example` para proteger secretos y credenciales.
- [x] Renombrar y reestructurar `cactours_django` a `cactours_backend` con `config/settings/{base,dev,prod}.py`.
- [x] Separar archivos `requirements` para cada caso (`requirements/base.txt`, `dev.txt`, `prod.txt`).
- [x] Modularizar la app monolítica `core` en dominios: `common`, `accounts`, `tours`, `bookings` y `payments`.
- [x] Corregir lógica de negocio: modelo único de reserva, cálculo de precio con `Decimal` en servidor, eliminación de escalación de privilegios por correo y recomendador por presupuesto en backend.
- [x] Crear estructura del frontend web en **Vue.js 3 + Vite** (`cactours_frontend/`).
- [x] Crear estructura de la app móvil en **React Native + Expo** (`cactours_mobile/`).
- [x] Añadir y ejecutar pruebas automatizadas de negocio y seguridad en el backend.
- [x] [QA #7] Diseñar matriz de pruebas funcionales Web y API (`docs/qa/matriz_pruebas_funcionales.md` y `.csv`).
- [x] [QA #6] Ampliar cobertura de pruebas automatizadas de API y reglas de negocio en Django (33 pruebas en `apps.*.tests`).

## Fase 2 — Evolución Funcional y Experiencia de Usuario

- [ ] Conectar pasarela de pagos colombiana (ej. Wompi / PayU) en `apps.payments` con validación de firma de webhooks.
- [ ] Ampliar pantallas móviles en `cactours_mobile` (flujo completo de autenticación, detalle con carrusel nativo y perfil).
- [ ] Incorporar animaciones selectivas con GSAP en `cactours_frontend` respetando `prefers-reduced-motion`.
- [ ] Configurar pipeline CI/CD para ejecutar pruebas de Django (`manage.py test`) y build de Vite en cada Pull Request.
