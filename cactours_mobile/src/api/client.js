/** Cliente de API, sesión y recursos multimedia para Expo. */
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000/api/v1'
).replace(/\/+$/, '')
const API_ORIGIN = new URL(API_BASE_URL).origin
const ACCESS_TOKEN_KEY = 'cactours_mobile_access_token'
const REFRESH_TOKEN_KEY = 'cactours_mobile_refresh_token'

async function setStoredValue(key, value) {
  if (Platform.OS === 'web') {
    globalThis.localStorage.setItem(key, value)
    return
  }
  await SecureStore.setItemAsync(key, value)
}

async function getStoredValue(key) {
  if (Platform.OS === 'web') return globalThis.localStorage.getItem(key)
  return SecureStore.getItemAsync(key)
}

async function deleteStoredValue(key) {
  if (Platform.OS === 'web') {
    globalThis.localStorage.removeItem(key)
    return
  }
  await SecureStore.deleteItemAsync(key)
}

export function getAccessToken() {
  return getStoredValue(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return getStoredValue(REFRESH_TOKEN_KEY)
}

export async function saveSessionTokens(tokens) {
  if (!tokens?.access) throw new Error('El servidor no entregó un token de acceso.')
  await setStoredValue(ACCESS_TOKEN_KEY, tokens.access)
  if (tokens.refresh) await setStoredValue(REFRESH_TOKEN_KEY, tokens.refresh)
}

export async function clearSessionTokens() {
  await Promise.all([
    deleteStoredValue(ACCESS_TOKEN_KEY),
    deleteStoredValue(REFRESH_TOKEN_KEY),
  ])
}

export function resolveMediaUrl(path) {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  return new URL(path.startsWith('/') ? path : `/${path}`, API_ORIGIN).toString()
}

async function readPayload(response) {
  try {
    return await response.json()
  } catch {
    return { ok: false, error: 'El servidor devolvió una respuesta inválida.' }
  }
}

function createApiError(response, payload) {
  const detailValues = payload?.details && typeof payload.details === 'object'
    ? Object.values(payload.details).flatMap((value) => Array.isArray(value) ? value : [value])
    : []
  const detailText = detailValues.filter((value) => typeof value === 'string').join(' ')
  const error = new Error(payload?.error || detailText || `Error HTTP ${response.status}`)
  error.status = response.status
  error.details = payload?.details || {}
  return error
}

let refreshRequest

async function refreshAccessToken() {
  if (refreshRequest) return refreshRequest

  refreshRequest = (async () => {
    const refresh = await getRefreshToken()
    if (!refresh) return null

    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
    const payload = await readPayload(response)
    if (!response.ok || payload.ok === false || !payload.data?.tokens?.access) {
      await clearSessionTokens()
      return null
    }

    await saveSessionTokens(payload.data.tokens)
    return payload.data.tokens.access
  })()

  try {
    return await refreshRequest
  } finally {
    refreshRequest = null
  }
}

export async function mobileApiRequest(endpoint, options = {}, canRefresh = true) {
  const token = await getAccessToken()
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

  if (
    response.status === 401 &&
    canRefresh &&
    endpoint !== '/auth/refresh/' &&
    endpoint !== '/auth/login/' &&
    endpoint !== '/auth/register/'
  ) {
    const refreshedToken = await refreshAccessToken()
    if (refreshedToken) return mobileApiRequest(endpoint, options, false)
  }

  const payload = await readPayload(response)
  if (!response.ok || payload.ok === false) throw createApiError(response, payload)
  return payload.data
}
