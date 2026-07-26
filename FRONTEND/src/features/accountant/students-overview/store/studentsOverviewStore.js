import { create } from 'zustand'
import { fetchStudentsOverview } from '../services/studentsOverviewService'

export const useStudentsOverviewStore = create((set, get) => ({
  status: 'idle',
  error: null,
  overview: null,

  fetchOverview: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const overview = await fetchStudentsOverview()
      set({ status: 'success', overview })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
