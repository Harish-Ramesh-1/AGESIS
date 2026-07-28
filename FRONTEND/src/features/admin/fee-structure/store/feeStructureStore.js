import { create } from 'zustand'
import { createFeeStructure, fetchFeeStructures, setFeeStructureStatus } from '../services/feeStructureService'

export const useFeeStructureStore = create((set, get) => ({
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

  setStatus: async (id, status) => {
    try {
      const structure = await setFeeStructureStatus(id, status)
      set((state) => ({ structures: state.structures.map((item) => (item.id === id ? structure : item)) }))
    } catch (error) {
      set({ error: error.message })
    }
  },
}))
