import { create } from 'zustand'
import { createAssignmentBatch, fetchAssignmentBatches, previewAssignment } from '../services/feeStructureService'

export const useAssignFeesStore = create((set, get) => ({
  status: 'idle',
  error: null,
  batches: [],

  previewStatus: 'idle',
  previewCount: null,

  isAssigning: false,

  fetchBatches: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const batches = await fetchAssignmentBatches()
      set({ status: 'success', batches })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  runPreview: async (payload) => {
    set({ previewStatus: 'loading' })
    try {
      const previewCount = await previewAssignment(payload)
      set({ previewStatus: 'success', previewCount })
    } catch (error) {
      set({ previewStatus: 'error', previewCount: null, error: error.message })
    }
  },

  clearPreview: () => set({ previewStatus: 'idle', previewCount: null }),

  assign: async (payload) => {
    set({ isAssigning: true })
    try {
      const batch = await createAssignmentBatch(payload)
      set((state) => ({ batches: [batch, ...state.batches], isAssigning: false, previewStatus: 'idle', previewCount: null }))
      return batch
    } catch (error) {
      set({ isAssigning: false, error: error.message })
      throw error
    }
  },
}))
