import { create } from 'zustand'
import { fetchRefunds, processRefund } from '../services/paymentsService'

export const useRefundStore = create((set, get) => ({
  status: 'idle',
  error: null,
  requests: [],
  actioningId: null,

  fetchRefunds: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const requests = await fetchRefunds()
      set({ status: 'success', requests })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  actOnRefund: async (id, action, payload) => {
    set({ actioningId: id })
    try {
      const updated = await processRefund(id, action, payload)
      set((state) => ({
        requests: state.requests.map((item) => (item.id === id ? updated : item)),
        actioningId: null,
      }))
    } catch (error) {
      set({ actioningId: null, error: error.message })
    }
  },
}))
