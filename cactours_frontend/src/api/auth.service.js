import { apiRequest, clearSessionTokens, setSessionTokens } from './httpClient'

export const authService = {
  async login(credentials) {
    const data = await apiRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    setSessionTokens(data.tokens)
    return data.user
  },

  async register(userData) {
    const data = await apiRequest('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    setSessionTokens(data.tokens)
    return data.user
  },

  async fetchProfile() {
    const data = await apiRequest('/auth/me/')
    return data.user
  },

  async updateProfile(profileData) {
    const data = await apiRequest('/auth/me/', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    })
    return data.user
  },

  async logout() {
    try {
      await apiRequest('/auth/logout/', { method: 'POST' })
    } finally {
      clearSessionTokens()
    }
  },
}
