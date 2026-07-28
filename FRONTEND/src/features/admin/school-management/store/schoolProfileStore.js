import { create } from 'zustand'
import { fetchSchoolProfile, saveSchoolProfile } from '../services/schoolManagementService'

export const useSchoolProfileStore = create((set, get) => ({
  status: 'idle',
  error: null,
  profile: null,
  saveStatus: 'idle',

  fetchProfile: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const profile = await fetchSchoolProfile()
      set({ status: 'success', profile })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  saveProfile: async (nextProfile) => {
    set({ saveStatus: 'saving' })
    try {
      const profile = await saveSchoolProfile(nextProfile)
      set({ profile, saveStatus: 'saved' })
    } catch (error) {
      set({ saveStatus: 'error', error: error.message })
    }
  },

  resetSaveStatus: () => set({ saveStatus: 'idle' }),
}))
