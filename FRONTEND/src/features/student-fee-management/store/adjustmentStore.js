import { create } from 'zustand'
import { fetchAdjustmentHistory } from '../services/studentFeeService'

export const useAdjustmentStore = create((set, get) => ({
  studentId: null,
  status: 'idle',
  error: null,
  history: [],

  fetchHistory: async (studentId) => {
    set({ studentId, status: 'loading', error: null })
    try {
      const history = await fetchAdjustmentHistory(studentId)
      if (get().studentId !== studentId) return
      set({ status: 'success', history })
    } catch (error) {
      if (get().studentId !== studentId) return
      set({ status: 'error', error: error.message })
    }
  },
}))
