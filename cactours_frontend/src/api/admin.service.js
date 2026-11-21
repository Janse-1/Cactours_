import { apiRequest } from '@/api/httpClient'

export const adminService = {
  getDashboard: () => apiRequest('/admin/demo/dashboard/'),
  listTours: () => apiRequest('/admin/demo/tours/'),
  createTour: (payload) =>
    apiRequest('/admin/demo/tours/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateTour: (tourId, payload) =>
    apiRequest(`/admin/demo/tours/${tourId}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteTour: (tourId) =>
    apiRequest(`/admin/demo/tours/${tourId}/`, {
      method: 'DELETE',
    }),
  listBookings: () => apiRequest('/admin/demo/bookings/'),
  updateBookingStatus: (bookingId, estado) =>
    apiRequest(`/admin/demo/bookings/${bookingId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    }),
}
