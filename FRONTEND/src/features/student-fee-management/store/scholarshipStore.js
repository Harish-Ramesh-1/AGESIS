import { create } from 'zustand'
import { addDiscount, addScholarship, fetchScholarshipsAndDiscounts } from '../services/studentFeeService'

export const useScholarshipStore = create((set, get) => ({
  studentId: null,
  status: 'idle',
  error: null,
  scholarships: [],
  discounts: [],

  fetchAll: async (studentId) => {
    if (get().studentId === studentId && get().status === 'success') return
    set({ studentId, status: 'loading', error: null })
    try {
      const { scholarships, discounts } = await fetchScholarshipsAndDiscounts(studentId)
      if (get().studentId !== studentId) return
      set({ status: 'success', scholarships, discounts })
    } catch (error) {
      if (get().studentId !== studentId) return
      set({ status: 'error', error: error.message })
    }
  },

  addScholarship: async (payload) => {
    const studentId = get().studentId
    const scholarships = await addScholarship(studentId, payload)
    set({ scholarships })
  },

  updateScholarship: (id, patch) =>
    set((state) => ({
      scholarships: state.scholarships.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })),

  removeScholarship: (id) =>
    set((state) => ({ scholarships: state.scholarships.filter((item) => item.id !== id) })),

  addDiscount: async (payload) => {
    const studentId = get().studentId
    const discounts = await addDiscount(studentId, payload)
    set({ discounts })
  },

  updateDiscount: (id, patch) =>
    set((state) => ({
      discounts: state.discounts.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })),

  removeDiscount: (id) => set((state) => ({ discounts: state.discounts.filter((item) => item.id !== id) })),
}))
