export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const AUTH_ENDPOINTS = {
  generateOtp: `${API_BASE_URL}/auth/otp/generate`,
  verifyOtp: `${API_BASE_URL}/auth/otp/verify`,
}

export const PAYMENT_ENDPOINTS = {
  checkout: `${API_BASE_URL}/payments/checkout`,
}

// No backend is wired up yet, so auth falls back to a mock flow (demo credentials
// + a fixed OTP) until VITE_API_BASE_URL points at a real service. Set
// VITE_ENABLE_DEMO_AUTH=false once the backend is ready.
export const IS_DEMO_AUTH = import.meta.env.VITE_ENABLE_DEMO_AUTH !== 'false'

export const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY

// Without a real Razorpay key configured, payments fall back to a simulated
// checkout flow so the Pay Fees journey can still be demoed end to end.
export const IS_DEMO_PAYMENTS = !RAZORPAY_KEY
