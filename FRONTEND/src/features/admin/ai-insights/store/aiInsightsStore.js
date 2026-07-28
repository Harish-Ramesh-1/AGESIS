import { create } from 'zustand'
import { fetchAiInsightsPreview, subscribeToAiInsights } from '../services/aiInsightsService'

export const useAiInsightsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  upcomingWidgets: [],
  teaserInsights: [],

  subscribeStatus: 'idle',
  subscribeError: null,

  fetchPreview: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const { upcomingWidgets, teaserInsights } = await fetchAiInsightsPreview()
      set({ status: 'success', upcomingWidgets, teaserInsights })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  subscribe: async (email) => {
    set({ subscribeStatus: 'loading', subscribeError: null })
    try {
      await subscribeToAiInsights(email)
      set({ subscribeStatus: 'success' })
    } catch (error) {
      set({ subscribeStatus: 'error', subscribeError: error.message })
    }
  },
  resetSubscribeStatus: () => set({ subscribeStatus: 'idle', subscribeError: null }),
}))
