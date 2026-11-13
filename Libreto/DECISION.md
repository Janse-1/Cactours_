# Registro de decisiones

Este registro conserva las decisiones y propuestas para evitar que la arquitectura cambie accidentalmente. Las decisiones propuestas aún requieren validación técnica o del negocio.

## DEC-001 — Django como backend único

- **Estado:** recomendado.
- **Decisión:** conservar Django como fuente única de datos y reglas; no ampliar en paralelo la aplicación Flask.
- **Motivo:** Django ya contiene modelos, migraciones, autenticación, vistas y administración.
- **Consecuencia:** revisar si Flask o `cactours.sql` contienen datos o funciones que deban migrarse antes de archivarlos.

## DEC-002 — Aplicación móvil multiplataforma

- **Estado:** confirmado por el propietario del producto.
- **Decisión:** React Native + Expo para iOS y Android.
- **Motivo:** compartir una implementación móvil y consumir la API del backend.
- **Consecuencia:** definir navegación, autenticación y almacenamiento seguro compatibles con Expo.

## DEC-003 — Estrategia web

- **Estado:** recomendación base para el MVP.
- **Decisión:** completar la web existente con Django Templates y diseño responsive, en lugar de introducir una SPA independiente.
- **Motivo:** aprovechar el proyecto existente y reducir duplicación de frontend.
- **Revisión:** reconsiderar solo si requisitos de producto o mediciones demuestran que la estrategia no es suficiente.

## DEC-004 — Alcance inicial de producto

- **Estado:** confirmado por el propietario del producto.
- **Decisión:** MVP con catálogo, cuentas, solicitudes de reserva, historial y administración.
- **No incluido inicialmente:** procesamiento de pagos en línea.

## DEC-005 — Pagos

- **Estado:** confirmado para la primera versión.
- **Decisión:** registrar solicitudes de reserva y hacer explícito que no equivalen a pagos confirmados. Evaluar gateway más adelante.
- **Consecuencia:** no almacenar datos de tarjetas. La integración futura debe verificar notificaciones del proveedor en el servidor y manejar estados de transacción.

## DEC-006 — Herramientas UX/UI

- **Estado:** preferencia de producto confirmada; aplicación sujeta a evaluación por plataforma.
- **Decisión:** establecer Tailwind CSS, GSAP y Three.js como herramientas objetivo para el diseño web, complementadas por Figma y buenas prácticas de accesibilidad y rendimiento. Considerar anime.js, Lenis, glassmorphism y tarjetas 3D con spotlight reactivo según el caso de uso. Beauty.js queda como candidato cuya identidad y compatibilidad deben verificarse antes de instalarlo.
- **Consecuencia:** Tailwind para estilos web; GSAP como opción principal para animaciones web complejas; anime.js solo para interacciones puntuales si no duplica GSAP; Three.js para experiencias 3D justificadas y con alternativa estática. Lenis es opcional para páginas editoriales, no para sustituir el scroll nativo de todos los flujos.
- **Móvil:** usar NativeWind si resulta adecuado para estilos utilitarios y React Native Reanimated/Gesture Handler para animaciones e interacción nativas. GSAP, anime.js, Lenis y Three.js no se aplican automáticamente a cada pantalla nativa.

## DEC-007 — Paleta y tipografía de marca

- **Estado:** propuesta visual suministrada por el propietario; baseline para el sistema de diseño.
- **Paleta:** Mineral Ivory `#F2EFE6`, Turquesa Cactours `#026374`, Azul petróleo `#156275`, Azul brillante `#069BE0`, Blanco `#FFFFFF` y Carbón `#111111`.
- **Tipografía:** Manrope para títulos/encabezados; DM Sans para interfaz y textos; Cormorant Garamond para detalles editoriales breves.
- **Consecuencia:** conservar estos tokens de marca y validar contraste de cada combinación antes de usarla en texto, botones y estados. Consultar `DESIGN.md` para roles y reglas.

## Decisiones pendientes

- Base de datos final: preservar MySQL si hay datos productivos; evaluar PostgreSQL si el despliegue inicia sin ellos.
- Hosting, almacenamiento de medios, correo transaccional y monitoreo.
- Modelo de disponibilidad, cupos, cancelaciones y estados finales de reserva.
- Proveedor de pagos y reglas de reembolso para una etapa futura.
- Alcance visual de 3D y pruebas de rendimiento en dispositivos de gama baja.

