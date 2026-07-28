import { create } from 'zustand'
import { fetchOutstandingDues } from '../services/reportsService'

export const useOutstandingStore = create((set) => ({
  status: 'idle',
  error: null,
  data: null,

  fetchOutstandingDues: async () => {
    set({ status: 'loading', error: null })
    try {
      const data = await fetchOutstandingDues()
      set({ status: 'success', data })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
