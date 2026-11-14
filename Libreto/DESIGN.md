# Guía UX/UI y herramientas de diseño

## Objetivo de experiencia

Transmitir la identidad de Cactours —naturaleza, destinos y confianza— sin sacrificar claridad en el precio, disponibilidad y proceso de reserva. La experiencia debe funcionar primero en móvil y adaptarse a escritorio, con patrones de interacción consistentes entre web y app.

## Herramientas objetivo

### Diseño y prototipado

- **Figma:** flujos, wireframes, prototipos, sistema visual y revisión de estados antes de construir.
- **Tokens de diseño:** definir color, tipografía, espaciado, radios, elevación y movimiento con nombres semánticos; mantener equivalencia entre web y móvil.

## Identidad visual

### Paleta base

| Token | Color | Uso previsto |
|---|---|---|
| Mineral Ivory | `#F2EFE6` | Fondo cálido principal y secciones de descanso visual. |
| Turquesa Cactours | `#026374` | Color principal de marca, navegación y encabezados destacados. |
| Azul petróleo | `#156275` | Secciones secundarias, contenedores destacados y variaciones de marca. |
| Azul brillante | `#069BE0` | Acentos, llamadas a la acción, enlaces y estados interactivos. |
| Blanco | `#FFFFFF` | Tarjetas, superficies y formularios. |
| Carbón | `#111111` | Texto principal, iconos y contraste sobre fondos claros. |

Estos valores son los tokens base de marca; definir variantes de hover, foco, deshabilitado, error y éxito a partir de ellos sin alterar los colores originales. Usar Carbón sobre Azul brillante para texto de tamaño normal salvo que una medición demuestre que otra combinación cumple contraste. No asumir que texto blanco es legible sobre todos los tonos de azul. Verificar los pares de texto y fondo contra WCAG 2.2 AA.

### Tipografía

| Familia | Rol | Uso |
|---|---|---|
| **Manrope** | Títulos y encabezados | Jerarquía, títulos de página y encabezados de sección; pesos semibold/bold según nivel. |
| **DM Sans** | Interfaz y lectura | Cuerpo, navegación, formularios, botones, etiquetas y datos del tour. |
| **Cormorant Garamond** | Detalles editoriales | Frases breves de aventura o composición fotográfica; no usar para instrucciones, precios ni formularios. |

Definir fallback del sistema para cada familia y probar legibilidad en pantallas pequeñas. La tipografía editorial es decorativa y nunca debe ser necesaria para comprender una acción.

### Web

- **Tailwind CSS:** sistema principal de estilos de la web. Compilar sus clases a CSS estático para las plantillas Django y reutilizar componentes visuales.
- **Vue 3 + Vite:** único runtime de interfaz para la web. Mantener React Native + Expo en la app móvil; no montar React dentro de la SPA Vue para microinteracciones.
- **GSAP:** animaciones web puntuales, como entrada de secciones, transiciones de carrusel o detalles de interacción. Mantener el contenido y la navegación utilizables sin animaciones.
- **Login inmersivo:** la ruta de inicio de sesión puede ocultar la navegación global y usar el video optimizado como único fondo visual. Ofrecer un control para pausarlo y detenerlo con movimiento reducido; limitar glassmorphism y neumorfismo a esta superficie, con contraste y controles accesibles.
- **Framer Motion:** no instalar en la SPA web porque depende de React. Reutilizar GSAP para timelines y escenas, y CSS con variables para spotlight, inclinación y magnetismo; evitar dos motores sobre el mismo elemento.
- **anime.js:** candidato para microinteracciones sencillas si reduce complejidad; no duplicar con GSAP la animación de un mismo componente. Elegir y documentar una sola herramienta por interacción.
- **Lenis:** candidato para desplazamiento suave en páginas editoriales/de presentación, no para el flujo de reserva por defecto. Respetar movimiento reducido, gestos táctiles y scroll nativo; si se integra con GSAP ScrollTrigger, sincronizar un único ciclo de animación y limpiar listeners.
- **Glassmorphism:** recurso visual para overlays y superficies puntuales sobre fotografía, con fondo suficientemente opaco, borde y contraste verificado. El login inmersivo es una excepción acotada; no usarlo como estilo general de formularios ni como sustituto de una superficie legible.
- **Tarjetas 3D con spotlight reactivo:** usar la clase compartida `.spotlight-card` en tarjetas editoriales, destinos, tours, perfil y estados. Un solo `v-pointer-effects` delegado en `.app-shell` actualiza el foco y la inclinación con variables CSS; limitar la inclinación a 6° y activar solo con puntero fino y movimiento permitido.
- **Botones magnéticos:** usar `.magnetic-button` en acciones destacadas y aplicar también a `.btn-primary`/`.btn-accent`. Limitar el desplazamiento a 8 px, no cambiar el área clicable y excluir controles deshabilitados.
- **Three.js:** experiencias 3D selectivas relacionadas con destinos (por ejemplo, una escena destacada en una landing), solo si aportan valor frente a fotografía/video optimizados. Cargar bajo demanda y ofrecer una alternativa estática.
- **Iconografía:** usar una familia consistente, como Lucide, en vez de mezclar estilos de iconos.

### App React Native + Expo

- **NativeWind:** opción para estilos utilitarios con una sintaxis cercana a Tailwind; confirmar compatibilidad con los componentes y configuración de Expo antes de adoptarla.
- **React Native Reanimated y Gesture Handler:** animaciones e interacciones nativas, en lugar de forzar GSAP a la app.
- **Three.js en móvil:** no incluir por defecto. Evaluar una integración compatible con Expo únicamente para una escena con objetivo claro, alternativa estática y pruebas en dispositivos reales.
- **Lenis, GSAP y anime.js:** no asumir compatibilidad ni reutilización en la interfaz nativa; preferir los patrones y herramientas de animación de React Native.

> “Las mejores herramientas” significa elegir la herramienta adecuada para cada plataforma. No es requisito incluir Three.js o animaciones en todas las pantallas.

### Reglas para los efectos

- GSAP, anime.js, Lenis y Three.js son candidatos de web y no deben cargarse globalmente sin necesidad.
- No usar simultáneamente GSAP y anime.js para controlar el mismo elemento o timeline.
- Mantener una sola capa compartida de eventos de puntero; no agregar manejadores independientes de inclinación a cada tarjeta.
- Los efectos CSS de puntero no deben competir con `transform` de GSAP: usar `rotate`/`translate` individuales y variables CSS, limitar el efecto a superficies marcadas y limpiar el estado al salir o desmontar.
- Formularios, cotizaciones y acciones de reserva usan spotlight plano (`.spotlight-card--flat`) para no mover campos o controles mientras se interactúa.
- Lenis no debe reemplazar el desplazamiento nativo en formularios, listados largos o navegación móvil si empeora el control del usuario.
- Las tarjetas 3D, glassmorphism y spotlight son decoración progresiva: su ausencia no puede ocultar texto, controles, estados ni foco.
- Medir carga, fluidez y consumo en dispositivos reales antes de habilitar efectos en pantallas de reserva.

### Microinteracciones

- Compartir curvas y tiempos de movimiento mediante tokens; reservar las respuestas rápidas para controles y las entradas más lentas para contenido editorial.
- Dar feedback inmediato a botones, enlaces, campos y selección de tours; el estado debe seguir siendo comprensible sin hover, animación ni sonido.
- Usar vidrio esmerilado donde haya contexto visual detrás —navegación flotante y etiquetas sobre fotografía— con tinte, borde luminoso, sombra y contraste suficiente. Evitarlo en superficies de lectura prolongada.
- Preferir brillo, escala leve, elevación y desplazamientos cortos a movimiento continuo. El spotlight y magnetismo solo se activan en puntero fino; eliminarlos en táctil y con `prefers-reduced-motion`.

## Principios UX

- Hacer visibles el destino, lo incluido, la duración y el precio antes de iniciar la reserva.
- Guiar al usuario por un flujo breve: elegir tour → revisar detalles → ingresar datos → enviar solicitud → ver confirmación y estado.
- No llamar “pago confirmado” a una solicitud de reserva sin cobro real.
- Mostrar validaciones cerca del campo y conservar los datos válidos al corregir errores.
- Incluir estados de carga, error, sin resultados, sin conexión y acción completada.
- Usar lenguaje claro en español y formatos locales para moneda, fecha y teléfono.
- Evitar que movimiento, hover, gestos o 3D sean la única forma de entender o completar una acción.

## Accesibilidad y movimiento

- Apuntar a WCAG 2.2 AA: contraste suficiente, foco visible, navegación por teclado en web, etiquetas accesibles y controles con objetivos táctiles adecuados.
- Respetar `prefers-reduced-motion` en web y preferencias equivalentes en móvil.
- Reducir o desactivar paralaje, desplazamiento forzado y movimiento decorativo cuando el usuario lo solicite.
- Proveer texto alternativo para imágenes relevantes y una alternativa comprensible cuando el contenido 3D no cargue.

## Rendimiento

- Priorizar imágenes optimizadas, tamaños responsivos y carga diferida de contenido no visible.
- Cargar Three.js y escenas solo en las rutas que los usan; no bloquear el catálogo ni la reserva mientras se descargan.
- Medir Core Web Vitals y probar con dispositivos y redes móviles reales antes de publicar.
- Evitar animar propiedades costosas de forma continua; preferir transformaciones y opacidad cuando corresponda.
- Verificar que la página siga siendo funcional si WebGL o JavaScript no están disponibles.

## Entregables de diseño

1. Mapa de navegación y flujos principales web/app.
2. Wireframes de catálogo, detalle, registro/inicio de sesión, reserva, historial y administración.
3. Sistema de diseño con tokens y componentes reutilizables.
4. Prototipo de alta fidelidad y estados responsive.
5. Especificación de movimiento, fallback estático y criterios de accesibilidad.

