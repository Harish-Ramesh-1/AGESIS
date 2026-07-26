import { create } from 'zustand'
import {
  fetchExportHistory,
  fetchScheduledReports,
  requestExport,
  scheduleReport,
  toggleSchedule,
} from '../services/reportsService'

export const useExportStore = create((set, get) => ({
  historyStatus: 'idle',
  historyError: null,
  history: [],

  scheduleStatus: 'idle',
  schedules: [],

  isExporting: false,
  isScheduling: false,

  fetchHistory: async () => {
    if (get().historyStatus === 'loading') return
    set({ historyStatus: 'loading', historyError: null })
    try {
      const history = await fetchExportHistory()
      set({ historyStatus: 'success', history })
    } catch (error) {
      set({ historyStatus: 'error', historyError: error.message })
    }
  },

  fetchSchedules: async () => {
    if (get().scheduleStatus === 'loading' || get().scheduleStatus === 'success') return
    set({ scheduleStatus: 'loading' })
    const schedules = await fetchScheduledReports()
    set({ scheduleStatus: 'success', schedules })
  },

  requestExport: async (payload) => {
    set({ isExporting: true })
    const record = await requestExport(payload)
    set({ isExporting: false })
    await get().fetchHistory()
    return record
  },

  createSchedule: async (payload) => {
    set({ isScheduling: true })
    const record = await scheduleReport(payload)
    set((state) => ({ isScheduling: false, schedules: [record, ...state.schedules] }))
    return record
  },

  toggleSchedule: async (id) => {
    const updated = await toggleSchedule(id)
    set((state) => ({ schedules: state.schedules.map((item) => (item.id === id ? updated : item)) }))
  },
}))
