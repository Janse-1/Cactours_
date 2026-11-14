import { defineStore } from 'pinia'
import { authService } from '@/api/auth.service'
import { clearSessionTokens, getAccessToken } from '@/api/httpClient'

function getErrorMessage(error) {
  const details = error?.details
  const messages = details && typeof details === 'object'
    ? Object.values(details)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .filter((value) => typeof value === 'string' && value.trim())
    : []

  return messages.length ? [...new Set(messages)].join(' ') : error.message
}

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
        this.error = getErrorMessage(err)
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
        this.error = getErrorMessage(err)
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
