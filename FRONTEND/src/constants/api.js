export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const AUTH_ENDPOINTS = {
  login: `${API_BASE_URL}/auth/login`,
}

export const PAYMENT_ENDPOINTS = {
  checkout: `${API_BASE_URL}/payments/checkout`,
}

// Password-based login against the real backend — keep the on-screen autofill
// hints visible so judges/visitors can try every portal without needing to
// know or remember any credentials themselves.
export const SHOW_LOGIN_HINTS = true

export const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY

// Without a real Razorpay key configured, payments fall back to a simulated
// checkout flow so the Pay Fees journey can still be demoed end to end.
export const IS_DEMO_PAYMENTS = !RAZORPAY_KEY
