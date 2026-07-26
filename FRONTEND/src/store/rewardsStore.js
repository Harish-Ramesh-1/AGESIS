import { create } from 'zustand'
import { fetchRewards } from '../features/rewards/services/rewardsService'

export const useRewardsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  data: null,

  fetchRewards: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const data = await fetchRewards()
      set({ status: 'success', data })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
