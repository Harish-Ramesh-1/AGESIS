import { apiGet } from '../../../services/apiClient'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function academicYearFor(dateStr) {
  const date = new Date(dateStr)
  const startYear = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1
  return `${startYear}-${startYear + 1}`
}

function mapStatus(status) {
  return status === 'success' ? 'paid' : status
}

function buildSummary(transactions) {
  const paid = transactions.filter((transaction) => transaction.status === 'paid')
  const pending = transactions.filter((transaction) => transaction.status === 'pending')
  const lastPayment = [...paid].sort((a, b) => new Date(b.date) - new Date(a.date))[0] ?? null

  return {
    totalPaid: paid.reduce((sum, transaction) => sum + transaction.amount, 0),
    totalTransactions: transactions.length,
    pendingAmount: pending.reduce((sum, transaction) => sum + transaction.amount, 0),
    pendingCount: pending.length,
    lastPayment,
  }
}

export async function fetchPaymentHistory() {
  const { data: children } = await apiGet('/students/me/children')
  const student = children?.[0]
  if (!student) return { transactions: [], summary: buildSummary([]) }

  const [{ data: payments }, { data: receipts }, { data: dues }] = await Promise.all([
    apiGet(`/payments?studentId=${student.id}`),
    apiGet('/documents/receipts'),
    apiGet(`/dues?studentId=${student.id}`),
  ])

  const receiptByPayment = new Map((receipts || []).filter((receipt) => receipt.payment_id).map((receipt) => [receipt.payment_id, receipt]))
  const dueById = new Map((dues || []).map((due) => [due.id, due]))

  const transactions = (payments || []).map((payment) => {
    const receipt = receiptByPayment.get(payment.id)
    const due = dueById.get(payment.due_id)
    const date = payment.paid_at || payment.created_at
    const dateObj = new Date(date)
    return {
      id: payment.reference_no,
      receiptNumber: receipt?.receipt_no ?? null,
      // Invoices aren't linked to individual payments in the backend schema.
      invoiceNumber: null,
      date,
      feeCategory: due?.description || 'Fee Payment',
      method: payment.method,
      amount: Number(payment.amount),
      status: mapStatus(payment.status),
      academicYear: academicYearFor(date),
      month: MONTH_NAMES[dateObj.getMonth()],
    }
  })

  return { transactions, summary: buildSummary(transactions) }
}
