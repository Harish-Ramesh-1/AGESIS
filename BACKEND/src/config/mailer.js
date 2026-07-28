import nodemailer from 'nodemailer'
import { env, isEmailLive } from './env.js'

export { isEmailLive }

const transporter = isEmailLive
  ? nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: { user: env.smtpUser, pass: env.smtpPass },
    })
  : null

if (!isEmailLive) {
  console.warn('[mailer] SMTP not configured — emails will be logged instead of sent.')
}

/**
 * Sends an email, or logs it when SMTP isn't configured. Never throws —
 * callers should not fail their primary action just because a notification failed.
 */
export async function sendEmail({ to, subject, html, text, attachments }) {
  if (!to) return { status: 'skipped', reason: 'no-recipient' }

  if (!transporter) {
    console.log(`[mailer:demo] To: ${to} | Subject: ${subject}`)
    return { status: 'logged' }
  }

  try {
    await transporter.sendMail({ from: env.smtpFrom, to, subject, html, text, attachments })
    return { status: 'sent' }
  } catch (error) {
    console.error('[mailer] send failed', error.message)
    return { status: 'failed', error: error.message }
  }
}
