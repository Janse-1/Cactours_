# Reglas de producto y desarrollo

## Producto y UX/UI

- Diseñar para móvil primero y mantener paridad funcional entre web y app para los flujos MVP.
- Usar español claro y no presentar una solicitud como reserva confirmada o pago procesado.
- Priorizar legibilidad, accesibilidad, estados visibles y navegación sencilla sobre efectos decorativos.
- Mantener un sistema visual común con tokens; no copiar estilos distintos por pantalla.
- Preferir Tailwind CSS en web; evaluar NativeWind para Expo sin tratar CSS web como CSS nativo.
- Usar GSAP en web y Reanimated/Gesture Handler en móvil, respetando movimiento reducido.
- Usar Three.js solo si tiene propósito de producto, fallback no 3D y presupuesto de rendimiento aceptable.

## Arquitectura

- Django es la fuente única para datos y lógica de negocio.
- Las apps cliente nunca determinan el precio final ni el propietario de una reserva.
- Reutilizar servicios y validaciones del dominio entre vistas web y API.
- No agregar otro framework de frontend, servicio o dependencia grande sin documentar el motivo y el impacto.
- Mantener cambios de esquema mediante migraciones revisadas; no editar bases productivas directamente.

## Seguridad y privacidad

- No guardar secretos, claves, contraseñas ni datos de tarjetas en el repositorio.
- No dar rol administrativo según un correo autorregistrado; los privilegios se asignan explícitamente.
- Proteger rutas y objetos por autenticación, rol y propietario en el backend.
- Validar en servidor toda entrada recibida desde navegador o app móvil.
- Recoger solo datos personales necesarios y evitar exponerlos en logs.

## Calidad

- Añadir pruebas focalizadas para nuevas reglas de negocio y regresiones.
- Probar casos válidos, inválidos, límites y permisos.
- Ejecutar checks y pruebas pertinentes antes de integrar cambios.
- Manejar fallos de red, formularios, API y medios con mensajes recuperables; no ocultar errores.
- Verificar el diseño con teclado, lector de pantalla, reducción de movimiento, tamaños de pantalla y dispositivos reales.

## Documentación

- Registrar decisiones arquitectónicas nuevas en `DECISION.md`.
- Mantener estado, dudas y contexto duradero en `MEMORY.md`.
- Mantener tareas y criterios de finalización en `TASK.md`.
- Actualizar `PRD.md`, `ARCHITECTURE.md` o `DESIGN.md` cuando cambien los requisitos o el enfoque acordado.

