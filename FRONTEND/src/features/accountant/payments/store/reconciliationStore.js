import { create } from 'zustand'
import { autoReconcile, fetchReconciliation, manualReconcile } from '../services/paymentsService'

export const useReconciliationStore = create((set, get) => ({
  status: 'idle',
  error: null,
  data: null,
  isReconciling: false,

  fetchReconciliation: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const data = await fetchReconciliation()
      set({ status: 'success', data })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  runAutoReconcile: async () => {
    set({ isReconciling: true })
    try {
      const result = await autoReconcile()
      set({ isReconciling: false, status: 'idle' })
      await get().fetchReconciliation()
      return result
    } catch (error) {
      set({ isReconciling: false, error: error.message })
      return null
    }
  },

  resolveMatch: async (payload) => {
    set({ isReconciling: true })
    const result = await manualReconcile(payload)
    set((state) => {
      if (!state.data) return { isReconciling: false }
      return {
        isReconciling: false,
        data: {
          ...state.data,
          unmatched: state.data.unmatched.filter((item) => item.id !== payload.id),
          matched: [...state.data.matched, { ...payload.record, id: payload.id }],
        },
      }
    })
    return result
  },
}))
