import { create } from 'zustand'
import { apiGet } from '../services/apiClient'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

async function getPrimaryStudent() {
  const { data: children } = await apiGet('/students/me/children')
  const student = children?.[0]
  if (!student) throw new Error('No student profile is linked to this account yet.')
  return student
}

function buildMonthlyAnalytics(dues) {
  const now = new Date()
  const months = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ key: `${date.getFullYear()}-${date.getMonth()}`, month: MONTH_LABELS[date.getMonth()], paid: 0, pending: 0 })
  }
  const byKey = new Map(months.map((entry) => [entry.key, entry]))

  ;(dues || []).forEach((due) => {
    if (!due.due_date) return
    const date = new Date(due.due_date)
    const bucket = byKey.get(`${date.getFullYear()}-${date.getMonth()}`)
    if (!bucket) return
    bucket.paid += Number(due.amount_paid || 0)
    bucket.pending += Math.max(Number(due.amount_due || 0) - Number(due.amount_paid || 0), 0)
  })

  return months.map(({ month, paid, pending }) => ({ month, paid, pending }))
}

export const usePaymentsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  data: null,

  fetchPayments: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const student = await getPrimaryStudent()

      const [{ data: assignment }, { data: dues }, { data: payments }, { data: lateFeeRule }] = await Promise.all([
        apiGet(`/students/${student.id}/fee-structure`),
        apiGet(`/dues?studentId=${student.id}`),
        apiGet(`/payments?studentId=${student.id}`),
        apiGet('/dues/late-fees/rules'),
      ])

      const annualFee = Number(assignment?.total_amount || 0)
      const amountPaid = (dues || []).reduce((sum, due) => sum + Number(due.amount_paid || 0), 0)
      const pendingAmount = Math.max(annualFee - amountPaid, 0)

      const upcoming = (dues || [])
        .filter((due) => due.status !== 'paid')
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0]

      const daysRemaining = upcoming
        ? Math.ceil((new Date(upcoming.due_date).getTime() - Date.now()) / 86400000)
        : 0

      const lateFeeWarning = lateFeeRule
        ? `A late fee of ₹${Number(lateFeeRule.amount || 0)} applies after ${lateFeeRule.grace_days ?? 7} days past the due date.`
        : 'Late fees may apply after the due date.'

      const upcomingDue = upcoming
        ? {
            amount: Number(upcoming.amount_due) - Number(upcoming.amount_paid),
            dueDate: upcoming.due_date,
            daysRemaining,
            lateFeeWarning,
          }
        : {
            amount: 0,
            dueDate: new Date().toISOString().slice(0, 10),
            daysRemaining: 0,
            lateFeeWarning: 'All dues are settled — no upcoming payments.',
          }

      set({
        status: 'success',
        data: {
          annualFee,
          amountPaid,
          pendingAmount,
          nextDueDate: upcomingDue.dueDate,
          progressPercent: annualFee > 0 ? Math.round((amountPaid / annualFee) * 100) : 0,
          upcomingDue,
          transactions: (payments || []).map((payment) => ({
            id: payment.reference_no,
            date: payment.paid_at || payment.created_at,
            amount: Number(payment.amount),
            method: payment.method,
            status: payment.status === 'success' ? 'success' : 'failed',
          })),
          feeBreakdown: (assignment?.components || []).map((component) => ({
            category: component.category,
            amount: Number(component.amount || 0),
          })),
          monthlyAnalytics: buildMonthlyAnalytics(dues),
        },
      })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
