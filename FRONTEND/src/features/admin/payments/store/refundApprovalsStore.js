import { create } from 'zustand'
import { decideRefundApproval, fetchRefundApprovals } from '../services/paymentsService'

export const useRefundApprovalsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  requests: [],
  actioningId: null,

  fetchRequests: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const requests = await fetchRefundApprovals()
      set({ status: 'success', requests })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  decide: async (id, decision) => {
    set({ actioningId: id })
    try {
      const updated = await decideRefundApproval(id, decision)
      set((state) => ({ requests: state.requests.map((item) => (item.id === id ? updated : item)), actioningId: null }))
    } catch (error) {
      set({ actioningId: null, error: error.message })
    }
  },
}))
