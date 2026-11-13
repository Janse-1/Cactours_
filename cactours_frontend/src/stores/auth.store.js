import { defineStore } from 'pinia'
import { authService } from '@/api/auth.service'
import { clearSessionTokens, getAccessToken } from '@/api/httpClient'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.user),
    isAdmin: (state) => Boolean(state.user?.is_staff),
  },

  actions: {
    async hydrateSession() {
      if (!getAccessToken()) return
      try {
        this.loading = true
        this.user = await authService.fetchProfile()
      } catch {
        clearSessionTokens()
        this.user = null
      } finally {
        this.loading = false
      }
    },

    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        this.user = await authService.login(credentials)
        return this.user
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async register(payload) {
      this.loading = true
      this.error = null
      try {
        this.user = await authService.register(payload)
        return this.user
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async logout() {
      await authService.logout()
      this.user = null
    },
  },
})
