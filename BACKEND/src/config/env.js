import 'dotenv/config'

function bool(value, fallback = false) {
  if (value === undefined || value === '') return fallback
  return value === 'true' || value === '1'
}

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  // Comma-separated list, e.g. "https://agesis.vercel.app,http://localhost:5173"
  // Origin headers never carry a trailing slash — strip one if pasted in by
  // mistake, since an exact-match miss here silently breaks every request.
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean),

  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'insecure-dev-access-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'insecure-dev-refresh-secret',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  otpTtlMinutes: Number(process.env.OTP_TTL_MINUTES || 5),
  otpDemoMode: bool(process.env.OTP_DEMO_MODE, true),
  otpDemoCode: process.env.OTP_DEMO_CODE || '123456',

  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',

  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: bool(process.env.SMTP_SECURE, false),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || 'AGESIS School <no-reply@agesisschool.edu>',

  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioFromNumber: process.env.TWILIO_FROM_NUMBER || '',
}

export const isPaymentsLive = Boolean(env.razorpayKeyId && env.razorpayKeySecret)
export const isEmailLive = Boolean(env.smtpHost && env.smtpUser && env.smtpPass)
export const isSmsLive = Boolean(env.twilioAccountSid && env.twilioAuthToken && env.twilioFromNumber)

// Fail fast in production rather than silently signing tokens with a known,
// publicly-visible default secret (this file is open source).
if (env.nodeEnv === 'production') {
  const insecureDefaults = {
    JWT_ACCESS_SECRET: 'insecure-dev-access-secret',
    JWT_REFRESH_SECRET: 'insecure-dev-refresh-secret',
  }
  if (env.jwtAccessSecret === insecureDefaults.JWT_ACCESS_SECRET || env.jwtRefreshSecret === insecureDefaults.JWT_REFRESH_SECRET) {
    throw new Error('JWT_ACCESS_SECRET / JWT_REFRESH_SECRET must be set to real secrets in production.')
  }
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY must be set in production.')
  }
}
