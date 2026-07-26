import { create } from 'zustand'
import { fetchPendingVerification, verifyPayment } from '../services/paymentsService'

export const useVerificationStore = create((set, get) => ({
  status: 'idle',
  error: null,
  items: [],
  actioningId: null,

  fetchQueue: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const items = await fetchPendingVerification()
      set({ status: 'success', items })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  retrySync: async (id) => {
    set({ actioningId: id })
    await new Promise((resolve) => setTimeout(resolve, 600))
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, gatewayStatus: 'success' } : item)),
      actioningId: null,
    }))
  },

  verify: async (id, decision) => {
    set({ actioningId: id })
    try {
      const updated = await verifyPayment(id, decision)
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? updated : item)),
        actioningId: null,
      }))
    } catch (error) {
      set({ actioningId: null, error: error.message })
    }
  },
}))
