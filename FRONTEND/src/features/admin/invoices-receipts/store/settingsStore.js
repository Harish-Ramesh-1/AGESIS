import { create } from 'zustand'
import { fetchDocumentSettings, saveDocumentSettings } from '../services/invoicesService'

export const useSettingsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  settings: null,
  isSaving: false,
  savedAt: null,

  fetchSettings: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const settings = await fetchDocumentSettings()
      set({ status: 'success', settings })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  saveSettings: async (payload) => {
    set({ isSaving: true })
    try {
      const settings = await saveDocumentSettings(payload)
      set({ isSaving: false, settings, savedAt: new Date().toISOString() })
      return settings
    } catch (error) {
      set({ isSaving: false, error: error.message })
      throw error
    }
  },
}))
