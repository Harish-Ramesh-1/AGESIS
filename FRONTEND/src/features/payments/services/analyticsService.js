import { apiGet } from '../../../services/apiClient'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const METHOD_LABELS = {
  upi: 'UPI',
  'credit-card': 'Credit Card',
  'debit-card': 'Debit Card',
  netbanking: 'Net Banking',
  wallet: 'Wallet',
  cash: 'Cash',
  razorpay: 'Razorpay',
}

function formatMethodLabel(method) {
  return METHOD_LABELS[method] || method?.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) || 'Other'
}

async function getPrimaryStudentId() {
  const { data: children } = await apiGet('/students/me/children')
  const student = children?.[0]
  if (!student) throw new Error('No student profile is linked to this account yet.')
  return student.id
}

function buildMonthlyTrend(payments) {
  const now = new Date()
  const months = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ key: `${date.getFullYear()}-${date.getMonth()}`, month: MONTH_LABELS[date.getMonth()], paid: 0 })
  }
  const byKey = new Map(months.map((entry) => [entry.key, entry]))

  payments.forEach((payment) => {
    if (payment.status !== 'success' || !payment.paid_at) return
    const date = new Date(payment.paid_at)
    const bucket = byKey.get(`${date.getFullYear()}-${date.getMonth()}`)
    if (bucket) bucket.paid += Number(payment.amount)
  })

  return months.map(({ month, paid }) => ({ month, paid }))
}

function buildMethodDistribution(payments) {
  const totals = payments
    .filter((payment) => payment.status === 'success')
    .reduce((acc, payment) => {
      const label = formatMethodLabel(payment.method)
      acc[label] = (acc[label] || 0) + Number(payment.amount)
      return acc
    }, {})
  return Object.entries(totals).map(([method, amount]) => ({ method, amount }))
}

function buildAnnualSummary(payments) {
  const successful = payments
    .filter((payment) => payment.status === 'success' && payment.paid_at)
    .sort((a, b) => new Date(a.paid_at) - new Date(b.paid_at))

  const totalPaid = successful.reduce((sum, payment) => sum + Number(payment.amount), 0)
  const averagePayment = successful.length > 0 ? Math.round(totalPaid / successful.length) : 0

  let paymentFrequency = 'Not enough data yet'
  if (successful.length > 1) {
    const spanDays =
      (new Date(successful[successful.length - 1].paid_at).getTime() - new Date(successful[0].paid_at).getTime()) /
      86400000
    const avgGapDays = Math.round(spanDays / (successful.length - 1))
    paymentFrequency = avgGapDays >= 10 ? `Every ${Math.round(avgGapDays / 7)} weeks` : `Every ${avgGapDays} days`
  }

  return { totalPaid, averagePayment, paymentFrequency }
}

export async function fetchAnalytics() {
  const studentId = await getPrimaryStudentId()
  const { data: payments } = await apiGet(`/payments?studentId=${studentId}`)
  const rows = payments || []

  return {
    monthlyTrend: buildMonthlyTrend(rows),
    methodDistribution: buildMethodDistribution(rows),
    annualSummary: buildAnnualSummary(rows),
  }
}
