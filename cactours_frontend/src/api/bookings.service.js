import { apiRequest } from './httpClient'

export const bookingsService = {
  async quoteBooking({ tourId, cantPersonas, opcionesIds = [] }) {
    return apiRequest('/bookings/cotizar/', {
      method: 'POST',
      body: JSON.stringify({
        tour_id: tourId,
        cant_personas: cantPersonas,
        opciones_ids: opcionesIds,
      }),
    })
  },

  async createBooking(bookingPayload) {
    const data = await apiRequest('/bookings/', {
      method: 'POST',
      body: JSON.stringify(bookingPayload),
    })
    return data.reserva
  },

  async listMyBookings() {
    return apiRequest('/bookings/')
  },

  async cancelBooking(reservaId) {
    const data = await apiRequest(`/bookings/${reservaId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ estado: 'CANCELADA' }),
    })
    return data.reserva
  },
}
