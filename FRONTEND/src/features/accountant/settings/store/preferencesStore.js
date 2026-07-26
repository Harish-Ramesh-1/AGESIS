import { create } from 'zustand'
import { fetchPreferences, updatePreferences } from '../services/accountantSettingsService'

export const useAccountantPreferencesStore = create((set, get) => ({
  status: 'idle',
  error: null,
  preferences: null,

  saveStatus: 'idle',
  saveError: null,

  fetchPreferences: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const preferences = await fetchPreferences()
      set({ status: 'success', preferences })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  updatePreferences: async (patch) => {
    set({ saveStatus: 'loading', saveError: null })
    try {
      const preferences = await updatePreferences(patch)
      set({ saveStatus: 'success', preferences })
      return true
    } catch (error) {
      set({ saveStatus: 'error', saveError: error.message })
      return false
    }
  },

  resetSaveStatus: () => set({ saveStatus: 'idle', saveError: null }),
}))
