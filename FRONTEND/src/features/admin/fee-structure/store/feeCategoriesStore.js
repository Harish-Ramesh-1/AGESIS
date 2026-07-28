import { create } from 'zustand'
import { createFeeCategory, fetchFeeCategories, toggleFeeCategoryTaxable } from '../services/feeStructureService'

export const useFeeCategoriesStore = create((set, get) => ({
  status: 'idle',
  error: null,
  categories: [],
  isSaving: false,
  actioningId: null,

  fetchCategories: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const categories = await fetchFeeCategories()
      set({ status: 'success', categories })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  addCategory: async (payload) => {
    set({ isSaving: true })
    try {
      const category = await createFeeCategory(payload)
      set((state) => ({ categories: [category, ...state.categories], isSaving: false }))
      return category
    } catch (error) {
      set({ isSaving: false, error: error.message })
      throw error
    }
  },

  toggleTaxable: async (id) => {
    set({ actioningId: id })
    try {
      const category = await toggleFeeCategoryTaxable(id)
      set((state) => ({ categories: state.categories.map((item) => (item.id === id ? category : item)), actioningId: null }))
    } catch (error) {
      set({ actioningId: null, error: error.message })
    }
  },
}))
