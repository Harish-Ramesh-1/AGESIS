import { create } from 'zustand'
import { fetchPaymentHistory } from '../services/paymentHistoryService'

export const usePaymentHistoryStore = create((set, get) => ({
  status: 'idle',
  error: null,
  transactions: [],
  summary: null,

  fetchPaymentHistory: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const { transactions, summary } = await fetchPaymentHistory()
      set({ status: 'success', transactions, summary })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
