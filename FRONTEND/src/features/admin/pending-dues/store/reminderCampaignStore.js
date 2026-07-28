import { create } from 'zustand'
import { createReminderCampaign, fetchReminderCampaigns } from '../services/pendingDuesService'

export const useReminderCampaignStore = create((set, get) => ({
  status: 'idle',
  error: null,
  campaigns: [],
  isSaving: false,

  fetchCampaigns: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const campaigns = await fetchReminderCampaigns()
      set({ status: 'success', campaigns })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  createCampaign: async (payload) => {
    set({ isSaving: true })
    try {
      const campaign = await createReminderCampaign(payload)
      set((state) => ({ campaigns: [campaign, ...state.campaigns], isSaving: false }))
      return campaign
    } catch (error) {
      set({ isSaving: false, error: error.message })
      throw error
    }
  },
}))
