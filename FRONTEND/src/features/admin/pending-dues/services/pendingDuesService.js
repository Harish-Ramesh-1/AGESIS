import { apiGet, apiPatch, apiPost } from '../../../../services/apiClient'

function daysBetween(from, to) {
  const diff = new Date(to).setHours(0, 0, 0, 0) - new Date(from).setHours(0, 0, 0, 0)
  return Math.round(diff / 86_400_000)
}

function computeDueStatus(dueDate) {
  const diff = daysBetween(new Date(), dueDate)
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'due-today'
  if (diff <= 7) return 'pending'
  return 'upcoming'
}

function computePriority(daysOverdue, amount) {
  if (daysOverdue > 30 || amount > 60000) return 'critical'
  if (daysOverdue > 20) return 'high'
  if (daysOverdue > 7) return 'medium'
  return 'low'
}

function computeLateFeeFromRule(rule, amountDue, daysOverdue) {
  if (!rule || !rule.active || daysOverdue <= 0) return 0
  const daysLate = Math.max(0, daysOverdue - Number(rule.grace_days || 0))
  if (daysLate <= 0) return 0
  return rule.fee_type === 'percent' ? (Number(amountDue) * Number(rule.amount)) / 100 : Number(rule.amount) || 0
}

/** GET /dues doesn't join guardian contact fields, so build a lookup from /students once per fetch. */
async function getStudentContactMap() {
  const { data } = await apiGet('/students')
  const map = {}
  ;(data || []).forEach((student) => {
    map[student.id] = { guardianName: student.guardian_name, guardianPhone: student.guardian_phone }
  })
  return map
}

async function getLateFeeRule() {
  const { data } = await apiGet('/dues/late-fees/rules')
  return data || null
}

async function fetchDueWithStudent(dueId, studentId) {
  if (!studentId) return null
  try {
    const { data } = await apiGet(`/dues?studentId=${studentId}`)
    return (data || []).find((row) => row.id === dueId) || null
  } catch {
    return null
  }
}

function mapDueRow(row, contactMap = {}, rule = null) {
  const outstandingAmount = Number(row.amount_due || 0) - Number(row.amount_paid || 0)
  const diff = daysBetween(new Date(), row.due_date)
  const daysOverdue = diff < 0 ? Math.abs(diff) : 0
  const contact = contactMap[row.student_id] || {}
  return {
    id: row.id,
    studentName: row.students?.full_name || '—',
    className: row.students?.class_name || '—',
    section: row.students?.section || '—',
    parentName: contact.guardianName || '—',
    parentPhone: contact.guardianPhone || '—',
    // dues has no dedicated fee-category column — "description" is the closest analogue.
    feeCategory: row.description || 'Fee',
    outstandingAmount,
    dueDate: row.due_date,
    status: row.status === 'escalated' ? 'overdue' : computeDueStatus(row.due_date),
    daysRemaining: diff,
    daysOverdue,
    lateFee: computeLateFeeFromRule(rule, row.amount_due, daysOverdue),
    priority: daysOverdue > 0 ? computePriority(daysOverdue, outstandingAmount) : null,
    escalated: row.status === 'escalated',
  }
}

function applyClientFilters(rows, filters = {}) {
  const { query, className, status } = filters
  return rows.filter((row) => {
    if (query) {
      const q = query.toLowerCase()
      const haystack = [row.studentName, row.parentName, row.className, row.section, row.feeCategory].join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    if (className && row.className !== className) return false
    if (status && row.status !== status) return false
    return true
  })
}

export async function fetchDueList(filters = {}) {
  const params = new URLSearchParams()
  if (filters.className) params.set('classId', filters.className)
  const qs = params.toString()
  const [{ data: rows }, contactMap, rule] = await Promise.all([
    apiGet(`/dues${qs ? `?${qs}` : ''}`),
    getStudentContactMap(),
    getLateFeeRule(),
  ])
  const mapped = (rows || []).filter((row) => row.status !== 'paid').map((row) => mapDueRow(row, contactMap, rule))
  return applyClientFilters(mapped, filters)
}

export async function fetchOverdue(filters = {}) {
  const [{ data: rows }, contactMap, rule] = await Promise.all([
    apiGet('/dues/overdue'),
    getStudentContactMap(),
    getLateFeeRule(),
  ])
  const mapped = (rows || []).map((row) => mapDueRow(row, contactMap, rule))
  return applyClientFilters(mapped, filters)
}

export async function escalateAccount(id) {
  const { data } = await apiPatch(`/dues/${id}/escalate`)
  const [contactMap, rule, enriched] = await Promise.all([
    getStudentContactMap(),
    getLateFeeRule(),
    fetchDueWithStudent(data.id, data.student_id),
  ])
  return mapDueRow(enriched || data, contactMap, rule)
}

// ---------------------------------------------------------------------------
// Reminder Campaigns (institution-wide batches, distinct from per-student reminders)
// ---------------------------------------------------------------------------

const CHANNEL_TO_BACKEND = { SMS: 'sms', Email: 'email' }
const BACKEND_CHANNEL_LABEL = { sms: 'SMS', email: 'Email', push: 'Push', all: 'All' }

function mapCampaignChannel(channel) {
  return BACKEND_CHANNEL_LABEL[channel] || channel
}

function mapCampaignStatus(status) {
  // CAMPAIGN_STATUS_LABEL only has scheduled/sent/failed — fold the backend's "cancelled" into "failed".
  return status === 'cancelled' ? 'failed' : status
}

async function getReminderCounts() {
  const { data } = await apiGet('/dues/reminders/history')
  const counts = {}
  ;(data || []).forEach((reminder) => {
    if (reminder.campaign_id) counts[reminder.campaign_id] = (counts[reminder.campaign_id] || 0) + 1
  })
  return counts
}

export async function fetchReminderCampaigns() {
  const [{ data: campaigns }, counts] = await Promise.all([apiGet('/dues/reminders/campaigns'), getReminderCounts()])
  return (campaigns || []).map((row) => ({
    id: row.id,
    audience: row.name || 'Bulk Reminder',
    channel: mapCampaignChannel(row.channel),
    message: row.message_template || '',
    // reminder_campaigns has no recipient-count column — derived by counting matching rows
    // in the reminders history endpoint (capped at its 200 most-recent-row limit).
    sentCount: counts[row.id] || 0,
    sentDate: row.scheduled_at || row.created_at,
    status: mapCampaignStatus(row.status),
  }))
}

export async function createReminderCampaign(payload) {
  // /dues/reminders/bulk only supports a single exact classId filter (no class ranges or
  // "critical priority" tagging) and always sends immediately — there is no backend concept
  // of a future-scheduled or audience-segmented campaign. So every campaign created here
  // broadcasts to all pending/overdue accounts right away; `audience` and `scheduleDate`
  // are preserved for display only and are not honored by the backend.
  const { data } = await apiPost('/dues/reminders/bulk', {
    filters: {},
    channel: CHANNEL_TO_BACKEND[payload.channel] || 'email',
    message: payload.message,
  })
  return {
    id: data.campaignId,
    audience: payload.audience,
    channel: payload.channel,
    message: payload.message,
    sentCount: Number(data.sentCount) || 0,
    sentDate: payload.scheduleDate,
    status: 'sent',
  }
}

// ---------------------------------------------------------------------------
// Late Fee Rules (policy configuration)
// ---------------------------------------------------------------------------

function mapLateFeeRule(row) {
  if (!row) {
    return {
      gracePeriodDays: 0,
      lateFeeType: 'flat',
      flatAmount: 0,
      percentageRate: 0,
      maxPenaltyCap: 0,
      autoApply: false,
      updatedDate: null,
    }
  }
  return {
    gracePeriodDays: Number(row.grace_days) || 0,
    lateFeeType: row.fee_type === 'percent' ? 'percentage' : 'flat',
    flatAmount: row.fee_type === 'flat' ? Number(row.amount) || 0 : 0,
    percentageRate: row.fee_type === 'percent' ? Number(row.amount) || 0 : 0,
    // late_fee_rules has no penalty-cap column, and /late-fees/calculate applies the
    // flat/percent amount uncapped — nothing honest to source this from.
    maxPenaltyCap: 0,
    autoApply: Boolean(row.active),
    updatedDate: row.updated_at ? row.updated_at.slice(0, 10) : null,
  }
}

export async function fetchLateFeeRules() {
  const { data } = await apiGet('/dues/late-fees/rules')
  return mapLateFeeRule(data)
}

export async function updateLateFeeRules(payload) {
  const { data } = await apiPatch('/dues/late-fees/rules', {
    grace_days: Number(payload.gracePeriodDays) || 0,
    fee_type: payload.lateFeeType === 'percentage' ? 'percent' : 'flat',
    amount: payload.lateFeeType === 'percentage' ? Number(payload.percentageRate) || 0 : Number(payload.flatAmount) || 0,
    active: Boolean(payload.autoApply),
  })
  return mapLateFeeRule(data)
}
