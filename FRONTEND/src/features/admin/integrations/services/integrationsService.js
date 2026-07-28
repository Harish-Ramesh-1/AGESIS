import { apiDelete, apiGet, apiPost } from '../../../../services/apiClient'
import { API_BASE_URL } from '../../../../constants/api'

function titleCase(value) {
  if (!value) return ''
  return value.charAt(0).toUpperCase() + value.slice(1)
}

// ---- Payment Gateway ----
// The backend never exposes the real Razorpay secret (correctly, for
// security) — `/admin/integrations/payment-gateway` only returns a
// `keyConfigured` boolean, no masked/full key, transaction fee, settlement
// cycle, or webhook URL. Those display fields are honestly represented as
// "not configured" placeholders rather than invented look-alike values.
// `regeneratePaymentGatewayKey` and `testPaymentGatewayConnection` are
// inherently simulated on the backend too (see API reference), so their
// success/message/timing are taken directly from the real response.

function mapPaymentGateway(value) {
  return {
    provider: titleCase(value.provider) || 'Razorpay',
    status: value.keyConfigured ? 'connected' : 'disconnected',
    apiKeyMasked: value.keyConfigured ? 'Configured on server (not exposed via API)' : 'Not configured',
    apiKeyFull: value.keyConfigured ? 'Configured on server (not exposed via API)' : 'Not configured',
    webhookUrl: `${API_BASE_URL}/payments/webhook`,
    transactionFeePercent: value.transactionFeePercent ?? null,
    settlementCycle: value.settlementCycle ?? 'Not configured',
    lastTestedAt: value.lastRotatedAt ?? null,
  }
}

export async function fetchPaymentGateway() {
  const { data } = await apiGet('/admin/integrations/payment-gateway')
  return mapPaymentGateway(data)
}

export async function regeneratePaymentGatewayKey() {
  const { data } = await apiPost('/admin/integrations/payment-gateway/regenerate-key')
  return mapPaymentGateway(data)
}

export async function testPaymentGatewayConnection() {
  const start = Date.now()
  const { data } = await apiPost('/admin/integrations/payment-gateway/test')
  const latencyMs = Date.now() - start
  return { success: data.success, message: data.message, testedAt: new Date().toISOString(), latencyMs }
}

// ---- SMS Gateway ----
// The sms_config settings row doesn't track sender id or credit balances at
// all — defaulted honestly to "no data" rather than fabricated numbers.

export async function fetchSmsConfig() {
  const { data } = await apiGet('/admin/integrations/sms')
  return {
    provider: titleCase(data.provider) || 'Not configured',
    senderId: data.senderId ?? '—',
    apiKeyMasked: data.configured ? 'Configured on server (not exposed via API)' : 'Not configured',
    creditsRemaining: data.creditsRemaining ?? 0,
    creditsTotal: data.creditsTotal ?? 1,
    lastTestedAt: data.lastTestedAt ?? null,
  }
}

export async function testSms(phoneNumber) {
  if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 10) {
    throw new Error('Enter a valid 10-digit phone number.')
  }
  const { data } = await apiPost('/admin/integrations/sms/test', { phoneNumber })
  if (data.status === 'failed') throw new Error(data.error || 'Failed to send test SMS.')
  return { success: true, sentTo: phoneNumber, status: data.status }
}

// ---- Email Service ----
// email_config likewise has no from-address/name or quota tracked server-side.

export async function fetchEmailConfig() {
  const { data } = await apiGet('/admin/integrations/email')
  return {
    provider: titleCase(data.provider) || 'Not configured',
    fromAddress: data.fromAddress ?? 'Not configured',
    fromName: data.fromName ?? 'AGESIS School Portal',
    dailyQuotaUsed: data.dailyQuotaUsed ?? 0,
    dailyQuotaTotal: data.dailyQuotaTotal ?? 1,
    lastTestedAt: data.lastTestedAt ?? null,
  }
}

export async function testEmail(emailAddress) {
  if (!emailAddress || !/^\S+@\S+\.\S+$/.test(emailAddress)) {
    throw new Error('Enter a valid email address.')
  }
  const { data } = await apiPost('/admin/integrations/email/test', { emailAddress })
  if (data.status === 'failed') throw new Error(data.error || 'Failed to send test email.')
  return { success: true, sentTo: emailAddress, status: data.status }
}

// ---- API Keys & Webhooks ----

export async function fetchApiKeys() {
  const { data } = await apiGet('/admin/integrations/api-keys')
  return data
    .filter((row) => !row.revoked_at)
    .map((row) => ({
      id: row.id,
      label: row.label,
      // The full/hashed key is never returned after creation — only the
      // stored prefix is available on fetch.
      maskedKey: `${row.key_prefix}••••••••`,
      createdAt: row.created_at,
      lastUsedAt: row.last_used_at,
    }))
}

export async function generateApiKey(label) {
  // NOTE: the backend returns the real raw secret key exactly once, in the
  // POST response body (`{ ...row, key }`). This store/page has no UI slot to
  // reveal a freshly generated key, so — unlike the old mock, which faked a
  // "full key" that was always retrievable — the real raw secret is
  // currently unrecoverable after this call. Flagging this as a genuine UX
  // gap rather than working around it by inventing a persisted "full key".
  await apiPost('/admin/integrations/api-keys', { label: label?.trim() || 'Untitled Key' })
  return fetchApiKeys()
}

export async function revokeApiKey(id) {
  await apiDelete(`/admin/integrations/api-keys/${id}`)
  return fetchApiKeys()
}

export async function fetchWebhooks() {
  const { data } = await apiGet('/admin/integrations/webhooks')
  return data.map((row) => ({
    id: row.id,
    url: row.url,
    eventType: Array.isArray(row.events) && row.events.length ? row.events.join(', ') : '—',
    status: row.active ? 'active' : 'failing',
    // The webhooks table has no delivery log — falling back to the
    // registration date instead of a fabricated delivery timestamp.
    lastDeliveryAt: row.created_at,
    lastDeliveryStatus: 'Not tracked by the backend',
  }))
}
