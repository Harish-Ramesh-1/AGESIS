import { create } from 'zustand'
import { decideVerification, fetchVerificationQueue } from '../services/paymentsService'

export const useVerificationStore = create((set, get) => ({
  status: 'idle',
  error: null,
  items: [],
  actioningId: null,

  fetchQueue: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const items = await fetchVerificationQueue()
      set({ status: 'success', items })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  decide: async (id, decision) => {
    set({ actioningId: id })
    try {
      const updated = await decideVerification(id, decision)
      set((state) => ({ items: state.items.map((item) => (item.id === id ? updated : item)), actioningId: null }))
    } catch (error) {
      set({ actioningId: null, error: error.message })
    }
  },
}))
