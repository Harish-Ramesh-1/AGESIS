import { AUTH_ENDPOINTS, IS_DEMO_AUTH } from '../../../constants/api'
import { DEMO_OTP } from '../../../constants/roles'

const MOCK_DELAY_MS = 700

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

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

export async function generateOtp({ portal, idValue, email }) {
  if (IS_DEMO_AUTH) {
    await delay(MOCK_DELAY_MS)
    return { message: 'Demo OTP sent.' }
  }
  return postJson(AUTH_ENDPOINTS.generateOtp, { portal, idValue, email })
}

export async function verifyOtp({ portal, idValue, email, otp }) {
  if (IS_DEMO_AUTH) {
    await delay(MOCK_DELAY_MS)
    if (otp !== DEMO_OTP) {
      throw new Error(`Invalid OTP. Use the demo code ${DEMO_OTP}.`)
    }
    return { message: 'Demo login successful.' }
  }
  return postJson(AUTH_ENDPOINTS.verifyOtp, { portal, idValue, email, otp })
}
