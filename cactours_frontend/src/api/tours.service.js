import { apiRequest } from './httpClient'

export const toursService = {
  async listTours(params = {}) {
    const query = new URLSearchParams()
    if (params.destino) query.set('destino', params.destino)
    if (params.q) query.set('q', params.q)
    if (params.presupuesto_max) query.set('presupuesto_max', params.presupuesto_max)
    const qs = query.toString() ? `?${query.toString()}` : ''
    return apiRequest(`/tours/${qs}`)
  },

  async getTourDetail(tourId) {
    const data = await apiRequest(`/tours/${tourId}/`)
    return data.tour
  },

  async recommendByBudget(presupuesto, cantidadPersonas = 1) {
    return apiRequest('/tours/recomendador/', {
      method: 'POST',
      body: JSON.stringify({
        presupuesto,
        cantidad_personas: cantidadPersonas,
      }),
    })
  },
}
