import { create } from 'zustand'
import { createFeeStructure, fetchFeeStructures, updateFeeStructureStatus } from '../services/feeConfigService'

export const useFeeStructureConfigStore = create((set, get) => ({
  status: 'idle',
  error: null,
  structures: [],
  isSaving: false,

  fetchStructures: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const structures = await fetchFeeStructures()
      set({ status: 'success', structures })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  addStructure: async (payload) => {
    set({ isSaving: true })
    try {
      const structure = await createFeeStructure(payload)
      set((state) => ({ structures: [structure, ...state.structures], isSaving: false }))
      return structure
    } catch (error) {
      set({ isSaving: false, error: error.message })
      throw error
    }
  },

  setStructureStatus: async (id, status) => {
    try {
      const structure = await updateFeeStructureStatus(id, status)
      set((state) => ({ structures: state.structures.map((item) => (item.id === id ? structure : item)) }))
    } catch (error) {
      set({ error: error.message })
    }
  },
}))
