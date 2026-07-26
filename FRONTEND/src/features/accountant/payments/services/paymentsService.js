const DELAY_MS = 550
const ACCOUNTANT_NAME = 'Kavita Sharma'

function delay(ms = DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const PAYMENT_METHODS = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cheque', 'Demand Draft', 'Wallet']

const ONLINE_METHODS = new Set(['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'])

const MOCK_STUDENTS = [
  {
    id: 'std-1', name: 'Aarav Nair', registrationNumber: 'P-12345', admissionNumber: 'ADM-2019-0456', className: '8', section: 'B', parentName: 'Rajesh Nair', parentPhone: '+91 90000 11111',
    outstanding: { totalDue: 45000, components: [{ label: 'Tuition Fee', amount: 30000 }, { label: 'Transport Fee', amount: 15000 }], installments: [
      { id: 'std-1-i1', label: 'Installment 1', amount: 22500, dueDate: '2026-07-28', status: 'pending' },
      { id: 'std-1-i2', label: 'Installment 2', amount: 22500, dueDate: '2026-09-28', status: 'pending' },
    ] },
  },
  {
    id: 'std-2', name: 'Kabir Menon', registrationNumber: 'P-10456', admissionNumber: 'ADM-2017-0198', className: '10', section: 'C', parentName: 'Prakash Menon', parentPhone: '+91 97400 11298',
    outstanding: { totalDue: 62000, components: [{ label: 'Tuition Fee', amount: 45000 }, { label: 'Hostel Fee', amount: 17000 }], installments: [
      { id: 'std-2-i1', label: 'Installment 1', amount: 31000, dueDate: '2026-07-10', status: 'overdue' },
      { id: 'std-2-i2', label: 'Installment 2', amount: 31000, dueDate: '2026-09-10', status: 'pending' },
    ] },
  },
  {
    id: 'std-3', name: 'Diya Kulkarni', registrationNumber: 'P-11023', admissionNumber: 'ADM-2021-0567', className: '6', section: 'A', parentName: 'Manoj Kulkarni', parentPhone: '+91 98450 12233',
    outstanding: { totalDue: 38500, components: [{ label: 'Tuition Fee', amount: 38500 }], installments: [
      { id: 'std-3-i1', label: 'Full Balance', amount: 38500, dueDate: '2026-07-15', status: 'overdue' },
    ] },
  },
  {
    id: 'std-4', name: 'Vihaan Pillai', registrationNumber: 'P-10777', admissionNumber: 'ADM-2019-0289', className: '9', section: 'B', parentName: 'Anand Pillai', parentPhone: '+91 90000 33445',
    outstanding: { totalDue: 0, components: [], installments: [] },
  },
  {
    id: 'std-5', name: 'Sanya Kapoor', registrationNumber: 'P-10998', admissionNumber: 'ADM-2020-0345', className: '9', section: 'A', parentName: 'Vikram Kapoor', parentPhone: '+91 99000 55667',
    outstanding: { totalDue: 51000, components: [{ label: 'Tuition Fee', amount: 36000 }, { label: 'Transport Fee', amount: 15000 }], installments: [
      { id: 'std-5-i1', label: 'Installment 1', amount: 25500, dueDate: '2026-08-02', status: 'pending' },
      { id: 'std-5-i2', label: 'Installment 2', amount: 25500, dueDate: '2026-10-02', status: 'pending' },
    ] },
  },
  {
    id: 'std-6', name: 'Ishita Rao', registrationNumber: 'P-10912', admissionNumber: 'ADM-2019-0334', className: '7', section: 'A', parentName: 'Ganesh Rao', parentPhone: '+91 98765 43299',
    outstanding: { totalDue: 29500, components: [{ label: 'Tuition Fee', amount: 29500 }], installments: [
      { id: 'std-6-i1', label: 'Full Balance', amount: 29500, dueDate: '2026-08-10', status: 'pending' },
    ] },
  },
  {
    id: 'std-7', name: 'Yash Kapoor', registrationNumber: 'P-10345', admissionNumber: 'ADM-2017-0145', className: '9', section: 'A', parentName: 'Sanjay Kapoor', parentPhone: '+91 98450 12233',
    outstanding: { totalDue: 68000, components: [{ label: 'Tuition Fee', amount: 51000 }, { label: 'Hostel Fee', amount: 17000 }], installments: [
      { id: 'std-7-i1', label: 'Installment 1', amount: 34000, dueDate: '2026-06-20', status: 'overdue' },
      { id: 'std-7-i2', label: 'Installment 2', amount: 34000, dueDate: '2026-08-20', status: 'pending' },
    ] },
  },
  {
    id: 'std-8', name: 'Meera Pillai', registrationNumber: 'P-10765', admissionNumber: 'ADM-2016-0089', className: '11', section: 'B', parentName: 'Girish Pillai', parentPhone: '+91 90000 44556',
    outstanding: { totalDue: 0, components: [], installments: [] },
  },
]

let historyCounter = 58240
const HISTORY = [
  { id: 'TXN-58231', gatewayReferenceId: 'RZP-9F3A21', receiptNumber: 'RCT-8801', studentId: 'std-1', studentName: 'Aarav Nair', amount: 45000, method: 'UPI', status: 'paid', date: '2026-07-24T09:12:00Z', collectedBy: ACCOUNTANT_NAME },
  { id: 'TXN-58230', gatewayReferenceId: 'RZP-9F3A20', receiptNumber: 'RCT-8800', studentId: 'std-8', studentName: 'Meera Pillai', amount: 62000, method: 'Credit Card', status: 'paid', date: '2026-07-24T09:05:00Z', collectedBy: ACCOUNTANT_NAME },
  { id: 'TXN-58229', gatewayReferenceId: 'RZP-9F3A19', receiptNumber: 'RCT-8799', studentId: 'std-6', studentName: 'Ishita Rao', amount: 29500, method: 'Debit Card', status: 'paid', date: '2026-07-24T08:40:00Z', collectedBy: ACCOUNTANT_NAME },
  { id: 'TXN-58228', gatewayReferenceId: null, receiptNumber: 'RCT-8798', studentId: 'std-5', studentName: 'Sanya Kapoor', amount: 25500, method: 'Cash', status: 'partial', date: '2026-07-23T15:20:00Z', collectedBy: ACCOUNTANT_NAME },
  { id: 'TXN-58227', gatewayReferenceId: 'RZP-9F3A17', receiptNumber: 'RCT-8797', studentId: 'std-4', studentName: 'Vihaan Pillai', amount: 78000, method: 'UPI', status: 'paid', date: '2026-07-23T11:58:00Z', collectedBy: ACCOUNTANT_NAME },
  { id: 'TXN-58226', gatewayReferenceId: null, receiptNumber: 'RCT-8796', studentId: 'std-3', studentName: 'Diya Kulkarni', amount: 12000, method: 'Cheque', status: 'partial', date: '2026-07-22T14:10:00Z', collectedBy: ACCOUNTANT_NAME },
  { id: 'TXN-58225', gatewayReferenceId: 'RZP-9F3A15', receiptNumber: 'RCT-8795', studentId: 'std-2', studentName: 'Kabir Menon', amount: 5000, method: 'UPI', status: 'refunded', date: '2026-07-21T10:05:00Z', collectedBy: ACCOUNTANT_NAME },
  { id: 'TXN-58224', gatewayReferenceId: 'RZP-9F3A14', receiptNumber: 'RCT-8794', studentId: 'std-7', studentName: 'Yash Kapoor', amount: 34000, method: 'Net Banking', status: 'paid', date: '2026-07-20T09:30:00Z', collectedBy: ACCOUNTANT_NAME },
  { id: 'TXN-58223', gatewayReferenceId: null, receiptNumber: 'RCT-8793', studentId: 'std-1', studentName: 'Aarav Nair', amount: 22500, method: 'Demand Draft', status: 'cancelled', date: '2026-07-19T16:45:00Z', collectedBy: ACCOUNTANT_NAME },
  { id: 'TXN-58222', gatewayReferenceId: 'RZP-9F3A12', receiptNumber: 'RCT-8792', studentId: 'std-8', studentName: 'Meera Pillai', amount: 15000, method: 'Wallet', status: 'paid', date: '2026-07-18T12:22:00Z', collectedBy: ACCOUNTANT_NAME },
  { id: 'TXN-58221', gatewayReferenceId: 'RZP-9F3A11', receiptNumber: 'RCT-8791', studentId: 'std-6', studentName: 'Ishita Rao', amount: 29500, method: 'UPI', status: 'paid', date: '2026-07-17T08:55:00Z', collectedBy: ACCOUNTANT_NAME },
  { id: 'TXN-58220', gatewayReferenceId: null, receiptNumber: 'RCT-8790', studentId: 'std-5', studentName: 'Sanya Kapoor', amount: 25500, method: 'Cash', status: 'paid', date: '2026-07-16T13:40:00Z', collectedBy: ACCOUNTANT_NAME },
  { id: 'TXN-58219', gatewayReferenceId: 'RZP-9F3A09', receiptNumber: 'RCT-8789', studentId: 'std-4', studentName: 'Vihaan Pillai', amount: 51000, method: 'Credit Card', status: 'paid', date: '2026-07-15T10:12:00Z', collectedBy: ACCOUNTANT_NAME },
  { id: 'TXN-58218', gatewayReferenceId: 'RZP-9F3A08', receiptNumber: 'RCT-8788', studentId: 'std-2', studentName: 'Kabir Menon', amount: 31000, method: 'Net Banking', status: 'paid', date: '2026-07-12T09:18:00Z', collectedBy: ACCOUNTANT_NAME },
  { id: 'TXN-58217', gatewayReferenceId: 'RZP-9F3A07', receiptNumber: 'RCT-8787', studentId: 'std-3', studentName: 'Diya Kulkarni', amount: 26500, method: 'UPI', status: 'paid', date: '2026-07-08T15:02:00Z', collectedBy: ACCOUNTANT_NAME },
]

const VERIFICATION_QUEUE = [
  { id: 'TXN-59001', gatewayReferenceId: 'RZP-A10E91', studentName: 'Reyansh Bhat', amount: 78000, method: 'UPI', gatewayStatus: 'success', verificationStatus: 'pending', verificationDate: null },
  { id: 'TXN-59002', gatewayReferenceId: 'RZP-A10E92', studentName: 'Arjun Reddy', amount: 55000, method: 'Credit Card', gatewayStatus: 'success', verificationStatus: 'pending', verificationDate: null },
  { id: 'TXN-59003', gatewayReferenceId: 'RZP-A10E93', studentName: 'Saanvi Joshi', amount: 41500, method: 'Net Banking', gatewayStatus: 'success', verificationStatus: 'pending', verificationDate: null },
  { id: 'TXN-59004', gatewayReferenceId: 'RZP-A10E94', studentName: 'Kiara Shah', amount: 34000, method: 'UPI', gatewayStatus: 'pending', verificationStatus: 'pending', verificationDate: null },
  { id: 'TXN-59005', gatewayReferenceId: 'RZP-A10E95', studentName: 'Rohan Verma', amount: 28500, method: 'Wallet', gatewayStatus: 'success', verificationStatus: 'pending', verificationDate: null },
  { id: 'TXN-59006', gatewayReferenceId: 'RZP-A10E96', studentName: 'Advait Rao', amount: 19500, method: 'Debit Card', gatewayStatus: 'success', verificationStatus: 'verified', verificationDate: '2026-07-23T10:00:00Z' },
  { id: 'TXN-59007', gatewayReferenceId: 'RZP-A10E97', studentName: 'Ananya Iyer', amount: 33000, method: 'UPI', gatewayStatus: 'flagged', verificationStatus: 'pending', verificationDate: null },
]

const REFUND_REQUESTS = [
  {
    id: 'RFD-4401', originalTransactionId: 'TXN-58225', studentName: 'Kabir Menon', amount: 5000, reason: 'Duplicate payment made in error', approvalStatus: 'approved', refundMethod: 'Original Payment Method', processedBy: ACCOUNTANT_NAME,
    timeline: [
      { id: 't1', title: 'Refund Requested', date: '2026-07-20T11:00:00Z', description: 'Parent reported duplicate charge' },
      { id: 't2', title: 'Approved', date: '2026-07-21T09:15:00Z', description: `Approved by ${ACCOUNTANT_NAME}` },
      { id: 't3', title: 'Processed', date: '2026-07-21T10:05:00Z', description: 'Refunded to original UPI account' },
    ],
  },
  {
    id: 'RFD-4402', originalTransactionId: 'TXN-58230', studentName: 'Meera Pillai', amount: 15000, reason: 'Student withdrew from optional Sports Academy', approvalStatus: 'pending', refundMethod: 'Bank Transfer', processedBy: null,
    timeline: [{ id: 't1', title: 'Refund Requested', date: '2026-07-24T09:30:00Z', description: 'Withdrawal form submitted by parent' }],
  },
  {
    id: 'RFD-4403', originalTransactionId: 'TXN-58219', studentName: 'Vihaan Pillai', amount: 8000, reason: 'Overpayment against tuition fee', approvalStatus: 'pending', refundMethod: 'Original Payment Method', processedBy: null,
    timeline: [{ id: 't1', title: 'Refund Requested', date: '2026-07-23T14:00:00Z', description: 'Flagged during reconciliation' }],
  },
  {
    id: 'RFD-4404', originalTransactionId: 'TXN-58217', studentName: 'Diya Kulkarni', amount: 26500, reason: 'Admission cancelled before term start', approvalStatus: 'rejected', refundMethod: 'Bank Transfer', processedBy: ACCOUNTANT_NAME,
    timeline: [
      { id: 't1', title: 'Refund Requested', date: '2026-07-10T10:00:00Z', description: 'Cancellation request received' },
      { id: 't2', title: 'Rejected', date: '2026-07-11T09:00:00Z', description: 'Outside the refund policy window' },
    ],
  },
  {
    id: 'RFD-4405', originalTransactionId: 'TXN-58221', studentName: 'Meera Pillai', amount: 15000, reason: 'Wallet payment charged twice by gateway', approvalStatus: 'approved', refundMethod: 'Original Payment Method', processedBy: ACCOUNTANT_NAME,
    timeline: [
      { id: 't1', title: 'Refund Requested', date: '2026-07-18T13:00:00Z', description: 'Gateway double-charge detected' },
      { id: 't2', title: 'Approved', date: '2026-07-18T15:40:00Z', description: `Approved by ${ACCOUNTANT_NAME}` },
      { id: 't3', title: 'Processed', date: '2026-07-19T09:00:00Z', description: 'Refunded to wallet' },
    ],
  },
]

const FAILED_TRANSACTIONS = [
  { id: 'TXN-59101', studentName: 'Rohan Verma', parentPhone: '+91 90080 22110', amount: 28500, gateway: 'Razorpay', method: 'Net Banking', failureReason: 'Bank server timeout', gatewayResponse: 'ERR_GATEWAY_TIMEOUT', retryCount: 1, status: 'failed', date: '2026-07-24T08:52:00Z' },
  { id: 'TXN-59102', studentName: 'Kabir Menon', parentPhone: '+91 97400 11298', amount: 62000, gateway: 'Razorpay', method: 'UPI', failureReason: 'Insufficient balance', gatewayResponse: 'ERR_INSUFFICIENT_FUNDS', retryCount: 0, status: 'failed', date: '2026-07-23T18:30:00Z' },
  { id: 'TXN-59103', studentName: 'Saanvi Joshi', parentPhone: '+91 90080 44521', amount: 41500, gateway: 'Razorpay', method: 'Credit Card', failureReason: 'Card declined by issuing bank', gatewayResponse: 'ERR_CARD_DECLINED', retryCount: 2, status: 'failed', date: '2026-07-22T12:15:00Z' },
  { id: 'TXN-59104', studentName: 'Arjun Reddy', parentPhone: '+91 97400 11298', amount: 55000, gateway: 'Razorpay', method: 'UPI', failureReason: 'Transaction cancelled by user', gatewayResponse: 'ERR_USER_CANCELLED', retryCount: 0, status: 'resolved', date: '2026-07-21T10:00:00Z' },
  { id: 'TXN-59105', studentName: 'Kiara Shah', parentPhone: '+91 99000 55667', amount: 34000, gateway: 'Razorpay', method: 'Wallet', failureReason: 'Wallet balance limit exceeded', gatewayResponse: 'ERR_WALLET_LIMIT', retryCount: 1, status: 'failed', date: '2026-07-20T09:45:00Z' },
  { id: 'TXN-59106', studentName: 'Yash Kapoor', parentPhone: '+91 98450 12233', amount: 34000, gateway: 'Razorpay', method: 'Net Banking', failureReason: 'Bank server timeout', gatewayResponse: 'ERR_GATEWAY_TIMEOUT', retryCount: 3, status: 'failed', date: '2026-07-18T11:20:00Z' },
  { id: 'TXN-59107', studentName: 'Ananya Iyer', parentPhone: '+91 98765 22110', amount: 33000, gateway: 'Razorpay', method: 'Debit Card', failureReason: 'Card declined by issuing bank', gatewayResponse: 'ERR_CARD_DECLINED', retryCount: 0, status: 'resolved', date: '2026-07-16T14:05:00Z' },
]

function buildReconciliation() {
  const gatewayTotal = 2845000
  const ledgerTotal = 2812500
  return {
    gatewaySummary: { total: gatewayTotal, transactionCount: 386, settlementStatus: 'settled' },
    ledgerSummary: { total: ledgerTotal, transactionCount: 381 },
    progressPercent: 96,
    matched: [
      { id: 'RC-1', transactionId: 'TXN-58231', studentName: 'Aarav Nair', gatewayAmount: 45000, ledgerAmount: 45000, date: '2026-07-24T09:12:00Z' },
      { id: 'RC-2', transactionId: 'TXN-58230', studentName: 'Meera Pillai', gatewayAmount: 62000, ledgerAmount: 62000, date: '2026-07-24T09:05:00Z' },
      { id: 'RC-3', transactionId: 'TXN-58227', studentName: 'Vihaan Pillai', gatewayAmount: 78000, ledgerAmount: 78000, date: '2026-07-23T11:58:00Z' },
      { id: 'RC-4', transactionId: 'TXN-58224', studentName: 'Yash Kapoor', gatewayAmount: 34000, ledgerAmount: 34000, date: '2026-07-20T09:30:00Z' },
    ],
    unmatched: [
      { id: 'RC-5', transactionId: 'TXN-58218', studentName: 'Kabir Menon', gatewayAmount: 31000, ledgerAmount: 30500, date: '2026-07-12T09:18:00Z', note: 'Gateway fee deducted before settlement' },
      { id: 'RC-6', transactionId: 'TXN-59201', studentName: 'Unmapped Gateway Entry', gatewayAmount: 12000, ledgerAmount: 0, date: '2026-07-11T10:00:00Z', note: 'No matching ledger entry found' },
    ],
    duplicates: [
      { id: 'RC-7', transactionId: 'TXN-58221', studentName: 'Meera Pillai', gatewayAmount: 15000, ledgerAmount: 15000, date: '2026-07-18T12:22:00Z', note: 'Charged twice by gateway, refund RFD-4405 issued' },
    ],
  }
}

export async function fetchStudentsForPayment(query) {
  await delay(350)
  if (!query) return []
  const q = query.toLowerCase()
  return MOCK_STUDENTS.filter((student) =>
    [student.name, student.registrationNumber, student.admissionNumber, student.parentName].join(' ').toLowerCase().includes(q),
  )
}

export async function fetchStudentOutstanding(studentId) {
  await delay(300)
  const student = MOCK_STUDENTS.find((item) => item.id === studentId)
  if (!student) throw new Error('Student not found')
  return student
}

function recordPayment(payload) {
  const student = MOCK_STUDENTS.find((item) => item.id === payload.studentId)
  historyCounter += 1
  const receiptNumber = `RCT-${8800 + (historyCounter - 58240)}`
  const transactionId = `TXN-${historyCounter}`
  const isOnline = ONLINE_METHODS.has(payload.method)
  const record = {
    id: transactionId,
    gatewayReferenceId: isOnline ? `RZP-${historyCounter.toString(36).toUpperCase()}` : null,
    receiptNumber,
    studentId: student.id,
    studentName: student.name,
    className: `${student.className}-${student.section}`,
    amount: payload.amount,
    method: payload.method,
    status: payload.amount >= student.outstanding.totalDue ? 'paid' : 'partial',
    date: new Date().toISOString(),
    collectedBy: ACCOUNTANT_NAME,
    remarks: payload.remarks ?? '',
  }
  HISTORY.unshift(record)
  student.outstanding.totalDue = Math.max(0, student.outstanding.totalDue - payload.amount)
  if (payload.installmentId) {
    const installment = student.outstanding.installments.find((item) => item.id === payload.installmentId)
    if (installment) installment.status = 'paid'
  }
  return record
}

export async function receivePayment(payload) {
  await delay(900)
  return recordPayment(payload)
}

export async function recordManualPayment(payload) {
  await delay(900)
  return recordPayment(payload)
}

export async function fetchReceipt(id) {
  await delay(300)
  const record = HISTORY.find((item) => item.id === id)
  if (!record) throw new Error('Receipt not found')
  return record
}

export async function fetchPendingVerification() {
  await delay()
  return VERIFICATION_QUEUE
}

export async function verifyPayment(id, decision) {
  await delay(700)
  const record = VERIFICATION_QUEUE.find((item) => item.id === id)
  if (!record) throw new Error('Transaction not found')
  record.verificationStatus = decision === 'approve' ? 'verified' : 'rejected'
  record.verificationDate = new Date().toISOString()
  return record
}

export async function fetchHistory(filters) {
  await delay()
  const { query, method, status, dateFrom, dateTo } = filters ?? {}
  return HISTORY.filter((row) => {
    if (query) {
      const q = query.toLowerCase()
      if (![row.id, row.receiptNumber, row.studentName].join(' ').toLowerCase().includes(q)) return false
    }
    if (method && row.method !== method) return false
    if (status && row.status !== status) return false
    if (dateFrom && row.date < dateFrom) return false
    if (dateTo && row.date > `${dateTo}T23:59:59Z`) return false
    return true
  })
}

export async function fetchRefunds() {
  await delay()
  return REFUND_REQUESTS
}

export async function processRefund(id, action, payload = {}) {
  await delay(800)
  const record = REFUND_REQUESTS.find((item) => item.id === id)
  if (!record) throw new Error('Refund request not found')
  if (action === 'approve') {
    record.approvalStatus = 'approved'
    record.processedBy = ACCOUNTANT_NAME
    record.timeline.push({ id: `t-${Date.now()}`, title: 'Approved', date: new Date().toISOString(), description: `Approved by ${ACCOUNTANT_NAME}` })
  } else if (action === 'reject') {
    record.approvalStatus = 'rejected'
    record.processedBy = ACCOUNTANT_NAME
    record.timeline.push({ id: `t-${Date.now()}`, title: 'Rejected', date: new Date().toISOString(), description: payload.reason ?? 'Rejected by accountant' })
  } else if (action === 'process') {
    record.approvalStatus = 'processed'
    record.timeline.push({ id: `t-${Date.now()}`, title: 'Processed', date: new Date().toISOString(), description: `Refunded via ${record.refundMethod}` })
  }
  return record
}

export async function fetchFailed() {
  await delay()
  return FAILED_TRANSACTIONS
}

export async function retryPayment(id) {
  await delay(900)
  const record = FAILED_TRANSACTIONS.find((item) => item.id === id)
  if (!record) throw new Error('Transaction not found')
  record.retryCount += 1
  const succeeded = record.retryCount >= 2
  if (succeeded) record.status = 'resolved'
  return { ...record, retrySucceeded: succeeded }
}

export async function markResolved(id) {
  await delay(400)
  const record = FAILED_TRANSACTIONS.find((item) => item.id === id)
  if (!record) throw new Error('Transaction not found')
  record.status = 'resolved'
  return record
}

export async function fetchReconciliation() {
  await delay(700)
  return buildReconciliation()
}

export async function autoReconcile() {
  await delay(1000)
  return { matchedCount: 4, message: 'Auto-reconciliation matched 4 additional transactions.' }
}

export async function manualReconcile(payload) {
  await delay(600)
  return { success: true, note: payload.note ?? '' }
}
