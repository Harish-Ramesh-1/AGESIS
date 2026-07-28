import { create } from 'zustand'
import { addAcademicYear, fetchAcademicYears } from '../services/schoolManagementService'

export const useAcademicYearsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  years: [],

  fetchYears: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const years = await fetchAcademicYears()
      set({ status: 'success', years })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  addYear: async (nextYear) => {
    try {
      const years = await addAcademicYear(nextYear)
      set({ years })
    } catch (error) {
      set({ error: error.message })
    }
  },
}))
