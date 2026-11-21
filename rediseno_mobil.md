# REDISEÑO DE AUTENTICACIÓN Y EXPERIENCIA DE BIENVENIDA – CACTOURS MOBILE

Quiero que rediseñes la experiencia visual de autenticación y bienvenida de mi aplicación móvil CACTOURS, tomando como referencia el video de diseño que te describí.

**IMPORTANTE:** No quiero que construyas una pantalla genérica de login. Quiero una experiencia visual moderna, elegante, fluida y profesional, con animaciones bien cuidadas, transiciones y microinteracciones.

La aplicación está desarrollada en React Native con Expo y utiliza Django como backend.

## 1. Antes de programar: analiza el proyecto

Primero revisa la estructura actual de `cactours_mobile`.

Identifica:
- Las pantallas actuales de inicio de sesión y registro.
- Los componentes reutilizables.
- La configuración de navegación.
- Los servicios de autenticación.
- La conexión con el backend mediante `EXPO_PUBLIC_API_URL`.
- Las dependencias de animación que ya están instaladas.

No elimines funcionalidades existentes ni reemplaces la autenticación por datos ficticios.

Conserva la integración con Django y adapta el diseño a la arquitectura actual.

## 2. Identidad visual de CACTOURS

La interfaz debe respetar la identidad visual de la marca:

- Mineral Ivory: `#F2EFE6`
- Turquesa: `#026374`
- Azul petróleo: `#156275`
- Azul brillante: `#069BE0`
- Blanco: `#FFFFFF`
- Carbón para textos oscuros.

Utiliza una combinación elegante de fondos oscuros en azul petróleo y superficies claras en blanco o Mineral Ivory.

El resultado debe transmitir:
- Turismo y aventura.
- Elegancia.
- Confianza.
- Modernidad.
- Facilidad de uso.

Evita colores excesivamente saturados, sombras exageradas, demasiados degradados y elementos visuales innecesarios.

## 3. Pantalla Splash / bienvenida

Crea una pantalla inicial con:

- Fondo azul petróleo oscuro.
- Logotipo de CACTOURS centrado.
- Nombre de la marca.
- Una frase corta relacionada con descubrir destinos y experiencias.
- Animación inicial del logotipo mediante fade-in y scale.
- Aparición progresiva del nombre y el eslogan.
- Transición suave hacia la siguiente pantalla.

La animación debe sentirse profesional, no infantil.

La pantalla debe mostrarse durante el tiempo necesario para preparar la navegación, sin retrasar innecesariamente la aplicación.

## 4. Pantalla de inicio de sesión

Replica la estructura visual de la referencia:

- Fondo exterior oscuro, preferiblemente azul petróleo.
- Tarjeta principal clara, centrada y con esquinas redondeadas.
- Diseño limpio y espacioso.
- Encabezado con el logotipo pequeño de CACTOURS.
- Título: "¡Qué bueno tenerte de vuelta!"
- Subtítulo: "Ingresa y continúa descubriendo nuevos destinos".

Incluye un selector visual superior para cambiar entre:
- Iniciar sesión.
- Crear cuenta.

El selector debe tener una transición suave al cambiar de opción.

### Campos de inicio de sesión

Incluye:

**Correo electrónico**
- Icono relacionado con el correo.
- Placeholder claro.
- Bordes redondeados.
- Estado visual cuando está seleccionado.

**Contraseña**
- Icono de candado.
- Botón para mostrar u ocultar la contraseña.
- Indicador visual de campo enfocado.

Debajo de los campos:
- Checkbox para recordar sesión, únicamente si la lógica actual lo permite.
- Enlace para recuperar contraseña, si existe o puede implementarse correctamente.

### Botón principal

Incluye un botón destacado:

"INICIAR SESIÓN"

Características:
- Fondo turquesa o azul brillante.
- Texto blanco.
- Esquinas redondeadas.
- Animación ligera al presionarlo.
- Estado de carga mientras se procesa la autenticación.
- Deshabilitado cuando los campos requeridos no son válidos.

### Otros métodos de acceso

Si el backend y el proyecto no tienen autenticación social implementada, no simules que funciona.

Puedes dejar preparada la estructura visual para Google o Apple, pero no presentes esos accesos como funcionales hasta que estén integrados correctamente.

## 5. Pantalla de registro

Diseña una experiencia visual coherente con el login.

Incluye los campos que realmente exige el modelo de usuarios y el endpoint de registro existente.

La pantalla debe tener:
- Título atractivo.
- Campos con iconos.
- Validaciones.
- Confirmación de contraseña si corresponde.
- Indicaciones de errores.
- Botón para crear cuenta.
- Enlace para regresar al inicio de sesión.

El cambio entre login y registro debe tener una transición horizontal o un efecto suave de desplazamiento.

No inventes campos que el backend no admita.

## 6. Animaciones y microinteracciones

Quiero que prestes especial atención a las animaciones.

Implementa:

1. Aparición del logotipo con fade-in y scale.
2. Entrada de la tarjeta de autenticación con desplazamiento vertical suave.
3. Aparición progresiva de los campos.
4. Animación al seleccionar los campos.
5. Transición del selector entre login y registro.
6. Efecto de presión en botones.
7. Indicador animado de carga al iniciar sesión.
8. Mensajes de error con una transición sutil.
9. Transiciones suaves entre pantallas.

Las animaciones deben ser fluidas, naturales y optimizadas para dispositivos Android e iOS.

Utiliza preferiblemente las dependencias que ya existen en el proyecto. Si necesitas instalar alguna, verifica primero su compatibilidad con la versión de Expo utilizada.

No instales versiones incompatibles ni actualices todo el proyecto innecesariamente.

## 7. Onboarding turístico

Después de la autenticación o antes del primer acceso, según la navegación actual, quiero una experiencia de presentación de CACTOURS.

Crea una secuencia de tres pantallas:

**Pantalla 1 – Descubre**
- Fotografía atractiva de un destino turístico.
- Título: "Descubre lugares extraordinarios".
- Texto: "Explora destinos únicos y encuentra tu próxima aventura".

**Pantalla 2 – Explora**
- Fotografía de una experiencia turística.
- Título: "Vive experiencias inolvidables".
- Texto: "Encuentra actividades y recorridos para todos los gustos".

**Pantalla 3 – Reserva**
- Fotografía de viajeros disfrutando de un destino.
- Título: "Tu próxima aventura comienza aquí".
- Texto: "Encuentra tu próximo recorrido y solicita tu reserva fácilmente".

Incluye:
- Desplazamiento horizontal entre pantallas.
- Indicadores de progreso.
- Botón "Siguiente".
- Opción "Omitir".
- Botón final "Comenzar".
- Animaciones de entrada de textos e imágenes.

El onboarding debe mostrarse según el estado de primera visita, sin repetirse innecesariamente.

Utiliza fotografías turísticas de buena calidad y evita imágenes genéricas que no correspondan al contexto de CACTOURS.

## 8. Integración y funcionamiento

Es indispensable que:

- El inicio de sesión siga utilizando el servicio API existente.
- El registro siga conectado con Django.
- Se conserven los tokens y el manejo de sesión actual.
- Se mantenga la navegación protegida cuando corresponda.
- Se respeten los estados de carga y error del backend.
- Se mantenga la dirección configurada en `EXPO_PUBLIC_API_URL`.
- No se alteren los modelos, endpoints ni servicios del backend sin una necesidad real.

## 9. Calidad y organización del código

Organiza el diseño en componentes reutilizables.

Evita colocar toda la lógica y los estilos en un único archivo.

Mantén una separación clara entre:
- Pantallas.
- Componentes.
- Estilos.
- Animaciones.
- Servicios de autenticación.

El diseño debe adaptarse a diferentes tamaños de pantalla y no presentar problemas con el teclado, las áreas seguras o los dispositivos Android.

## 10. Resultado esperado

Quiero que el resultado final se acerque visualmente a la referencia:

- Splash elegante.
- Login moderno con tarjeta clara y fondo oscuro.
- Campos minimalistas.
- Botones atractivos.
- Animaciones fluidas.
- Registro integrado.
- Onboarding turístico visualmente atractivo.

No quiero que solo me entregues una propuesta o una explicación. Quiero que implementes los cambios directamente en el código de CACTOURS Mobile.

Al finalizar:

1. Indica todos los archivos creados y modificados.
2. Explica qué animaciones implementaste.
3. Informa qué dependencias instalaste.
4. Confirma qué funcionalidades siguen conectadas al backend.
5. Ejecuta las verificaciones disponibles y corrige los errores que encuentres.
6. Comprueba que la aplicación pueda iniciarse con `npx expo start --lan`.

**Prioridad absoluta: conservar el funcionamiento actual del proyecto mientras elevas considerablemente su calidad visual y experiencia de usuario.**