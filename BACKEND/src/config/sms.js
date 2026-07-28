import twilio from 'twilio'
import { env, isSmsLive } from './env.js'

export { isSmsLive }

const client = isSmsLive ? twilio(env.twilioAccountSid, env.twilioAuthToken) : null

if (!isSmsLive) {
  console.warn('[sms] Twilio not configured — SMS will be logged instead of sent.')
}

/** Sends an SMS, or logs it when Twilio isn't configured. Never throws. */
export async function sendSms({ to, body }) {
  if (!to) return { status: 'skipped', reason: 'no-recipient' }

  if (!client) {
    console.log(`[sms:demo] To: ${to} | ${body}`)
    return { status: 'logged' }
  }

  try {
    await client.messages.create({ to, from: env.twilioFromNumber, body })
    return { status: 'sent' }
  } catch (error) {
    console.error('[sms] send failed', error.message)
    return { status: 'failed', error: error.message }
  }
}
