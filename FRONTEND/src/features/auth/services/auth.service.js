import { AUTH_ENDPOINTS } from '../../../constants/api'

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || 'Something went wrong. Please try again.')
  }

  return data
}

export async function login({ portal, idValue, email, password }) {
  return postJson(AUTH_ENDPOINTS.login, { portal, idValue, email, password })
}
