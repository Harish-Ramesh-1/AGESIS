import { create } from 'zustand'
import { fetchExportHistory, requestExport } from '../services/reportsService'

export const useExportStore = create((set) => ({
  historyStatus: 'idle',
  historyError: null,
  history: [],
  isExporting: false,

  fetchHistory: async () => {
    set({ historyStatus: 'loading', historyError: null })
    try {
      const history = await fetchExportHistory()
      set({ historyStatus: 'success', history })
    } catch (error) {
      set({ historyStatus: 'error', historyError: error.message })
    }
  },

  requestExport: async (payload) => {
    set({ isExporting: true })
    try {
      const record = await requestExport(payload)
      set((state) => ({ isExporting: false, history: [record, ...state.history] }))
      return record
    } catch {
      set({ isExporting: false })
      return null
    }
  },
}))
