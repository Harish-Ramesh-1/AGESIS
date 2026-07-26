import { create } from 'zustand'
import {
  addMiscCharge,
  assignFeeStructure,
  fetchFeeStructure,
  updateFeeComponents,
  waivePenalty,
} from '../services/studentFeeService'

export const useFeeStructureStore = create((set, get) => ({
  studentId: null,
  status: 'idle',
  error: null,
  feeComponents: [],
  miscCharges: [],
  penalty: null,
  isSaving: false,

  fetchFeeStructure: async (studentId) => {
    if (get().studentId === studentId && get().status === 'success') return
    set({ studentId, status: 'loading', error: null })
    try {
      const { feeComponents, miscCharges, penalty } = await fetchFeeStructure(studentId)
      if (get().studentId !== studentId) return
      set({ status: 'success', feeComponents, miscCharges, penalty })
    } catch (error) {
      if (get().studentId !== studentId) return
      set({ status: 'error', error: error.message })
    }
  },

  assignFeeStructure: async (payload) => {
    const studentId = get().studentId
    set({ isSaving: true })
    try {
      const feeComponents = await assignFeeStructure(studentId, payload)
      set({ feeComponents, isSaving: false })
      return true
    } catch (error) {
      set({ isSaving: false, error: error.message })
      return false
    }
  },

  saveFeeComponents: async (components) => {
    const studentId = get().studentId
    set({ isSaving: true })
    try {
      const feeComponents = await updateFeeComponents(studentId, components)
      set({ feeComponents, isSaving: false })
      return true
    } catch (error) {
      set({ isSaving: false, error: error.message })
      return false
    }
  },

  addMiscCharge: async (payload) => {
    const studentId = get().studentId
    const miscCharges = await addMiscCharge(studentId, payload)
    set({ miscCharges })
  },

  removeMiscCharge: (id) => set((state) => ({ miscCharges: state.miscCharges.filter((charge) => charge.id !== id) })),

  waivePenalty: async (payload) => {
    const studentId = get().studentId
    set({ isSaving: true })
    try {
      const penalty = await waivePenalty(studentId, payload)
      set({ penalty, isSaving: false })
      return true
    } catch (error) {
      set({ isSaving: false, error: error.message })
      return false
    }
  },
}))
