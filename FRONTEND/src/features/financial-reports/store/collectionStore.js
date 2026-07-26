import { create } from 'zustand'
import { fetchCollectionAnalytics } from '../services/reportsService'

export const useCollectionStore = create((set, get) => ({
  status: 'idle',
  error: null,
  data: null,

  fetchCollectionAnalytics: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const data = await fetchCollectionAnalytics()
      set({ status: 'success', data })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
