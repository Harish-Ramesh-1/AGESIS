import { create } from 'zustand'
import { fetchClassesSections } from '../services/schoolManagementService'

export const useClassesSectionsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  rows: [],
  summary: null,

  fetchClassesSections: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const { rows, summary } = await fetchClassesSections()
      set({ status: 'success', rows, summary })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
