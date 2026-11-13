import { defineStore } from 'pinia'
import { bookingsService } from '@/api/bookings.service'

export const useBookingsStore = defineStore('bookings', {
  state: () => ({
    bookings: [],
    currentQuote: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchMyBookings() {
      this.loading = true
      this.error = null
      try {
        const data = await bookingsService.listMyBookings()
        this.bookings = data.results || []
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async quoteBooking(params) {
      this.currentQuote = await bookingsService.quoteBooking(params)
      return this.currentQuote
    },

    async createBooking(payload) {
      this.loading = true
      this.error = null
      try {
        const nueva = await bookingsService.createBooking(payload)
        this.bookings.unshift(nueva)
        return nueva
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
