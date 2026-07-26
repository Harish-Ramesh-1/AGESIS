import { create } from 'zustand'
import { fetchStudentDue } from '../services/pendingDuesService'

export const useDueStudentStore = create((set) => ({
  status: 'idle',
  error: null,
  student: null,

  openStudent: async (id) => {
    set({ status: 'loading', error: null, student: null })
    try {
      const student = await fetchStudentDue(id)
      set({ status: 'success', student })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  closeStudent: () => set({ student: null, status: 'idle' }),
}))
