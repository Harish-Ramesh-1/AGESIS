import { create } from 'zustand'
import { fetchProfile, updateProfile } from '../services/accountantSettingsService'

export const useAccountantProfileStore = create((set, get) => ({
  status: 'idle',
  error: null,
  profile: null,
  activity: null,

  saveStatus: 'idle',
  saveError: null,

  fetchProfile: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const { profile, activity } = await fetchProfile()
      set({ status: 'success', profile, activity })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  updateProfile: async (patch) => {
    set({ saveStatus: 'loading', saveError: null })
    try {
      const profile = await updateProfile(patch)
      set({ saveStatus: 'success', profile })
      return true
    } catch (error) {
      set({ saveStatus: 'error', saveError: error.message })
      return false
    }
  },

  resetSaveStatus: () => set({ saveStatus: 'idle', saveError: null }),
}))
