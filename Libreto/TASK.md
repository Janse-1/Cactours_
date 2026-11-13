# Hoja de ruta y tareas

Las casillas vacías son trabajo pendiente, no evidencia de implementación. Reordenar cuando se confirmen datos de producción, disponibilidad y decisiones de hosting.

## Fase 1 — Alinear dominio y entorno

- [ ] Confirmar disponibilidad, fechas/turnos, cupos, cancelación y operación de solicitudes.
- [ ] Comparar modelos Django, migraciones y esquema SQL; documentar datos que deben conservarse.
- [ ] Corregir el modelo canónico de cliente/reserva/opciones/estado e impedir historiales duplicados.
- [ ] Elegir base de producción según la existencia de datos MySQL que deban preservarse.
- [ ] Mover secretos a configuración por entorno y separar claramente desarrollo/producción.
- [ ] Desactivar o archivar Flask y SQL manual solo tras verificar que no son necesarios.

**Aceptación:** una única fuente de datos definida, migraciones reproducibles y modelo de reserva validado.

## Fase 2 — API y lógica de negocio

- [ ] Elegir autenticación móvil y definir expiración/renovación de credenciales.
- [ ] Crear API versionada para catálogo, perfil, solicitud de reserva e historial.
- [ ] Aplicar permisos por rol y propietario en cada recurso.
- [ ] Calcular total en servidor desde tour, cantidad y opciones permitidas.
- [ ] Definir respuestas de error y estados de reserva.
- [ ] Añadir pruebas para permisos, creación, consulta y cálculo.

**Aceptación:** API documentada y probada; cliente no puede alterar precio ni acceder a reservas ajenas.

## Fase 3 — UX/UI y web

- [ ] Diseñar flujos y prototipos web/app en Figma.
- [ ] Formalizar los tokens de color (`#F2EFE6`, `#026374`, `#156275`, `#069BE0`, `#FFFFFF`, `#111111`) y tipografía (Manrope, DM Sans, Cormorant Garamond) en los temas web y móvil; validar contraste.
- [ ] Definir componentes, responsive breakpoints y estados en `DESIGN.md`.
- [ ] Preparar Tailwind CSS compilado para las plantillas Django.
- [ ] Completar catálogo, detalle, registro/inicio de sesión, solicitud e historial.
- [ ] Proteger páginas privadas y definir roles administrativos.
- [ ] Gestionar tours, imágenes y estados desde Django Admin o panel operativo.
- [ ] Aplicar GSAP para movimiento web selectivo y evaluar anime.js solo si no duplica GSAP.
- [ ] Evaluar Lenis solo para páginas editoriales y probar scroll nativo/accesibilidad.
- [ ] Prototipar glassmorphism y tarjetas 3D con spotlight reactivo con fallback plano y movimiento reducido.
- [ ] Verificar el paquete exacto y mantenimiento de Beauty.js antes de decidir si se incorpora.
- [ ] Evaluar escena Three.js con fallback estático solo si aporta valor.
- [ ] Verificar accesibilidad, movimiento reducido, rendimiento y navegación por teclado.

**Aceptación:** flujo web completo y usable en móvil/escritorio; sin dependencias de efectos para completar tareas.

## Fase 4 — Aplicación móvil

- [ ] Crear proyecto Expo y navegación de catálogo, cuenta, reserva e historial.
- [ ] Implementar componentes y estilos NativeWind si la evaluación técnica lo confirma.
- [ ] Consumir la API común y guardar credenciales con almacenamiento seguro.
- [ ] Implementar estados de carga, error, sesión expirada y conectividad.
- [ ] Usar Reanimated/Gesture Handler para movimiento e interacción nativa.
- [ ] Probar Android e iOS; evaluar 3D solo con justificación y pruebas de rendimiento.

**Aceptación:** el cliente puede completar los flujos MVP desde dispositivos reales contra el mismo backend.

## Fase 5 — Validación y lanzamiento

- [ ] Ejecutar pruebas de extremo a extremo en web y móvil.
- [ ] Configurar hosting, HTTPS, base de datos, almacenamiento de medios, correo y copias de seguridad.
- [ ] Incorporar monitoreo, registros sin datos sensibles y proceso de recuperación.
- [ ] Preparar distribución de la app y documentación operativa.
- [ ] Evaluar proveedor de pagos colombiano y documentar una fase aparte de gateway, webhooks y reembolsos.

**Aceptación:** despliegue repetible, datos respaldados, fallos observables y criterios de lanzamiento cumplidos.

