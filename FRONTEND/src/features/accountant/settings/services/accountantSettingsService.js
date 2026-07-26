const DELAY_MS = 600

function delay(ms = DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const ACCOUNTANT_NAME = 'Kavita Sharma'

// ---- in-memory "database" ----

const PROFILE = {
  employeeId: 'EMP-2019-0042',
  name: ACCOUNTANT_NAME,
  avatarInitials: 'KS',
  email: 'kavita.sharma@agesis.edu',
  phone: '+91 98450 67890',
  department: 'Finance & Accounts',
  designation: 'Senior Accountant',
  joiningDate: '2019-06-03',
}

const ACCOUNT_ACTIVITY = {
  lastLogin: '2026-07-26T06:45:00Z',
  activeSessionCount: 3,
}

let TWO_FACTOR_ENABLED = false

const SESSIONS = [
  { id: 'sess-1', device: 'MacBook Pro', browser: 'Chrome 126', location: 'Chennai, India', lastActive: '2026-07-26T09:10:00Z', current: true },
  { id: 'sess-2', device: 'iPhone 14', browser: 'Safari Mobile', location: 'Chennai, India', lastActive: '2026-07-25T20:32:00Z', current: false },
  { id: 'sess-3', device: 'Windows PC', browser: 'Edge 125', location: 'Bengaluru, India', lastActive: '2026-07-24T13:05:00Z', current: false },
  { id: 'sess-4', device: 'iPad Air', browser: 'Safari', location: 'Chennai, India', lastActive: '2026-07-20T08:47:00Z', current: false },
]

const LOGIN_HISTORY = [
  { id: 'log-1', date: '2026-07-26T06:45:00Z', device: 'MacBook Pro - Chrome 126', ipAddress: '103.21.244.10', status: 'success' },
  { id: 'log-2', date: '2026-07-25T20:32:00Z', device: 'iPhone 14 - Safari Mobile', ipAddress: '117.198.10.44', status: 'success' },
  { id: 'log-3', date: '2026-07-24T13:05:00Z', device: 'Windows PC - Edge 125', ipAddress: '49.204.117.6', status: 'success' },
  { id: 'log-4', date: '2026-07-23T18:12:00Z', device: 'Unknown Device - Chrome 124', ipAddress: '188.65.114.9', status: 'failed' },
  { id: 'log-5', date: '2026-07-22T09:02:00Z', device: 'MacBook Pro - Chrome 126', ipAddress: '103.21.244.10', status: 'success' },
  { id: 'log-6', date: '2026-07-20T08:47:00Z', device: 'iPad Air - Safari', ipAddress: '117.198.10.44', status: 'success' },
  { id: 'log-7', date: '2026-07-18T21:40:00Z', device: 'Unknown Device - Firefox 118', ipAddress: '45.79.201.3', status: 'failed' },
  { id: 'log-8', date: '2026-07-15T07:55:00Z', device: 'Windows PC - Edge 125', ipAddress: '49.204.117.6', status: 'success' },
  { id: 'log-9', date: '2026-07-10T11:20:00Z', device: 'MacBook Pro - Chrome 125', ipAddress: '103.21.244.10', status: 'success' },
]

const PREFERENCES = {
  notifications: {
    paymentAlerts: { email: true, sms: true, push: true },
    overdueAlerts: { email: true, sms: false, push: true },
    systemAnnouncements: { email: true, sms: false, push: false },
    weeklySummary: { email: true, sms: false, push: false },
  },
  dateFormat: 'DD/MM/YYYY',
  defaultLandingPage: '/accountant/dashboard',
  defaultAcademicYear: '2025-2026',
}

// ---- profile ----

export async function fetchProfile() {
  await delay()
  return { profile: { ...PROFILE }, activity: { ...ACCOUNT_ACTIVITY } }
}

export async function updateProfile(patch) {
  await delay()
  Object.assign(PROFILE, patch)
  return { ...PROFILE }
}

// ---- security ----

export async function fetchSecurity() {
  await delay()
  return {
    twoFactorEnabled: TWO_FACTOR_ENABLED,
    sessions: SESSIONS.map((session) => ({ ...session })),
    loginHistory: LOGIN_HISTORY.map((entry) => ({ ...entry })),
  }
}

export async function changePassword({ currentPassword }) {
  await delay()
  if (currentPassword !== 'password123') {
    throw new Error('Current password is incorrect.')
  }
  // newPassword is accepted by the caller but not persisted anywhere in this mock service
  return { success: true, changedAt: new Date().toISOString() }
}

export async function toggleTwoFactor(enabled) {
  await delay()
  TWO_FACTOR_ENABLED = enabled
  return { twoFactorEnabled: TWO_FACTOR_ENABLED }
}

export async function signOutSession(sessionId) {
  await delay()
  const index = SESSIONS.findIndex((session) => session.id === sessionId)
  if (index !== -1 && !SESSIONS[index].current) {
    SESSIONS.splice(index, 1)
  }
  return SESSIONS.map((session) => ({ ...session }))
}

export async function signOutOtherSessions() {
  await delay()
  const remaining = SESSIONS.filter((session) => session.current)
  SESSIONS.length = 0
  SESSIONS.push(...remaining)
  return SESSIONS.map((session) => ({ ...session }))
}

// ---- preferences ----

export async function fetchPreferences() {
  await delay()
  return {
    ...PREFERENCES,
    notifications: JSON.parse(JSON.stringify(PREFERENCES.notifications)),
  }
}

export async function updatePreferences(patch) {
  await delay()
  Object.assign(PREFERENCES, patch, {
    notifications: patch.notifications ? { ...PREFERENCES.notifications, ...patch.notifications } : PREFERENCES.notifications,
  })
  return {
    ...PREFERENCES,
    notifications: JSON.parse(JSON.stringify(PREFERENCES.notifications)),
  }
}
