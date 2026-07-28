import { create } from 'zustand'
import { fetchBulkPreviewCount, fetchBulkRunHistory, triggerBulkGeneration } from '../services/invoicesService'

export const useBulkGenerationStore = create((set, get) => ({
  previewStatus: 'idle',
  previewCount: 0,

  isGenerating: false,
  lastRun: null,

  historyStatus: 'idle',
  historyError: null,
  history: [],

  fetchPreview: async (params) => {
    set({ previewStatus: 'loading' })
    try {
      const count = await fetchBulkPreviewCount(params)
      set({ previewStatus: 'success', previewCount: count })
    } catch {
      set({ previewStatus: 'error', previewCount: 0 })
    }
  },

  fetchHistory: async () => {
    if (get().historyStatus === 'loading' || get().historyStatus === 'success') return
    set({ historyStatus: 'loading', historyError: null })
    try {
      const history = await fetchBulkRunHistory()
      set({ historyStatus: 'success', history })
    } catch (error) {
      set({ historyStatus: 'error', historyError: error.message })
    }
  },

  generate: async (payload) => {
    set({ isGenerating: true })
    try {
      const record = await triggerBulkGeneration(payload)
      set((state) => ({ isGenerating: false, lastRun: record, history: [record, ...state.history] }))
      return record
    } catch (error) {
      set({ isGenerating: false })
      throw error
    }
  },
}))
