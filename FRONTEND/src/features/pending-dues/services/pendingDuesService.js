const DELAY_MS = 550
const ACCOUNTANT_NAME = 'Kavita Sharma'

function delay(ms = DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function initialsOf(name) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function daysBetween(from, to) {
  const diff = new Date(to).setHours(0, 0, 0, 0) - new Date(from).setHours(0, 0, 0, 0)
  return Math.round(diff / 86_400_000)
}

const TODAY = '2026-07-25'

const RAW_DUES = [
  { id: 'due-1', studentName: 'Aarav Nair', registrationNumber: 'P-12345', className: '8', section: 'B', parentName: 'Rajesh Nair', parentPhone: '+91 90000 11111', feeCategory: 'Tuition Fee', installment: 'Installment 2 of 4', outstandingAmount: 22500, dueDate: '2026-08-02' },
  { id: 'due-2', studentName: 'Kabir Menon', registrationNumber: 'P-10456', className: '10', section: 'C', parentName: 'Prakash Menon', parentPhone: '+91 97400 11298', feeCategory: 'Hostel Fee', installment: 'Installment 1 of 2', outstandingAmount: 31000, dueDate: '2026-07-10' },
  { id: 'due-3', studentName: 'Diya Kulkarni', registrationNumber: 'P-11023', className: '6', section: 'A', parentName: 'Manoj Kulkarni', parentPhone: '+91 98450 12233', feeCategory: 'Tuition Fee', installment: 'Full Balance', outstandingAmount: 38500, dueDate: '2026-07-15' },
  { id: 'due-4', studentName: 'Sanya Kapoor', registrationNumber: 'P-10998', className: '9', section: 'A', parentName: 'Vikram Kapoor', parentPhone: '+91 99000 55667', feeCategory: 'Transport Fee', installment: 'Installment 2 of 2', outstandingAmount: 25500, dueDate: '2026-08-02' },
  { id: 'due-5', studentName: 'Ishita Rao', registrationNumber: 'P-10912', className: '7', section: 'A', parentName: 'Ganesh Rao', parentPhone: '+91 98765 43299', feeCategory: 'Tuition Fee', installment: 'Full Balance', outstandingAmount: 29500, dueDate: '2026-07-25' },
  { id: 'due-6', studentName: 'Yash Kapoor', registrationNumber: 'P-10345', className: '9', section: 'A', parentName: 'Sanjay Kapoor', parentPhone: '+91 98450 12233', feeCategory: 'Hostel Fee', installment: 'Installment 1 of 2', outstandingAmount: 34000, dueDate: '2026-06-20' },
  { id: 'due-7', studentName: 'Reyansh Bhat', registrationNumber: 'P-10654', className: '11', section: 'A', parentName: 'Deepak Bhat', parentPhone: '+91 99870 66554', feeCategory: 'Hostel Fee', installment: 'Full Balance', outstandingAmount: 78000, dueDate: '2026-08-05' },
  { id: 'due-8', studentName: 'Saanvi Joshi', registrationNumber: 'P-10589', className: '6', section: 'B', parentName: 'Ramesh Joshi', parentPhone: '+91 90080 44521', feeCategory: 'Tuition Fee', installment: 'Full Balance', outstandingAmount: 41500, dueDate: '2026-07-05' },
  { id: 'due-9', studentName: 'Arjun Reddy', registrationNumber: 'P-10432', className: '8', section: 'A', parentName: 'Srinivas Reddy', parentPhone: '+91 97400 11298', feeCategory: 'Tuition Fee', installment: 'Installment 2 of 3', outstandingAmount: 55000, dueDate: '2026-06-25' },
  { id: 'due-10', studentName: 'Kiara Shah', registrationNumber: 'P-11089', className: '10', section: 'B', parentName: 'Jayesh Shah', parentPhone: '+91 99000 55667', feeCategory: 'Transport Fee', installment: 'Installment 1 of 2', outstandingAmount: 34000, dueDate: '2026-07-25' },
  { id: 'due-11', studentName: 'Rohan Verma', registrationNumber: 'P-10123', className: '12', section: 'A', parentName: 'Ajay Verma', parentPhone: '+91 90080 22110', feeCategory: 'Examination Fee', installment: 'Full Balance', outstandingAmount: 8500, dueDate: '2026-07-28' },
  { id: 'due-12', studentName: 'Advait Rao', registrationNumber: 'P-11167', className: '7', section: 'C', parentName: 'Vinod Rao', parentPhone: '+91 98765 11223', feeCategory: 'Miscellaneous Fee', installment: 'Full Balance', outstandingAmount: 3200, dueDate: '2026-08-10' },
  { id: 'due-13', studentName: 'Ananya Iyer', registrationNumber: 'P-11145', className: '5', section: 'C', parentName: 'Suresh Iyer', parentPhone: '+91 98765 22110', feeCategory: 'Tuition Fee', installment: 'Installment 1 of 2', outstandingAmount: 33000, dueDate: '2026-07-20' },
  { id: 'due-14', studentName: 'Myra Desai', registrationNumber: 'P-11201', className: '4', section: 'B', parentName: 'Nikhil Desai', parentPhone: '+91 98200 99887', feeCategory: 'Library Fee', installment: 'Full Balance', outstandingAmount: 1500, dueDate: '2026-08-15' },
  { id: 'due-15', studentName: 'Aditya Kulkarni', registrationNumber: 'P-10234', className: '10', section: 'A', parentName: 'Rakesh Kulkarni', parentPhone: '+91 98200 11223', feeCategory: 'Laboratory Fee', installment: 'Full Balance', outstandingAmount: 4500, dueDate: '2026-07-26' },
  { id: 'due-16', studentName: 'Ishaan Verma', registrationNumber: 'P-10871', className: '8', section: 'B', parentName: 'Sunil Verma', parentPhone: '+91 90080 44521', feeCategory: 'Tuition Fee', installment: 'Installment 3 of 4', outstandingAmount: 24500, dueDate: '2026-06-30' },
  { id: 'due-17', studentName: 'Vihaan Pillai', registrationNumber: 'P-10777', className: '9', section: 'B', parentName: 'Anand Pillai', parentPhone: '+91 90000 33445', feeCategory: 'Sports Fee', installment: 'Full Balance', outstandingAmount: 3000, dueDate: '2026-07-31' },
  { id: 'due-18', studentName: 'Meera Pillai', registrationNumber: 'P-10765', className: '11', section: 'B', parentName: 'Girish Pillai', parentPhone: '+91 90000 44556', feeCategory: 'Tuition Fee', installment: 'Installment 2 of 2', outstandingAmount: 15000, dueDate: '2026-08-08' },
]

function computeStatus(dueDate) {
  const diff = daysBetween(TODAY, dueDate)
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'due-today'
  if (diff <= 7) return 'pending'
  return 'upcoming'
}

function computeLateFee(daysOverdue) {
  if (daysOverdue <= 0) return 0
  const perDay = 100
  const grace = 5
  const chargeable = Math.max(0, daysOverdue - grace)
  return Math.min(5000, chargeable * perDay)
}

function computePriority(daysOverdue, amount) {
  if (daysOverdue > 30 || amount > 60000) return 'critical'
  if (daysOverdue > 20) return 'high'
  if (daysOverdue > 7) return 'medium'
  return 'low'
}

export const DUE_LIST = RAW_DUES.map((row, index) => {
  const status = computeStatus(row.dueDate)
  const daysRemaining = daysBetween(TODAY, row.dueDate)
  const daysOverdue = status === 'overdue' ? Math.abs(daysRemaining) : 0
  const lateFee = computeLateFee(daysOverdue)
  return {
    ...row,
    studentId: `std-${index + 1}`,
    avatarInitials: initialsOf(row.studentName),
    status,
    daysRemaining,
    daysOverdue,
    lateFee,
    penalty: lateFee,
    priority: status === 'overdue' ? computePriority(daysOverdue, row.outstandingAmount) : null,
    academicYear: '2025-2026',
    penaltyStatus: lateFee > 0 ? 'pending' : 'none',
    waiverStatus: 'none',
    approvedBy: null,
  }
})

const REMINDER_TEMPLATES = [
  { key: 'upcoming-due', label: 'Upcoming Due', tone: 'A friendly heads-up that a fee installment is due soon.' },
  { key: 'overdue', label: 'Overdue', tone: 'A notice that a payment deadline has passed.' },
  { key: 'final', label: 'Final Reminder', tone: 'A firm final notice before escalation.' },
  { key: 'friendly', label: 'Friendly Reminder', tone: 'A warm, low-pressure nudge.' },
  { key: 'urgent', label: 'Urgent Notice', tone: 'An urgent notice for critically overdue accounts.' },
]

const REMINDER_CHANNELS = ['Email', 'SMS', 'Push Notification', 'WhatsApp']

let reminderCounter = 4200
const REMINDER_HISTORY = [
  { id: 'RM-4180', studentName: 'Kabir Menon', reminderType: 'Overdue', channel: 'Email', sentBy: ACCOUNTANT_NAME, sentTime: '2026-07-24T09:00:00Z', status: 'delivered' },
  { id: 'RM-4179', studentName: 'Diya Kulkarni', reminderType: 'Final Reminder', channel: 'SMS', sentBy: ACCOUNTANT_NAME, sentTime: '2026-07-24T09:00:00Z', status: 'delivered' },
  { id: 'RM-4178', studentName: 'Yash Kapoor', reminderType: 'Urgent Notice', channel: 'WhatsApp', sentBy: ACCOUNTANT_NAME, sentTime: '2026-07-23T16:30:00Z', status: 'failed' },
  { id: 'RM-4177', studentName: 'Saanvi Joshi', reminderType: 'Overdue', channel: 'Email', sentBy: ACCOUNTANT_NAME, sentTime: '2026-07-23T16:30:00Z', status: 'delivered' },
  { id: 'RM-4176', studentName: 'Arjun Reddy', reminderType: 'Final Reminder', channel: 'Push Notification', sentBy: ACCOUNTANT_NAME, sentTime: '2026-07-22T10:15:00Z', status: 'delivered' },
  { id: 'RM-4175', studentName: 'Ishita Rao', reminderType: 'Upcoming Due', channel: 'Email', sentBy: 'System (Automated)', sentTime: '2026-07-22T08:00:00Z', status: 'delivered' },
  { id: 'RM-4174', studentName: 'Sanya Kapoor', reminderType: 'Upcoming Due', channel: 'SMS', sentBy: 'System (Automated)', sentTime: '2026-07-21T08:00:00Z', status: 'failed' },
  { id: 'RM-4173', studentName: 'Ananya Iyer', reminderType: 'Friendly Reminder', channel: 'WhatsApp', sentBy: ACCOUNTANT_NAME, sentTime: '2026-07-20T11:45:00Z', status: 'delivered' },
  { id: 'RM-4172', studentName: 'Reyansh Bhat', reminderType: 'Upcoming Due', channel: 'Email', sentBy: 'System (Automated)', sentTime: '2026-07-19T08:00:00Z', status: 'delivered' },
  { id: 'RM-4171', studentName: 'Ishaan Verma', reminderType: 'Overdue', channel: 'SMS', sentBy: ACCOUNTANT_NAME, sentTime: '2026-07-18T14:20:00Z', status: 'delivered' },
]

export const LATE_FEE_RULES = {
  perDay: 100,
  flatAmount: 500,
  percentage: 2,
  maxPenalty: 5000,
  gracePeriodDays: 5,
  activeMode: 'perDay',
}

let penaltyHistoryCounter = 900
const PENALTY_HISTORY = [
  { id: 'PH-895', date: '2026-07-20T10:00:00Z', studentName: 'Yash Kapoor', action: 'Penalty Applied', amount: 2500, updatedBy: ACCOUNTANT_NAME, remarks: 'Auto-calculated per-day rule' },
  { id: 'PH-896', date: '2026-07-18T09:30:00Z', studentName: 'Arjun Reddy', action: 'Penalty Waived', amount: 1800, updatedBy: ACCOUNTANT_NAME, remarks: 'Parent showed proof of bank delay' },
  { id: 'PH-897', date: '2026-07-15T15:10:00Z', studentName: 'Kabir Menon', action: 'Penalty Applied', amount: 500, updatedBy: ACCOUNTANT_NAME, remarks: 'Grace period expired' },
  { id: 'PH-898', date: '2026-07-10T11:00:00Z', studentName: 'Saanvi Joshi', action: 'Penalty Adjusted', amount: 2075, updatedBy: ACCOUNTANT_NAME, remarks: 'Recalculated after partial payment' },
  { id: 'PH-899', date: '2026-07-05T09:00:00Z', studentName: 'Diya Kulkarni', action: 'Penalty Applied', amount: 1500, updatedBy: ACCOUNTANT_NAME, remarks: 'Overdue beyond grace period' },
]

function buildAnalytics() {
  const outstandingTrend = [
    { label: 'Mar', amount: 4820000 },
    { label: 'Apr', amount: 3950000 },
    { label: 'May', amount: 3420000 },
    { label: 'Jun', amount: 3180000 },
    { label: 'Jul', amount: 2960000 },
  ]
  const ageingBuckets = [
    { bucket: '0-30 days', amount: 145000, count: 5 },
    { bucket: '31-60 days', amount: 96000, count: 3 },
    { bucket: '61-90 days', amount: 41500, count: 1 },
    { bucket: '90+ days', amount: 0, count: 0 },
  ]
  const recoveryTrend = [
    { label: 'Mar', recoveryPercent: 78 },
    { label: 'Apr', recoveryPercent: 82 },
    { label: 'May', recoveryPercent: 85 },
    { label: 'Jun', recoveryPercent: 88 },
    { label: 'Jul', recoveryPercent: 91 },
  ]
  const classWise = [
    { className: 'Class 6', amount: 80000 },
    { className: 'Class 7', amount: 32700 },
    { className: 'Class 8', amount: 102000 },
    { className: 'Class 9', amount: 92500 },
    { className: 'Class 10', amount: 65000 },
    { className: 'Class 11', amount: 93000 },
  ]
  const feeCategoryBreakdown = [
    { method: 'Tuition Fee', amount: 244500, percent: 46, count: 8 },
    { method: 'Hostel Fee', amount: 143000, percent: 27, count: 3 },
    { method: 'Transport Fee', amount: 59500, percent: 11, count: 2 },
    { method: 'Examination Fee', amount: 8500, percent: 2, count: 1 },
    { method: 'Other', amount: 78700, percent: 14, count: 4 },
  ]
  return { outstandingTrend, ageingBuckets, recoveryTrend, classWise, feeCategoryBreakdown }
}

function applyFilters(rows, filters = {}) {
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
  await delay()
  return applyFilters(DUE_LIST, filters)
}

export async function fetchOverdue(filters) {
  await delay()
  return applyFilters(DUE_LIST.filter((row) => row.status === 'overdue'), filters)
}

export async function fetchStudentDue(id) {
  await delay(300)
  const record = DUE_LIST.find((row) => row.studentId === id || row.id === id)
  if (!record) throw new Error('Student due record not found')
  return record
}

export async function fetchAnalytics() {
  await delay(650)
  return buildAnalytics()
}

export async function sendReminder(dueId, payload) {
  await delay(600)
  const record = DUE_LIST.find((row) => row.id === dueId)
  reminderCounter += 1
  const entry = {
    id: `RM-${reminderCounter}`,
    studentName: record?.studentName ?? payload.studentName,
    reminderType: payload.template,
    channel: payload.channel,
    sentBy: ACCOUNTANT_NAME,
    sentTime: new Date().toISOString(),
    status: 'delivered',
  }
  REMINDER_HISTORY.unshift(entry)
  return entry
}

export async function sendBulkReminders(payload) {
  await delay(1000)
  const entries = payload.dueIds.map((dueId) => {
    const record = DUE_LIST.find((row) => row.id === dueId)
    reminderCounter += 1
    return {
      id: `RM-${reminderCounter}`,
      studentName: record?.studentName ?? 'Unknown Student',
      reminderType: payload.template,
      channel: payload.channel,
      sentBy: ACCOUNTANT_NAME,
      sentTime: new Date().toISOString(),
      status: Math.random() > 0.15 ? 'delivered' : 'failed',
    }
  })
  entries.forEach((entry) => REMINDER_HISTORY.unshift(entry))
  return entries
}

export async function fetchReminderHistory() {
  await delay()
  return REMINDER_HISTORY
}

export async function retryReminder(id) {
  await delay(500)
  const entry = REMINDER_HISTORY.find((item) => item.id === id)
  if (!entry) throw new Error('Reminder not found')
  entry.status = 'delivered'
  entry.sentTime = new Date().toISOString()
  return entry
}

export async function calculateLateFee(payload) {
  await delay(300)
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
  await delay(700)
  const record = DUE_LIST.find((row) => row.id === dueId)
  if (!record) throw new Error('Due record not found')
  record.lateFee = payload.penalty
  record.penalty = payload.penalty
  record.penaltyStatus = 'applied'
  penaltyHistoryCounter += 1
  const entry = { id: `PH-${penaltyHistoryCounter}`, date: new Date().toISOString(), studentName: record.studentName, action: 'Penalty Applied', amount: payload.penalty, updatedBy: ACCOUNTANT_NAME, remarks: payload.remarks ?? '' }
  PENALTY_HISTORY.unshift(entry)
  return record
}

export async function waiveLateFee(dueId, payload) {
  await delay(700)
  const record = DUE_LIST.find((row) => row.id === dueId)
  if (!record) throw new Error('Due record not found')
  const waivedAmount = payload.mode === 'full' ? record.lateFee : Math.min(payload.amount, record.lateFee)
  record.lateFee = Math.max(0, record.lateFee - waivedAmount)
  record.penalty = record.lateFee
  record.penaltyStatus = record.lateFee === 0 ? 'waived' : 'applied'
  record.waiverStatus = payload.mode === 'full' ? 'fully-waived' : 'partially-waived'
  record.approvedBy = ACCOUNTANT_NAME
  penaltyHistoryCounter += 1
  const entry = { id: `PH-${penaltyHistoryCounter}`, date: new Date().toISOString(), studentName: record.studentName, action: 'Penalty Waived', amount: waivedAmount, updatedBy: ACCOUNTANT_NAME, remarks: payload.reason ?? '' }
  PENALTY_HISTORY.unshift(entry)
  return record
}

export async function approveWaiver(dueId) {
  await delay(500)
  const record = DUE_LIST.find((row) => row.id === dueId)
  if (!record) throw new Error('Due record not found')
  record.waiverStatus = 'approved'
  record.approvedBy = ACCOUNTANT_NAME
  return record
}

export async function fetchLateFeeHistory() {
  await delay()
  return PENALTY_HISTORY
}

export { REMINDER_TEMPLATES, REMINDER_CHANNELS }
