import { create } from 'zustand'
import { escalateFailedTransaction, fetchFailedTransactions, retryFailedTransaction } from '../services/paymentsService'

export const useFailedTransactionsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  items: [],
  actioningId: null,

  fetchFailed: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const items = await fetchFailedTransactions()
      set({ status: 'success', items })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  retry: async (id) => {
    set({ actioningId: id })
    try {
      const updated = await retryFailedTransaction(id)
      set((state) => ({ items: state.items.map((item) => (item.id === id ? updated : item)), actioningId: null }))
      return updated.retrySucceeded
    } catch (error) {
      set({ actioningId: null, error: error.message })
      return false
    }
  },

  escalate: async (id) => {
    set({ actioningId: id })
    try {
      const updated = await escalateFailedTransaction(id)
      set((state) => ({ items: state.items.map((item) => (item.id === id ? updated : item)), actioningId: null }))
    } catch (error) {
      set({ actioningId: null, error: error.message })
    }
  },
}))
