import { apiGet, apiPatch, apiPost, apiDelete } from '../../../../services/apiClient'

const DEFAULT_PREFERENCES = {
  notifications: {
    paymentAlerts: { email: true, sms: false, push: true },
    overdueAlerts: { email: true, sms: false, push: true },
    systemAnnouncements: { email: true, sms: false, push: false },
    weeklySummary: { email: true, sms: false, push: false },
  },
  dateFormat: 'DD/MM/YYYY',
  defaultLandingPage: '/accountant/dashboard',
  defaultAcademicYear: '2025-2026',
}

function initialsOf(name) {
  return (name ?? '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function mapProfile(row) {
  return {
    // The backend's shared /settings/profile resource has no HR-style fields (employee ID,
    // department, designation, joining date) — those don't exist anywhere in the schema for
    // accountant users, so they're left blank rather than fabricated.
    employeeId: row.employeeId ?? '',
    name: row.fullName ?? '',
    avatarInitials: initialsOf(row.fullName),
    email: row.email ?? '',
    phone: row.phone ?? '',
    department: '',
    designation: '',
    joiningDate: null,
  }
}

// ---- profile ----

export async function fetchProfile() {
  const [profileRes, securityRes] = await Promise.all([
    apiGet('/settings/profile'),
    apiGet('/settings/security').catch(() => ({ data: { sessions: [] } })),
  ])
  const profile = profileRes.data ?? {}
  const sessions = securityRes.data?.sessions ?? []
  const lastLogin = sessions.reduce((latest, session) => {
    const t = session.lastActive
    if (!t) return latest
    return !latest || new Date(t) > new Date(latest) ? t : latest
  }, null)

  return {
    profile: mapProfile(profile),
    activity: {
      lastLogin,
      activeSessionCount: sessions.length,
    },
  }
}

export async function updateProfile(patch) {
  const { data } = await apiPatch('/settings/profile', {
    fullName: patch.name,
    email: patch.email,
    phone: patch.phone,
  })
  return mapProfile(data ?? {})
}

// ---- security ----

export async function fetchSecurity() {
  const { data } = await apiGet('/settings/security')
  return {
    twoFactorEnabled: !!data?.twoFactorEnabled,
    sessions: (data?.sessions ?? []).map((session) => ({
      id: session.id,
      device: session.device,
      browser: session.browser,
      location: session.location,
      lastActive: session.lastActive,
      current: !!session.current,
    })),
    // The backend has no login-history endpoint (only current active sessions) — left empty
    // rather than fabricated.
    loginHistory: [],
  }
}

export async function changePassword({ currentPassword, newPassword }) {
  await apiPost('/settings/security/change-password', { currentPassword, newPassword })
  return { success: true, changedAt: new Date().toISOString() }
}

export async function toggleTwoFactor(enabled) {
  const { data } = await apiPatch('/settings/security/two-factor', { enabled })
  return { twoFactorEnabled: data?.twoFactorEnabled ?? enabled }
}

export async function signOutSession(sessionId) {
  await apiDelete(`/settings/security/sessions/${sessionId}`)
  const { data } = await apiGet('/settings/security')
  return (data?.sessions ?? []).map((session) => ({
    id: session.id,
    device: session.device,
    browser: session.browser,
    location: session.location,
    lastActive: session.lastActive,
    current: !!session.current,
  }))
}

export async function signOutOtherSessions() {
  await apiDelete('/settings/security/sessions')
  const { data } = await apiGet('/settings/security')
  return (data?.sessions ?? []).map((session) => ({
    id: session.id,
    device: session.device,
    browser: session.browser,
    location: session.location,
    lastActive: session.lastActive,
    current: !!session.current,
  }))
}

// ---- preferences ----

function mergePreferences(raw) {
  if (!raw || typeof raw !== 'object' || Object.keys(raw).length === 0) return { ...DEFAULT_PREFERENCES }
  return {
    ...DEFAULT_PREFERENCES,
    ...raw,
    notifications: { ...DEFAULT_PREFERENCES.notifications, ...(raw.notifications ?? {}) },
  }
}

export async function fetchPreferences() {
  const { data } = await apiGet('/settings/preferences')
  return mergePreferences(data)
}

export async function updatePreferences(patch) {
  const { data } = await apiPatch('/settings/preferences', patch)
  return mergePreferences(data)
}
