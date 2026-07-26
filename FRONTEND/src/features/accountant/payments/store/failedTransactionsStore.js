import { create } from 'zustand'
import { fetchFailed, markResolved, retryPayment } from '../services/paymentsService'

export const useFailedTransactionsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  items: [],
  actioningId: null,

  fetchFailed: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const items = await fetchFailed()
      set({ status: 'success', items })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  retry: async (id) => {
    set({ actioningId: id })
    try {
      const updated = await retryPayment(id)
      set((state) => ({ items: state.items.map((item) => (item.id === id ? updated : item)), actioningId: null }))
      return updated.retrySucceeded
    } catch (error) {
      set({ actioningId: null, error: error.message })
      return false
    }
  },

  resolve: async (id) => {
    set({ actioningId: id })
    try {
      const updated = await markResolved(id)
      set((state) => ({ items: state.items.map((item) => (item.id === id ? updated : item)), actioningId: null }))
    } catch (error) {
      set({ actioningId: null, error: error.message })
    }
  },
}))
