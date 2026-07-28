import rateLimit from 'express-rate-limit'

// Generous global ceiling — mainly to blunt scripted abuse, not normal usage.
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again shortly.' },
})

// OTP generate/verify are the most attractive brute-force/spam targets
// (guessing codes, hammering someone's inbox) — keep this tight.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please wait a few minutes and try again.' },
})
