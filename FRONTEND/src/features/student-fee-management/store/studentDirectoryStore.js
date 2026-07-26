import { create } from 'zustand'
import { fetchStudentById, fetchStudents } from '../services/studentFeeService'

export const useStudentDirectoryStore = create((set, get) => ({
  listStatus: 'idle',
  listError: null,
  students: [],

  selectedStudentId: null,
  detailStatus: 'idle',
  detailError: null,
  selectedStudent: null,

  fetchStudents: async (filters) => {
    set({ listStatus: 'loading', listError: null })
    try {
      const students = await fetchStudents(filters)
      set({ listStatus: 'success', students })
    } catch (error) {
      set({ listStatus: 'error', listError: error.message })
    }
  },

  selectStudent: async (id) => {
    if (get().selectedStudentId === id && get().detailStatus === 'success') return
    set({ selectedStudentId: id, detailStatus: 'loading', detailError: null })
    try {
      const student = await fetchStudentById(id)
      if (get().selectedStudentId !== id) return
      set({ detailStatus: 'success', selectedStudent: student })
    } catch (error) {
      if (get().selectedStudentId !== id) return
      set({ detailStatus: 'error', detailError: error.message })
    }
  },

  clearSelection: () => set({ selectedStudentId: null, selectedStudent: null, detailStatus: 'idle' }),
}))
