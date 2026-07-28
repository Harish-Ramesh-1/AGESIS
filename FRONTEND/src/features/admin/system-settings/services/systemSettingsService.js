import { apiGet, apiPatch } from '../../../../services/apiClient'

// ---- General Settings ----
// NOTE: this shares an `app_settings` row (category 'general') with
// `/admin/school/profile` — see the comment in schoolManagementService.js.
// The seeded row uses different key names (schoolName, academicYearStart)
// than this page's fields; PATCH here merges server-side, so once this page
// saves, its own keys start showing up correctly.

const GENERAL_DEFAULTS = {
  schoolDisplayName: '',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  defaultLanguage: 'English',
}

export async function fetchGeneralSettings() {
  const { data } = await apiGet('/admin/settings/general')
  return { ...GENERAL_DEFAULTS, schoolDisplayName: data.schoolName ?? GENERAL_DEFAULTS.schoolDisplayName, ...data }
}

export async function updateGeneralSettings(patch) {
  const { data } = await apiPatch('/admin/settings/general', patch)
  return { ...GENERAL_DEFAULTS, ...data }
}

// ---- Branding Settings ----

const BRANDING_DEFAULTS = {
  logoUrl: null,
  faviconUrl: null,
  primaryColor: '#4338CA',
  taglineParent: '',
  taglineAccountant: '',
  taglineAdmin: '',
}

export async function fetchBrandingSettings() {
  const { data } = await apiGet('/admin/settings/branding')
  return { ...BRANDING_DEFAULTS, ...data }
}

export async function updateBrandingSettings(patch) {
  const { data } = await apiPatch('/admin/settings/branding', patch)
  return { ...BRANDING_DEFAULTS, ...data }
}

// ---- Academic Configuration ----

const ACADEMIC_DEFAULTS = {
  gradingScale: 'percentage',
  attendanceThresholdPercent: 75,
  workingDays: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false },
  academicYearStartMonth: 'June',
}

export async function fetchAcademicConfig() {
  const { data } = await apiGet('/admin/settings/academic-config')
  return {
    ...ACADEMIC_DEFAULTS,
    ...data,
    workingDays: { ...ACADEMIC_DEFAULTS.workingDays, ...(data.workingDays || {}) },
  }
}

export async function updateAcademicConfig(patch) {
  const { data } = await apiPatch('/admin/settings/academic-config', patch)
  return {
    ...ACADEMIC_DEFAULTS,
    ...data,
    workingDays: { ...ACADEMIC_DEFAULTS.workingDays, ...(data.workingDays || {}) },
  }
}

// ---- Notification Configuration ----

export const NOTIFICATION_EVENTS = [
  { key: 'feeDueReminder', label: 'Fee Due Reminder' },
  { key: 'paymentReceived', label: 'Payment Received' },
  { key: 'admissionUpdate', label: 'Admission Update' },
  { key: 'securityAlert', label: 'Security Alert' },
  { key: 'backupCompleted', label: 'Backup Completed' },
]

export const NOTIFICATION_CHANNELS = [
  { key: 'sms', label: 'SMS' },
  { key: 'email', label: 'Email' },
  { key: 'push', label: 'Push' },
]

const NOTIFICATION_DEFAULTS = {
  feeDueReminder: { sms: true, email: true, push: true },
  paymentReceived: { sms: true, email: true, push: false },
  admissionUpdate: { sms: false, email: true, push: false },
  securityAlert: { sms: true, email: true, push: true },
  backupCompleted: { sms: false, email: true, push: false },
}

export async function fetchNotificationConfig() {
  const { data } = await apiGet('/admin/settings/notification-config')
  return { ...NOTIFICATION_DEFAULTS, ...data }
}

export async function updateNotificationConfig(patch) {
  const { data } = await apiPatch('/admin/settings/notification-config', patch)
  return { ...NOTIFICATION_DEFAULTS, ...data }
}
