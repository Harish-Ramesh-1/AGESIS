import Razorpay from 'razorpay'
import { env, isPaymentsLive } from './env.js'

export { isPaymentsLive }

export const razorpay = isPaymentsLive
  ? new Razorpay({ key_id: env.razorpayKeyId, key_secret: env.razorpayKeySecret })
  : null

if (!isPaymentsLive) {
  console.warn('[razorpay] Keys not configured — payment endpoints will run in simulated mode.')
}
