"""Serializadores de reservas y desgloses de cotización."""
from .models import Reserva


def serialize_reserva(reserva: Reserva) -> dict:
    opciones = [
        {
            "opcion_id": det.opcion_id,
            "nombre_opcion": det.nombre_opcion,
            "precio_unitario": str(det.precio_unitario),
            "subtotal": str(det.subtotal),
        }
        for det in reserva.detalle_opciones.all()
    ]
    return {
        "id": reserva.id,
        "codigo_reserva": reserva.codigo_reserva,
        "estado": reserva.estado,
        "estado_display": reserva.get_estado_display(),
        "es_solicitud_sin_cobro_en_linea": True,
        "tour": {
            "id": reserva.tour_id,
            "nombre_tour": reserva.tour.nombre_tour,
            "ciudad_destino": reserva.tour.ciudad_destino,
            "duracion_dias": reserva.tour.duracion_dias,
        },
        "cliente": {
            "id": reserva.cliente_id,
            "nombre_completo": str(reserva.cliente.persona),
        },
        "lugar_salida": reserva.lugar_salida,
        "destino": reserva.destino,
        "fecha": reserva.fecha.isoformat(),
        "hora": reserva.hora.strftime("%H:%M:%S"),
        "cant_personas": reserva.cant_personas,
        "medio_pago": reserva.medio_pago,
        "medio_pago_display": reserva.get_medio_pago_display(),
        "subtotal_base": str(reserva.subtotal_base),
        "subtotal_opciones": str(reserva.subtotal_opciones),
        "costo_total": str(reserva.costo_total),
        "costo_total_num": float(reserva.costo_total),
        "opciones": opciones,
        "comentarios": reserva.comentarios,
        "created_at": reserva.created_at.isoformat(),
    }
