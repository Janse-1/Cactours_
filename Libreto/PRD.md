# PRD — Cactours web y móvil

## Resumen

Cactours permitirá descubrir tours, solicitar reservas y consultar su estado desde una web responsive y una app móvil para iOS/Android. El equipo administrará tours y solicitudes desde Django.

## Problema

El proyecto actual muestra tours y pantallas de usuario, pero aún no ofrece un flujo coherente de reserva compartido entre plataformas ni una API común para móvil.

## Objetivos del MVP

- Permitir encontrar y comparar tours publicados.
- Permitir que un usuario registrado solicite una reserva con información completa.
- Mostrar al usuario su historial y estado actualizado.
- Permitir al equipo administrar catálogo y solicitudes.
- Ofrecer una experiencia accesible, responsive y consistente en web y móvil.

## Usuarios principales

- **Visitante:** explora destinos y tours sin necesidad de crear cuenta.
- **Cliente:** se registra, solicita una reserva y consulta sus propios datos.
- **Operador/administrador:** publica tours, administra imágenes y gestiona el estado de reservas según sus permisos.

## Flujos principales

### Explorar tours

1. Abrir la portada o catálogo.
2. Buscar/filtrar tours publicados.
3. Revisar detalle, imágenes, precio, duración, destino e inclusiones.
4. Iniciar sesión o registrarse para solicitar la reserva.

### Solicitar reserva

1. Elegir fecha/turno y cantidad de personas según disponibilidad.
2. Seleccionar opciones aplicables y proporcionar datos de contacto/salida.
3. Revisar el resumen y el precio calculado por el servidor.
4. Enviar la solicitud.
5. Ver una confirmación explícita de solicitud y consultar el estado desde el perfil.

La definición final de fechas, cupos y cancelaciones depende de validación del negocio.

### Administrar

1. Iniciar sesión con una cuenta autorizada.
2. Crear/editar tours, imágenes, opciones y publicación.
3. Consultar solicitudes y cambiar su estado permitido.
4. Revisar historial sin exponer información a usuarios no autorizados.

## Alcance del MVP

- Catálogo y detalle de tour.
- Registro, inicio/cierre de sesión y recuperación de cuenta.
- Solicitud de reserva y cálculo de precio en servidor.
- Historial y estado de las reservas del cliente.
- Administración inicial mediante Django Admin o una vista operacional validada.
- Web Django responsive y app Expo conectada a la misma API.

## Fuera del alcance inicial

- Pasarela de pago, reembolsos y confirmación de transacciones.
- Constructor automático de tour personalizado basado en presupuesto, hasta validar reglas reales de negocio.
- Chat, programa de fidelización, recomendaciones personalizadas y operación offline completa.
- Escena 3D obligatoria; se evalúa como recurso de presentación y no bloquea la reserva.

## Requisitos no funcionales

- Autorización en servidor: cada cliente solo accede a sus datos.
- Precio y total siempre calculados/validados desde datos confiables del backend.
- Diseño responsive, accesibilidad WCAG 2.2 AA como objetivo y soporte para movimiento reducido.
- Manejo claro de estados de error, carga, conectividad y reserva.
- Imágenes optimizadas y rendimiento medido en redes/dispositivos móviles.
- Configuración de producción separada de desarrollo, copias de seguridad y monitoreo.

## Métricas de éxito a instrumentar

- Porcentaje de visitantes que consultan detalle de un tour.
- Conversión de detalle a solicitud de reserva.
- Tasa de errores al enviar solicitudes.
- Tiempo de respuesta y disponibilidad de los flujos principales.
- Porcentaje de solicitudes gestionadas dentro del proceso operativo acordado.

No fijar metas numéricas hasta disponer de una línea base y objetivos comerciales.

## Criterios de aceptación

- El mismo catálogo y estado de reserva se reflejan en web, móvil y administración.
- No se puede falsificar el precio ni consultar la reserva de otro cliente manipulando la solicitud.
- El cliente entiende que está enviando una solicitud y no realizando un pago.
- Se puede completar el flujo principal en Android, iOS y navegadores móviles/escritorio.

