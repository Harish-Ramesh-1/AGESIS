import { create } from 'zustand'
import { approveAdjustment, fetchAdjustmentRequests, rejectAdjustment } from '../services/feeStructureService'

export const useFeeAdjustmentsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  requests: [],
  actioningId: null,

  fetchRequests: async (filters) => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const requests = await fetchAdjustmentRequests(filters)
      set({ status: 'success', requests })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  approve: async (id) => {
    set({ actioningId: id })
    try {
      const request = await approveAdjustment(id)
      set((state) => ({ requests: state.requests.map((item) => (item.id === id ? request : item)), actioningId: null }))
    } catch (error) {
      set({ actioningId: null, error: error.message })
    }
  },

  reject: async (id) => {
    set({ actioningId: id })
    try {
      const request = await rejectAdjustment(id)
      set((state) => ({ requests: state.requests.map((item) => (item.id === id ? request : item)), actioningId: null }))
    } catch (error) {
      set({ actioningId: null, error: error.message })
    }
  },
}))
