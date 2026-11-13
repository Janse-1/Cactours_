/**
 * Cliente API móvil hacia `cactours_backend` (`/api/v1`).
 * Utiliza almacenamiento seguro (`expo-secure-store`) para credenciales en iOS y Android.
 */
import * as SecureStore from 'expo-secure-store'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000/api/v1'
const ACCESS_TOKEN_KEY = 'cactours_mobile_access_token'

export async function saveAccessToken(token) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token)
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
}

export async function clearAccessToken() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
}

export async function mobileApiRequest(endpoint, options = {}) {
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
  const payload = await response.json()
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || `Error HTTP ${response.status}`)
  }
  return payload.data
}
