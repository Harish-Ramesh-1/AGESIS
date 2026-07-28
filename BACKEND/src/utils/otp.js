import crypto from 'crypto'

export function generateOtpCode() {
  return String(crypto.randomInt(100000, 999999))
}

export function hashOtp(code) {
  return crypto.createHash('sha256').update(code).digest('hex')
}
