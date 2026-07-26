import { create } from 'zustand'

const MOCK_PAYMENTS = {
  annualFee: 110000,
  amountPaid: 72500,
  pendingAmount: 37500,
  nextDueDate: '2026-08-15',
  progressPercent: 66,
  upcomingDue: {
    amount: 18750,
    dueDate: '2026-08-15',
    daysRemaining: 22,
    lateFeeWarning: 'A late fee of ₹500 applies after the due date.',
  },
  transactions: [
    { id: 'TXN-98213', date: '2026-06-02', amount: 25000, method: 'UPI', status: 'success' },
    { id: 'TXN-97650', date: '2026-04-18', amount: 25000, method: 'Card', status: 'success' },
    { id: 'TXN-96410', date: '2026-02-05', amount: 22500, method: 'Net Banking', status: 'success' },
    { id: 'TXN-95120', date: '2025-12-10', amount: 15000, method: 'UPI', status: 'success' },
    { id: 'TXN-94002', date: '2025-10-01', amount: 10000, method: 'Cash', status: 'failed' },
  ],
  feeBreakdown: [
    { category: 'Tuition', amount: 70000 },
    { category: 'Transport', amount: 15000 },
    { category: 'Library', amount: 8000 },
    { category: 'Exam', amount: 10000 },
    { category: 'Miscellaneous', amount: 7000 },
  ],
  monthlyAnalytics: [
    { month: 'Mar', paid: 10000, pending: 0 },
    { month: 'Apr', paid: 15000, pending: 5000 },
    { month: 'May', paid: 12500, pending: 2500 },
    { month: 'Jun', paid: 25000, pending: 0 },
    { month: 'Jul', paid: 10000, pending: 15000 },
    { month: 'Aug', paid: 0, pending: 18750 },
  ],
}

const FETCH_DELAY_MS = 900

export const usePaymentsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  data: null,

  fetchPayments: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      await new Promise((resolve) => setTimeout(resolve, FETCH_DELAY_MS))
      set({ status: 'success', data: MOCK_PAYMENTS })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
