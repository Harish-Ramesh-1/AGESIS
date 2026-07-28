import { apiGet, apiPatch, apiPost } from '../../../services/apiClient'
import { useAuthStore } from '../../../store/authStore'

function accountantName() {
  const user = useAuthStore.getState().user
  return user?.fullName || user?.full_name || user?.name || 'Accountant'
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

// The backend's LateFeeRule model uses different field names (grace_days, fee_type, amount,
// applies_to, active) than this UI's calculator (perDay/flatAmount/percentage/maxPenalty/
// gracePeriodDays). LATE_FEE_RULES is imported as a plain synchronous value by lateFeeStore.js
// (not fetched), so it can't be swapped for a live GET /dues/late-fees/rules call without also
// changing that store — kept as a static default and left out of scope per the rewiring rules.
export const LATE_FEE_RULES = {
  perDay: 100,
  flatAmount: 500,
  percentage: 2,
  maxPenalty: 5000,
  gracePeriodDays: 5,
  activeMode: 'perDay',
}

const REMINDER_TEMPLATES = [
  { key: 'upcoming-due', label: 'Upcoming Due', tone: 'A friendly heads-up that a fee installment is due soon.' },
  { key: 'overdue', label: 'Overdue', tone: 'A notice that a payment deadline has passed.' },
  { key: 'final', label: 'Final Reminder', tone: 'A firm final notice before escalation.' },
  { key: 'friendly', label: 'Friendly Reminder', tone: 'A warm, low-pressure nudge.' },
  { key: 'urgent', label: 'Urgent Notice', tone: 'An urgent notice for critically overdue accounts.' },
]

const REMINDER_CHANNELS = ['Email', 'SMS', 'Push Notification', 'WhatsApp']

function mapChannelToBackend(channel) {
  if (channel === 'Email') return 'email'
  if (channel === 'SMS') return 'sms'
  // Push Notification / WhatsApp have no distinct backend channel — sent as "all".
  return 'all'
}

async function loadGuardianMap() {
  const { data } = await apiGet('/students').catch(() => ({ data: [] }))
  const map = new Map()
  ;(data ?? []).forEach((student) => map.set(student.id, student))
  return map
}

async function loadLateFeeMap() {
  const { data } = await apiGet('/dues/late-fees/history').catch(() => ({ data: [] }))
  const map = new Map()
  ;(data ?? []).forEach((charge) => {
    const key = charge.due_id ?? charge.dueId
    if (!key) return
    const existing = map.get(key) ?? { amount: 0, waived: false, approvedBy: null }
    existing.amount += Number(charge.amount) || 0
    if (charge.waived) existing.waived = true
    existing.approvedBy = charge.approved_by ?? charge.approvedBy ?? existing.approvedBy
    map.set(key, existing)
  })
  return map
}

function computeStatusMeta(dueDate) {
  if (!dueDate) return { daysRemaining: 0, daysOverdue: 0 }
  const diff = Math.round((new Date(dueDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86_400_000)
  return { daysRemaining: diff, daysOverdue: diff < 0 ? Math.abs(diff) : 0 }
}

function computePriority(daysOverdue, amount) {
  if (daysOverdue > 30 || amount > 60000) return 'critical'
  if (daysOverdue > 20) return 'high'
  if (daysOverdue > 7) return 'medium'
  return 'low'
}

function mapDueRow(due, guardianMap, lateFeeMap) {
  const guardian = guardianMap?.get(due.student_id)
  const { daysRemaining, daysOverdue } = computeStatusMeta(due.due_date)
  const lateFeeEntry = lateFeeMap?.get(due.id)
  const outstandingAmount = Number(due.amount_due) - Number(due.amount_paid || 0)
  const lateFee = lateFeeEntry?.amount ?? 0
  return {
    id: due.id,
    studentId: due.student_id,
    studentName: due.students?.full_name ?? '',
    registrationNumber: due.students?.admission_no ?? '',
    className: due.students?.class_name ?? '',
    section: due.students?.section ?? '',
    parentName: guardian?.guardian_name ?? '',
    parentPhone: guardian?.guardian_phone ?? '',
    feeCategory: due.description ?? '',
    installment: due.description ?? '',
    outstandingAmount,
    dueDate: due.due_date,
    avatarInitials: initialsOf(due.students?.full_name ?? ''),
    status: due.status ?? (daysOverdue > 0 ? 'overdue' : daysRemaining === 0 ? 'due-today' : 'pending'),
    daysRemaining,
    daysOverdue,
    lateFee,
    penalty: lateFee,
    priority: daysOverdue > 0 ? computePriority(daysOverdue, outstandingAmount) : null,
    academicYear: '2025-2026',
    penaltyStatus: lateFeeEntry ? (lateFeeEntry.waived ? 'waived' : 'applied') : lateFee > 0 ? 'pending' : 'none',
    waiverStatus: lateFeeEntry?.waived ? 'fully-waived' : 'none',
    approvedBy: lateFeeEntry?.approvedBy ?? null,
  }
}

function applyClientFilters(rows, filters = {}) {
  const { query, className, section, feeCategory, status, minAmount, maxAmount } = filters
  return rows.filter((row) => {
    if (query) {
      const q = query.toLowerCase()
      const haystack = [row.studentName, row.registrationNumber, row.parentName, row.parentPhone, row.className, row.section].join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    if (className && row.className !== className) return false
    if (section && row.section !== section) return false
    if (feeCategory && row.feeCategory !== feeCategory) return false
    if (status && row.status !== status) return false
    if (minAmount && row.outstandingAmount < Number(minAmount)) return false
    if (maxAmount && row.outstandingAmount > Number(maxAmount)) return false
    return true
  })
}

export async function fetchDueList(filters) {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  const qs = params.toString()
  const [duesRes, guardianMap, lateFeeMap] = await Promise.all([apiGet(`/dues${qs ? `?${qs}` : ''}`), loadGuardianMap(), loadLateFeeMap()])
  const rows = (duesRes.data ?? []).map((due) => mapDueRow(due, guardianMap, lateFeeMap))
  return applyClientFilters(rows, filters)
}

export async function fetchOverdue(filters) {
  const [duesRes, guardianMap, lateFeeMap] = await Promise.all([apiGet('/dues/overdue'), loadGuardianMap(), loadLateFeeMap()])
  const rows = (duesRes.data ?? []).map((due) => mapDueRow(due, guardianMap, lateFeeMap))
  return applyClientFilters(rows, filters)
}

export async function fetchStudentDue(id) {
  const [studentRes, duesRes] = await Promise.all([apiGet(`/students/${id}`).catch(() => ({ data: null })), apiGet('/dues').catch(() => ({ data: [] }))])
  const dues = duesRes.data ?? []
  let due
  if (studentRes.data) {
    due = dues.find((row) => row.student_id === id)
  } else {
    due = dues.find((row) => row.id === id)
  }
  if (!due) throw new Error('Student due record not found')
  const [guardianMap, lateFeeMap] = await Promise.all([loadGuardianMap(), loadLateFeeMap()])
  return mapDueRow(due, guardianMap, lateFeeMap)
}

export async function fetchAnalytics() {
  const [analyticsRes, allDuesRes] = await Promise.all([apiGet('/dues/analytics'), apiGet('/dues')])
  const analytics = analyticsRes.data ?? {}
  const dues = allDuesRes.data ?? []
  const outstanding = dues.filter((row) => row.status !== 'paid')

  const buckets = {
    '0-30 days': { amount: 0, count: 0 },
    '31-60 days': { amount: 0, count: 0 },
    '61-90 days': { amount: 0, count: 0 },
    '90+ days': { amount: 0, count: 0 },
  }
  const classMap = new Map()
  const categoryMap = new Map()

  outstanding.forEach((row) => {
    const amount = Number(row.amount_due) - Number(row.amount_paid || 0)
    const { daysOverdue } = computeStatusMeta(row.due_date)
    const bucketKey = daysOverdue > 90 ? '90+ days' : daysOverdue > 60 ? '61-90 days' : daysOverdue > 30 ? '31-60 days' : '0-30 days'
    buckets[bucketKey].amount += amount
    buckets[bucketKey].count += 1

    const className = `Class ${row.students?.class_name ?? '—'}`
    classMap.set(className, (classMap.get(className) ?? 0) + amount)

    const label = row.description ?? 'Other'
    const entry = categoryMap.get(label) ?? { amount: 0, count: 0 }
    entry.amount += amount
    entry.count += 1
    categoryMap.set(label, entry)
  })

  const totalCategoryAmount = [...categoryMap.values()].reduce((sum, entry) => sum + entry.amount, 0) || 1

  return {
    // The backend's /dues/analytics only exposes a current snapshot (no historical series), so
    // these trends are represented as a single "Current" point rather than a fabricated multi-month trend.
    outstandingTrend: [{ label: 'Current', amount: Number(analytics.totalOutstanding) || 0 }],
    ageingBuckets: Object.entries(buckets).map(([bucket, value]) => ({ bucket, ...value })),
    recoveryTrend: [
      {
        label: 'Current',
        recoveryPercent: Number(analytics.totalDues) > 0 ? Math.round(((Number(analytics.totalDues) - Number(analytics.overdueCount || 0)) / Number(analytics.totalDues)) * 100) : 0,
      },
    ],
    classWise: [...classMap.entries()].map(([className, amount]) => ({ className, amount })),
    // Fee category is approximated from the due's free-text description — the backend Due row
    // has no dedicated category field.
    feeCategoryBreakdown: [...categoryMap.entries()].map(([method, entry]) => ({
      method,
      amount: entry.amount,
      percent: Math.round((entry.amount / totalCategoryAmount) * 100),
      count: entry.count,
    })),
  }
}

function mapReminderRow(row, fallback = {}) {
  return {
    id: row?.id ?? `RM-${Date.now()}`,
    studentName: row?.students?.full_name ?? row?.dues?.students?.full_name ?? fallback.studentName ?? '',
    reminderType: fallback.template ?? row?.type ?? row?.template ?? '',
    channel: fallback.channel ?? row?.channel ?? '',
    sentBy: row?.sent_by ?? row?.sentBy ?? accountantName(),
    sentTime: row?.created_at ?? row?.sentTime ?? new Date().toISOString(),
    status: row?.status ?? 'delivered',
  }
}

export async function sendReminder(dueId, payload) {
  const { data } = await apiPost(`/dues/${dueId}/reminders`, {
    channel: mapChannelToBackend(payload.channel),
    message: `${payload.template} reminder${payload.studentName ? ` for ${payload.studentName}` : ''}`,
  })
  return mapReminderRow(data, payload)
}

// The backend's /dues/reminders/bulk endpoint filters by classId only, not the arbitrary list of
// due IDs this UI's multi-filter selection produces — so bulk sends loop the single-reminder
// endpoint per due, which is the closest real backend capability available.
export async function sendBulkReminders(payload) {
  const { dueIds = [], template, channel } = payload
  const results = await Promise.allSettled(
    dueIds.map((dueId) => apiPost(`/dues/${dueId}/reminders`, { channel: mapChannelToBackend(channel), message: `${template} reminder` })),
  )
  return results.map((result) =>
    result.status === 'fulfilled'
      ? mapReminderRow(result.value.data, { template, channel })
      : mapReminderRow(null, { template, channel, status: 'failed' }),
  )
}

export async function fetchReminderHistory() {
  const { data } = await apiGet('/dues/reminders/history')
  return (data ?? []).map((row) => mapReminderRow(row))
}

export async function retryReminder(id) {
  const { data } = await apiGet('/dues/reminders/history')
  const entry = (data ?? []).find((row) => row.id === id)
  if (!entry) throw new Error('Reminder not found')
  const dueId = entry.due_id ?? entry.dueId
  if (!dueId) return mapReminderRow(entry)
  const { data: resent } = await apiPost(`/dues/${dueId}/reminders`, { channel: entry.channel ?? 'email', message: 'Reminder retry' })
  return mapReminderRow(resent ?? entry)
}

export async function calculateLateFee(payload) {
  // The real POST /dues/late-fees/calculate endpoint requires a dueId; none of this calculator's
  // call sites (ad-hoc "what-if" entry, and the Overdue Fees quick-apply dialog) pass one through
  // this function's payload, so the mock's formula is kept as a client-side simulation using the
  // configured LATE_FEE_RULES.
  const { originalAmount, daysOverdue, rule } = payload
  let penalty = 0
  if (rule === 'perDay') {
    const chargeable = Math.max(0, daysOverdue - LATE_FEE_RULES.gracePeriodDays)
    penalty = chargeable * LATE_FEE_RULES.perDay
  } else if (rule === 'flat') {
    penalty = daysOverdue > LATE_FEE_RULES.gracePeriodDays ? LATE_FEE_RULES.flatAmount : 0
  } else if (rule === 'percentage') {
    penalty = daysOverdue > LATE_FEE_RULES.gracePeriodDays ? Math.round(originalAmount * (LATE_FEE_RULES.percentage / 100)) : 0
  }
  penalty = Math.min(penalty, LATE_FEE_RULES.maxPenalty)
  return { penalty, netPayable: originalAmount + penalty }
}

export async function applyLateFee(dueId, payload) {
  await apiPost('/dues/late-fees/apply', { dueId, amount: payload.penalty })
  return { id: dueId, lateFee: payload.penalty, penalty: payload.penalty, penaltyStatus: 'applied' }
}

async function findLateFeeCharge(dueId) {
  const { data } = await apiGet('/dues/late-fees/history').catch(() => ({ data: [] }))
  const charges = (data ?? []).filter((row) => (row.due_id ?? row.dueId) === dueId)
  charges.sort((a, b) => new Date(b.created_at ?? b.date ?? 0) - new Date(a.created_at ?? a.date ?? 0))
  return charges[0]
}

export async function waiveLateFee(dueId, payload) {
  const charge = await findLateFeeCharge(dueId)
  if (charge) {
    await apiPatch(`/dues/late-fees/${charge.id}/waive`, { reason: payload.reason })
  }
  return { id: dueId, waiverStatus: payload.mode === 'full' ? 'fully-waived' : 'partially-waived' }
}

export async function approveWaiver(dueId) {
  const charge = await findLateFeeCharge(dueId)
  if (charge) {
    await apiPatch(`/dues/late-fees/${charge.id}/approve-waiver`)
  }
  return { id: dueId, waiverStatus: 'approved', approvedBy: accountantName() }
}

export async function fetchLateFeeHistory() {
  const { data } = await apiGet('/dues/late-fees/history')
  return (data ?? []).map((row) => ({
    id: row.id,
    date: row.created_at ?? row.date,
    studentName: row.students?.full_name ?? row.dues?.students?.full_name ?? '',
    action: row.waived ? 'Penalty Waived' : row.status === 'adjusted' ? 'Penalty Adjusted' : 'Penalty Applied',
    amount: Number(row.amount) || 0,
    updatedBy: row.applied_by ?? row.updatedBy ?? accountantName(),
    remarks: row.reason ?? row.remarks ?? '',
  }))
}

export { REMINDER_TEMPLATES, REMINDER_CHANNELS }
