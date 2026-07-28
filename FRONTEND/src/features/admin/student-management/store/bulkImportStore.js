import { create } from 'zustand'
import { fetchImportHistory } from '../services/studentManagementService'

export const useBulkImportStore = create((set, get) => ({
  status: 'idle',
  error: null,
  history: [],

  fetchHistory: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const history = await fetchImportHistory()
      set({ status: 'success', history })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
