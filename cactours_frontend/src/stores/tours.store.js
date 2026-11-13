import { defineStore } from 'pinia'
import { toursService } from '@/api/tours.service'

export const useToursStore = defineStore('tours', {
  state: () => ({
    tours: [],
    selectedTour: null,
    recommendation: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchTours(filters = {}) {
      this.loading = true
      this.error = null
      try {
        const data = await toursService.listTours(filters)
        this.tours = data.results || []
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async fetchTourDetail(tourId) {
      this.loading = true
      this.error = null
      try {
        this.selectedTour = await toursService.getTourDetail(tourId)
        return this.selectedTour
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async runBudgetRecommender(presupuesto, cantidadPersonas = 1) {
      this.loading = true
      this.error = null
      try {
        this.recommendation = await toursService.recommendByBudget(presupuesto, cantidadPersonas)
        return this.recommendation
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
