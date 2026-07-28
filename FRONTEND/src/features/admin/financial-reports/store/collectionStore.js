import { create } from 'zustand'
import { fetchCollectionAnalytics } from '../services/reportsService'

export const useCollectionStore = create((set) => ({
  status: 'idle',
  error: null,
  data: null,

  fetchCollectionAnalytics: async () => {
    set({ status: 'loading', error: null })
    try {
      const data = await fetchCollectionAnalytics()
      set({ status: 'success', data })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
