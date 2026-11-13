# Memoria del proyecto

Documento de continuidad para futuras sesiones de diseño y desarrollo. Registrar hechos verificados y decisiones aprobadas; no presentar propuestas como funcionalidades existentes.

## Contexto actual

- El repositorio contiene un proyecto Django en `cactours_django/`, una app Flask en `APP.py`, un SQL manual y recursos gráficos.
- Django ya tiene páginas y modelos iniciales para tours, perfiles y reservas, pero el flujo de reserva requiere correcciones antes de usarse como fuente de verdad.
- No hay app móvil ni API REST implementada todavía.
- La suite de pruebas no contiene casos de negocio.

## Dirección de producto

- Producto requerido: experiencia web y aplicación móvil.
- Móvil elegida: React Native + Expo.
- MVP: catálogo, cuentas, solicitudes de reserva, historial y administración.
- Pagos: la primera versión no procesa pagos; el gateway se considera para una fase posterior.

## Dirección técnica recomendada

- Django como backend canónico; API REST compartida para Expo.
- Django Templates responsive para la web del MVP.
- Tailwind CSS, GSAP y Three.js como herramientas objetivo para UX/UI web, aplicadas de forma selectiva.
- Estilo adicional a evaluar: anime.js, Lenis, glassmorphism y tarjetas 3D con spotlight reactivo. Beauty.js queda pendiente de confirmar por nombre exacto, documentación y mantenimiento antes de instalar.
- Para móvil, evaluar NativeWind y usar Reanimated/Gesture Handler para movimiento nativo.
- No asumir que una integración 3D está aprobada para todas las pantallas o dispositivos.

## Identidad visual propuesta

- Colores: Mineral Ivory `#F2EFE6`, Turquesa Cactours `#026374`, Azul petróleo `#156275`, Azul brillante `#069BE0`, Blanco `#FFFFFF` y Carbón `#111111`.
- Tipografías: Manrope para títulos, DM Sans para interfaces/textos y Cormorant Garamond para detalles editoriales.
- Revisar contraste WCAG antes de usar combinaciones de color en texto y controles. Los roles y límites están descritos en `DESIGN.md`.

## Riesgos y asuntos por resolver

- Hay desajustes entre campos/modelos de reserva y los datos enviados desde formularios.
- Los modelos de reserva podrían duplicar historial; definir una entidad y relación canónicas.
- Revisar protección de páginas privadas, roles y configuración de secretos antes de desplegar.
- Confirmar si existen datos MySQL productivos que deban conservarse antes de migrar o retirar archivos antiguos.
- Definir disponibilidad, cancelaciones, estados de reserva, hosting y proveedores de correo/medios.

## Regla de actualización

Al completar una decisión o fase, actualizar este documento y el correspondiente archivo (`DECISION.md`, `TASK.md` o `ARCHITECTURE.md`). Registrar la fecha solo si ayuda a reconstruir una decisión; evitar duplicar logs de conversaciones.

