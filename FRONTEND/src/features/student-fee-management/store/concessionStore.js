import { create } from 'zustand'
import { addConcession, fetchConcessions } from '../services/studentFeeService'

export const useConcessionStore = create((set, get) => ({
  studentId: null,
  status: 'idle',
  error: null,
  concessions: [],

  fetchConcessions: async (studentId) => {
    if (get().studentId === studentId && get().status === 'success') return
    set({ studentId, status: 'loading', error: null })
    try {
      const concessions = await fetchConcessions(studentId)
      if (get().studentId !== studentId) return
      set({ status: 'success', concessions })
    } catch (error) {
      if (get().studentId !== studentId) return
      set({ status: 'error', error: error.message })
    }
  },

  addConcession: async (payload) => {
    const studentId = get().studentId
    const concessions = await addConcession(studentId, payload)
    set({ concessions })
  },

  updateConcession: (id, patch) =>
    set((state) => ({ concessions: state.concessions.map((item) => (item.id === id ? { ...item, ...patch } : item)) })),

  removeConcession: (id) => set((state) => ({ concessions: state.concessions.filter((item) => item.id !== id) })),
}))
