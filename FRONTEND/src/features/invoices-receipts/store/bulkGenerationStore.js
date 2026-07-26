import { create } from 'zustand'
import { BULK_CANDIDATES, generateBulkInvoices } from '../services/documentsService'

export const useBulkGenerationStore = create((set, get) => ({
  candidates: BULK_CANDIDATES,
  selectedIds: new Set(),

  isGenerating: false,
  progress: 0,
  results: [],
  generatedToday: 0,

  toggleSelect: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { selectedIds: next }
    }),

  selectAll: (ids) => set({ selectedIds: new Set(ids) }),
  clearSelection: () => set({ selectedIds: new Set() }),

  generate: async () => {
    const candidates = get().candidates.filter((item) => get().selectedIds.has(item.id))
    set({ isGenerating: true, progress: 0, results: [] })

    const steps = candidates.length
    for (let index = 0; index < steps; index += 1) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 250))
      set({ progress: Math.round(((index + 1) / steps) * 100) })
    }

    const results = await generateBulkInvoices({ candidates })
    set((state) => ({
      isGenerating: false,
      progress: 100,
      results,
      generatedToday: state.generatedToday + results.filter((item) => item.success).length,
    }))
    return results
  },

  retryFailed: async () => {
    const failedCandidateIds = get().results.filter((item) => !item.success).map((item) => item.candidateId)
    const candidates = get().candidates.filter((item) => failedCandidateIds.includes(item.id))
    if (candidates.length === 0) return
    set({ isGenerating: true })
    const retryResults = await generateBulkInvoices({ candidates })
    set((state) => ({
      isGenerating: false,
      results: state.results.map((item) => retryResults.find((r) => r.candidateId === item.candidateId) ?? item),
      generatedToday: state.generatedToday + retryResults.filter((item) => item.success).length,
    }))
  },
}))
