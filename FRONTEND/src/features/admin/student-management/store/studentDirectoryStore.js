import { create } from 'zustand'
import { fetchStudentDirectory } from '../services/studentManagementService'

export const useStudentDirectoryStore = create((set, get) => ({
  status: 'idle',
  error: null,
  students: [],
  kpis: null,

  fetchDirectory: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const { students, kpis } = await fetchStudentDirectory()
      set({ status: 'success', students, kpis })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
