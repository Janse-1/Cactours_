/**
 * Cliente HTTP centralizado para comunicarse con `cactours_backend` (`/api/v1`).
 * Adjunta automáticamente el Bearer token almacenado y maneja errores de red/API.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'
const TOKEN_STORAGE_KEY = 'cactours_access_token'
const REFRESH_STORAGE_KEY = 'cactours_refresh_token'

export function getAccessToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setSessionTokens(tokens) {
  if (!tokens) return
  if (tokens.access) localStorage.setItem(TOKEN_STORAGE_KEY, tokens.access)
  if (tokens.refresh) localStorage.setItem(REFRESH_STORAGE_KEY, tokens.refresh)
}

export function clearSessionTokens() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(REFRESH_STORAGE_KEY)
}

export async function apiRequest(endpoint, options = {}) {
  const token = getAccessToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const payload = await response.json().catch(() => ({
    ok: false,
    error: 'Respuesta inválida del servidor.',
  }))

  if (!response.ok || payload.ok === false) {
    const error = new Error(payload.error || `Error HTTP ${response.status}`)
    error.status = response.status
    error.details = payload.details || {}
    throw error
  }

  return payload.data
}
