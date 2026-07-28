import { API_BASE_URL } from '../constants/api'
import { useAuthStore } from '../store/authStore'

let refreshPromise = null

async function refreshAccessToken() {
  const refreshToken = useAuthStore.getState().refreshToken
  if (!refreshToken) return null

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Session expired')
        const data = await response.json()
        useAuthStore.getState().setAccessToken(data.accessToken)
        return data.accessToken
      })
      .catch((error) => {
        useAuthStore.getState().logout()
        throw error
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

/**
 * Thin fetch wrapper for the AGESIS backend API. Attaches the JWT access
 * token, retries once on 401 after a silent refresh, and throws an Error
 * whose message is the backend's `message` field (matching the existing
 * auth.service.js error-handling convention).
 */
export async function apiRequest(path, { method = 'GET', body, auth = true, isFormData = false } = {}) {
  async function attempt() {
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' }
    if (auth) {
      const token = useAuthStore.getState().accessToken
      if (token) headers.Authorization = `Bearer ${token}`
    }
    return fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    })
  }

  let response = await attempt()

  if (response.status === 401 && auth && useAuthStore.getState().refreshToken) {
    try {
      await refreshAccessToken()
      response = await attempt()
    } catch {
      // fall through — the original 401 response is handled below
    }
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || 'Something went wrong. Please try again.')
  }

  return data
}

export const apiGet = (path) => apiRequest(path)
export const apiPost = (path, body) => apiRequest(path, { method: 'POST', body })
export const apiPatch = (path, body) => apiRequest(path, { method: 'PATCH', body })
export const apiPut = (path, body) => apiRequest(path, { method: 'PUT', body })
export const apiDelete = (path) => apiRequest(path, { method: 'DELETE' })
