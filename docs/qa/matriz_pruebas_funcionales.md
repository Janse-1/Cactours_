# Matriz de Pruebas Funcionales Web y API — Cactours

**Código de Tarea:** `[P1][QA] Diseñar matriz de pruebas funcionales Web y API #7`  
**Proyecto:** Cactours — Plataforma Turística Multiplataforma (Django REST + Vue.js 3 SPA)  
**Versión:** 1.0.0  
**Fecha de Elaboración:** Noviembre 2026  
**Responsable QA:** Equipo QA / AFSS25 (`xxxtermir`)

---

## 1. Alcance y Objetivos

Esta matriz establece el conjunto canónico de pruebas funcionales, de seguridad, límites y usabilidad para validar el comportamiento extremo a extremo de **Cactours**:
1. **API REST (`/api/v1/`)**: Validación de contratos JSON, códigos de estado HTTP, reglas de negocio en servidor, integridad transaccional y aislamiento multitenant entre clientes.
2. **Aplicación Web SPA (`cactours_frontend`)**: Flujos de usuario, diseño responsive (móvil y escritorio), navegación asistida por teclado, accesibilidad (`prefers-reduced-motion`) y manejo de estados visuales (carga, éxito, vacío y error).

---

## 2. Convenciones y Escala de Prioridad

* **P1 (Crítica / Bloqueante):** Reglas de negocio financieras, integridad de reservas, autenticación segura, aislamiento de datos personales y accesos indebidos.
* **P2 (Alta):** Filtros de búsqueda, cotizaciones dinámicas, validaciones de formularios y navegación responsive.
* **P3 (Media / Menor):** Animaciones decorativas, microinteracciones de puntero y detalles cosméticos.

---

## 3. Matriz de Casos de Prueba

| ID | Módulo | Tipo | Precondición | Pasos de Ejecución | Datos de Prueba | Resultado Esperado | Prioridad | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-AUTH-01** | Autenticación | Positiva | Base de datos activa, correo no registrado | 1. Enviar `POST /api/v1/auth/register/`<br>2. Verificar payload de respuesta. | `nombre="Ana", apellido="Wayuu", identificacion="12345678", correo="ana@example.com", telefono="3001234567", password="PasswordSeguro123!"` | Código 201 Created. Usuario creado con `is_staff=False`. Retorna tokens `access` y `refresh`. | **P1** | **Pasa** |
| **TC-AUTH-02** | Autenticación | Seguridad / Límite | Ninguna | Registrar usuario con correo `@cactours.com`. | `correo="empleado.fake@cactours.com", password="Password123!"` | Código 201 Created. El usuario NUNCA recibe `is_staff=True` ni permisos de administración. | **P1** | **Pasa** |
| **TC-AUTH-03** | Autenticación | Negativa | Usuario ya existe | Intentar registrar cliente con correo duplicado. | Correo previamente registrado `ana@example.com` | Código 400 Bad Request. Mensaje descriptivo indicando que el correo ya está registrado. | **P1** | **Pasa** |
| **TC-AUTH-04** | Autenticación | Negativa / Límite | Ninguna | Enviar contraseña menor a 8 caracteres o solo numérica. | `password="1234"` | Código 400 Bad Request. Detalle de error informando que no cumple la longitud mínima. | **P1** | **Pasa** |
| **TC-AUTH-05** | Autenticación | Positiva | Usuario activo | Enviar `POST /api/v1/auth/login/` con credenciales válidas. | `correo="ana@example.com", password="PasswordSeguro123!"` | Código 200 OK. Retorna tokens JWT y datos de persona/cliente. | **P1** | **Pasa** |
| **TC-AUTH-06** | Autenticación | Negativa | Usuario activo | Enviar `POST /api/v1/auth/login/` con clave incorrecta. | `correo="ana@example.com", password="ClaveIncorrecta"` | Código 401 Unauthorized. Error descriptivo "Credenciales de acceso inválidas." | **P1** | **Pasa** |
| **TC-AUTH-07** | Autenticación | Seguridad | Sin sesión activa | Enviar `GET /api/v1/auth/me/` sin header Authorization. | Header `Authorization` ausente | Código 401 Unauthorized. Acceso denegado. | **P1** | **Pasa** |
| **TC-AUTH-08** | Autenticación | Positiva | Token de acceso vigente | Enviar `GET /api/v1/auth/me/` con `Bearer <token>`. | Token emitido en login de `ana@example.com` | Código 200 OK. Retorna perfil del cliente (persona, contacto, reservas acumuladas). | **P1** | **Pasa** |
| **TC-AUTH-09** | Autenticación | Positiva | Token vigente | Enviar `PATCH /api/v1/auth/me/` para cambiar teléfono o apellido. | `{"telefono": "3109998877", "apellido": "Pérez"}` | Código 200 OK. Datos actualizados en base de datos. | **P2** | **Pasa** |
| **TC-AUTH-10** | Autenticación | Positiva | Refresh token válido | Enviar `POST /api/v1/auth/refresh/` con refresh token. | `{"refresh": "<refresh_token>"}` | Código 200 OK. Nuevo `access_token` emitido sin exigir relogin. | **P1** | **Pasa** |
| **TC-TOUR-01** | Catálogo Tours | Positiva | Tours en BD con estados diversos | Enviar `GET /api/v1/tours/` sin filtros. | Catálogo contiene tours en `PUBLICADO`, `BORRADOR` e `INACTIVO` | Código 200 OK. Solo retorna tours en estado `PUBLICADO`. | **P1** | **Pasa** |
| **TC-TOUR-02** | Catálogo Tours | Positiva | Tours publicados | Filtrar por texto `GET /api/v1/tours/?q=Cabo`. | Parámetro `q=Cabo` | Código 200 OK. Retorna únicamente tours que contengan "Cabo" en nombre o descripción. | **P2** | **Pasa** |
| **TC-TOUR-03** | Catálogo Tours | Positiva | Tours publicados | Filtrar por presupuesto `GET /api/v1/tours/?presupuesto_max=150000`. | `presupuesto_max=150000` | Código 200 OK. Retorna solo tours con costo base <= $150.000 COP. | **P2** | **Pasa** |
| **TC-TOUR-04** | Catálogo Tours | Positiva | Tour publicado existe | Consultar `GET /api/v1/tours/<id>/`. | ID de tour válido y publicado | Código 200 OK con detalle, galería multimedia y opciones adicionales disponibles. | **P2** | **Pasa** |
| **TC-TOUR-05** | Catálogo Tours | Negativa / Límite | Tour inactivo o borrado | Consultar `GET /api/v1/tours/<id_inactivo>/`. | ID de tour en estado `INACTIVO` | Código 404 Not Found. No expone tours fuera de circulación. | **P2** | **Pasa** |
| **TC-TOUR-06** | Recomendador | Positiva | Tours con opciones en BD | Enviar `POST /api/v1/tours/recomendador/`. | `presupuesto_cop="500000", cantidad_personas=2` | Código 200 OK. Calcula $250.000 COP/persona, clasifica categoría (CONFORT) y lista tours compatibles. | **P1** | **Pasa** |
| **TC-TOUR-07** | Recomendador | Negativa / Límite | Ninguna | Enviar presupuesto negativo o 0 personas. | `presupuesto_cop="-1000", cantidad_personas=0` | Código 400 Bad Request con mensaje de error sobre parámetros válidos. | **P2** | **Pasa** |
| **TC-BOOK-01** | Cotizador | Positiva | Tour publicado con opciones | Enviar `POST /api/v1/bookings/cotizar/`. | `tour_id=1, cant_personas=3, opciones_ids=[1]` (Tour: $120.000, Opción: $50.000) | Código 200 OK. Retorna desglose exacto en servidor: Base $360.000 + Opciones $150.000 = Total $510.000 COP. | **P1** | **Pasa** |
| **TC-BOOK-02** | Cotizador | Negativa | Opción no vinculada | Cotizar enviando un `opcion_id` que no pertenece al tour. | ID de opción ajena | Código 400 Bad Request. El sistema rechaza opciones no asociadas al tour especificado. | **P1** | **Pasa** |
| **TC-BOOK-03** | Reservas | Seguridad | Token de Cliente A | Crear reserva enviando un `costo_total="1.00"` alterado en el cliente. | Payload manipulado: `costo_total="1.00"` | Código 201 Created. El servidor IGNORA el valor del cliente y persiste el cálculo real auditado. | **P1** | **Pasa** |
| **TC-BOOK-04** | Reservas | Negativa / Límite | Tour con cupo máx 10 | Solicitar reserva con `cant_personas=15`. | `cant_personas=15` para `cupo_maximo=10` | Código 400 Bad Request. Informa que excede el cupo disponible del tour. | **P1** | **Pasa** |
| **TC-BOOK-05** | Reservas | Seguridad / Aislamiento | Cliente B autenticado | Consultar `GET /api/v1/bookings/<id_de_cliente_A>/`. | Token de Cliente B, ID de reserva de Cliente A | Código 404 Not Found. Ningún cliente puede ver reservas ajenas. | **P1** | **Pasa** |
| **TC-BOOK-06** | Reservas | Seguridad / Aislamiento | Cliente B autenticado | Enviar `PATCH /api/v1/bookings/<id_de_cliente_A>/` con acción CANCELAR. | Token de Cliente B, ID de reserva de Cliente A | Código 404 Not Found. Un cliente no puede cancelar reservas ajenas. | **P1** | **Pasa** |
| **TC-BOOK-07** | Reservas | Positiva | Cliente A con reserva activa | Enviar `PATCH /api/v1/bookings/<id_de_cliente_A>/` con `estado="CANCELADA"`. | Token de Cliente A, ID de su propia reserva | Código 200 OK. Estado actualizado a `CANCELADA`. | **P1** | **Pasa** |
| **TC-PAY-01** | Pagos | Positiva | Cliente con reserva creada | Enviar `POST /api/v1/payments/` con proveedor WOMPI. | `reserva_id=1, proveedor="WOMPI"` | Código 201 Created. Registra intención de pago con monto idéntico al `costo_total` de la reserva. | **P1** | **Pasa** |
| **TC-PAY-02** | Pagos | Seguridad / Aislamiento | Cliente B autenticado | Intentar pagar una reserva que pertenece al Cliente A. | Token Cliente B, `reserva_id` de Cliente A | Código 400 Bad Request / 404. Rechazo de pago de reservas de terceros. | **P1** | **Pasa** |
| **TC-PAY-03** | Pagos | Negativa / Límite | Reserva en estado CANCELADA | Intentar registrar pago sobre reserva cancelada. | `reserva_id` con estado `CANCELADA` | Código 400 Bad Request. No se permite pagar reservas canceladas. | **P1** | **Pasa** |
| **TC-WEB-01** | Web — Hero Home | Usabilidad / Rendimiento | Navegador moderno | Recargar página de inicio `/`. | Conexión local / 4G simulada | La escena de fondo carga inmediatamente el póster oficial (fotograma 0) sin parpadeos ni fotos ajenas. | **P1** | **Pasa** |
| **TC-WEB-02** | Web — Login Inmersivo | Funcional | Ruta `/login` | Ingresar credenciales y enviar formulario. | Usuario registrado | Transición fluida, deshabilitación de botón durante submit (`Preparando tu ruta...`) y redirección a perfil. | **P1** | **Pasa** |
| **TC-WEB-03** | Web — Tablero Salidas | Interactividad | Pantalla de login | Visualizar rotación automática de destinos y pulsar segmento de la barra de progreso. | Clic en segmento 3 | El tablero cambia de destino de inmediato mediante animación split-flap sin recargar la página. | **P2** | **Pasa** |
| **TC-WEB-04** | Web — Registro | Funcional | Ruta `/registro` | Llenar formulario y registrar nuevo viajero. | Datos completos y válidos | Animación de entrada, validaciones de campo requeridas y redirección a espacio privado. | **P1** | **Pasa** |
| **TC-WEB-05** | Web — Navbar | Usabilidad / Responsive | En cualquier ruta | Hacer scroll hacia abajo > 60px y luego scroll hacia arriba. | Rueda de mouse / touch scroll | La barra de navegación se oculta suavemente al bajar y reaparece de inmediato al subir o tocar la cima. | **P2** | **Pasa** |
| **TC-WEB-06** | Web — Accesibilidad | Accesibilidad | SO con `prefers-reduced-motion` | Activar modo de reducción de movimiento en sistema operativo y recargar vistas. | Flag de accesibilidad del SO | Los videos de fondo no se autoreproducen (o inician pausados), las animaciones cinéticas de letras y 3D tilt se desactivan. | **P1** | **Pasa** |
| **TC-WEB-07** | Web — Responsive Móvil | Diseño Responsive | Viewport 360px a 480px | Navegar por Home, Login, Registro, Catálogo y Checkout. | Emulador móvil Chrome DevTools (Galaxy S20, iPhone 14) | Los formularios son legibles, no existe desborde horizontal (overflow-x), botones accesibles al pulgar. | **P1** | **Pasa** |

---

## 4. Métricas de Cobertura de la Suite

* **Total de Casos Diseñados:** 30 casos de prueba canónicos.
* **Distribución por Prioridad:**
  * **P1 (Crítica):** 18 casos (60%)
  * **P2 (Alta):** 11 casos (36.7%)
  * **P3 (Media):** 1 caso (3.3%)
* **Distribución por Módulo:**
  * Autenticación y Cuentas: 10 casos
  * Catálogo y Recomendador: 7 casos
  * Cotizador y Reservas: 7 casos
  * Pagos y Transacciones: 3 casos
  * Interfaz Web SPA, Accesibilidad y Responsive: 7 casos
