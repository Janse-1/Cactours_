import { defineStore } from 'pinia'
import { toursService } from '@/api/tours.service'

export const useToursStore = defineStore('tours', {
  state: () => ({
    tours: [],
    selectedTour: null,
    recommendation: null,
    catalogLoading: false,
    catalogError: null,
    catalogRequestId: 0,
    detailLoading: false,
    detailError: null,
    recommendationLoading: false,
    recommendationError: null,
  }),

  actions: {
    async fetchTours(filters = {}) {
      const requestId = ++this.catalogRequestId
      this.catalogLoading = true
      this.catalogError = null
      try {
        const data = await toursService.listTours(filters)
        if (requestId === this.catalogRequestId) {
          this.tours = data.results || []
        }
      } catch (err) {
        if (requestId === this.catalogRequestId) {
          this.catalogError = err.message
        }
      } finally {
        if (requestId === this.catalogRequestId) {
          this.catalogLoading = false
        }
      }
    },

    async fetchTourDetail(tourId) {
      this.detailLoading = true
      this.detailError = null
      this.selectedTour = null
      try {
        this.selectedTour = await toursService.getTourDetail(tourId)
        return this.selectedTour
      } catch (err) {
        this.detailError = err.message
        throw err
      } finally {
        this.detailLoading = false
      }
    },

    async runBudgetRecommender(presupuesto, cantidadPersonas = 1) {
      this.recommendationLoading = true
      this.recommendationError = null
      try {
        this.recommendation = await toursService.recommendByBudget(presupuesto, cantidadPersonas)
        return this.recommendation
      } catch (err) {
        this.recommendationError = err.message
        throw err
      } finally {
        this.recommendationLoading = false
      }
    },
  },
})
