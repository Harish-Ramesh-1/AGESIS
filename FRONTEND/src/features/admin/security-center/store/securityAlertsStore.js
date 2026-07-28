import { create } from 'zustand'
import { blockAlertIp, fetchAlerts, resolveAlert } from '../services/securityCenterService'

export const useSecurityAlertsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  alerts: [],

  actionStatus: 'idle',
  actionError: null,
  actioningId: null,

  fetchAlerts: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const alerts = await fetchAlerts()
      set({ status: 'success', alerts })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  resolve: async (id) => {
    set({ actionStatus: 'loading', actionError: null, actioningId: id })
    try {
      const alerts = await resolveAlert(id)
      set({ actionStatus: 'success', alerts, actioningId: null })
    } catch (error) {
      set({ actionStatus: 'error', actionError: error.message, actioningId: null })
    }
  },

  blockIp: async (id) => {
    set({ actionStatus: 'loading', actionError: null, actioningId: id })
    try {
      const alerts = await blockAlertIp(id)
      set({ actionStatus: 'success', alerts, actioningId: null })
    } catch (error) {
      set({ actionStatus: 'error', actionError: error.message, actioningId: null })
    }
  },
}))
