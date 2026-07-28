import { apiDelete, apiGet, apiPatch, apiPost } from '../../../../services/apiClient'

// ---- login sessions (across all users) ----

function mapSession(row) {
  return {
    id: row.id,
    user: row.users?.full_name ?? 'Unknown User',
    // The sessions table only stores the user's portal, not a role name —
    // portal is the closest honest analog available via the join.
    role: row.users?.portal ? row.users.portal.charAt(0).toUpperCase() + row.users.portal.slice(1) : '—',
    device: row.device_label || row.user_agent || 'Unknown device',
    ip: row.ip ?? '—',
    // No geo-IP lookup exists on the backend for sessions.
    location: '—',
    loginTime: row.created_at,
    // The backend only ever returns non-revoked sessions, and has no
    // "flagged" concept — every real row is honestly 'active'.
    status: 'active',
  }
}

export async function fetchSessions() {
  const { data } = await apiGet('/admin/security/sessions')
  return data.map(mapSession).sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime))
}

export async function revokeSession(id) {
  await apiDelete(`/admin/security/sessions/${id}`)
  return fetchSessions()
}

// ---- security alerts ----

function mapAlert(row) {
  return {
    id: row.id,
    type: row.type,
    // security_alerts has no `user` column — `description` is the closest
    // honest analog for identifying the affected account/context.
    user: row.description || '—',
    ip: row.ip ?? '—',
    location: '—',
    timestamp: row.created_at,
    severity: row.severity,
    status: row.status,
  }
}

export async function fetchAlerts() {
  const { data } = await apiGet('/admin/security/alerts')
  return data.map(mapAlert).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

export async function resolveAlert(id) {
  await apiPatch(`/admin/security/alerts/${id}/resolve`)
  return fetchAlerts()
}

export async function blockAlertIp(id) {
  await apiPatch(`/admin/security/alerts/${id}/block-ip`)
  return fetchAlerts()
}

// ---- security policies ----
// The seeded `security_policies` row uses different key names
// (passwordMinLength, mfaRequired) than this page's fields. PATCH merges
// server-side, so defaults fill the gap until this page saves for real.

const POLICY_DEFAULTS = {
  enforce2FA: false,
  requireSymbolInPassword: false,
  minPasswordLength: 8,
  sessionTimeoutMinutes: 30,
  maxFailedLoginAttempts: 5,
  otpExpiryMinutes: 10,
}

export async function fetchPolicies() {
  const { data } = await apiGet('/admin/security/policies')
  return { ...POLICY_DEFAULTS, ...data }
}

export async function updatePolicies(patch) {
  const { data } = await apiPatch('/admin/security/policies', patch)
  return { ...POLICY_DEFAULTS, ...data }
}

// ---- access control ----

async function resolveUserNames(ids) {
  const uniqueIds = [...new Set(ids.filter(Boolean))]
  if (uniqueIds.length === 0) return new Map()
  const { data: users } = await apiGet('/admin/users')
  return new Map(users.map((user) => [user.id, user.full_name]))
}

export async function fetchAccessControl() {
  const { data } = await apiGet('/admin/security/access-control')
  const allowedIps = data.allowedIps || []
  const nameById = await resolveUserNames(allowedIps.map((row) => row.created_by))

  return {
    allowlist: allowedIps.map((row) => ({
      id: row.id,
      ipOrCidr: row.ip_or_cidr,
      label: row.label,
      addedBy: nameById.get(row.created_by) ?? '—',
      date: row.created_at,
    })),
    deviceTrust: {
      requireDeviceVerification: Boolean(data.deviceTrust?.requireKnownDevice ?? data.deviceTrust?.requireDeviceVerification ?? false),
    },
  }
}

export async function addAllowedIp({ ipOrCidr, label }) {
  await apiPost('/admin/security/access-control/allowed-ips', { ipOrCidr, label })
  const { allowlist } = await fetchAccessControl()
  return allowlist
}

export async function removeAllowedIp(id) {
  await apiDelete(`/admin/security/access-control/allowed-ips/${id}`)
  const { allowlist } = await fetchAccessControl()
  return allowlist
}

export async function updateDeviceTrust(patch) {
  const { data } = await apiPatch('/admin/security/access-control/device-trust', {
    requireKnownDevice: patch.requireDeviceVerification,
  })
  return { requireDeviceVerification: Boolean(data?.requireKnownDevice ?? patch.requireDeviceVerification) }
}
