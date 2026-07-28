import { create } from 'zustand'
import { fetchLateFeeRules, updateLateFeeRules } from '../services/pendingDuesService'

export const useLateFeeRulesStore = create((set, get) => ({
  status: 'idle',
  error: null,
  rules: null,
  isSaving: false,
  saveMessage: '',

  fetchRules: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const rules = await fetchLateFeeRules()
      set({ status: 'success', rules })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  saveRules: async (payload) => {
    set({ isSaving: true, saveMessage: '' })
    try {
      const rules = await updateLateFeeRules(payload)
      set({ rules, isSaving: false, saveMessage: 'Late fee rules updated successfully.' })
      return rules
    } catch (error) {
      set({ isSaving: false, error: error.message })
      throw error
    }
  },

  clearSaveMessage: () => set({ saveMessage: '' }),
}))
