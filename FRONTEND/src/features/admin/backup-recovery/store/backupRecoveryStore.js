import { create } from 'zustand'
import {
  fetchBackupSchedule,
  updateBackupSchedule,
  runBackupNow,
  fetchBackupHistory,
  fetchRestoreSnapshots,
  restoreFromSnapshot,
  fetchExportHistory,
  generateExport,
} from '../services/backupRecoveryService'

export const useBackupRecoveryStore = create((set, get) => ({
  // Schedule
  scheduleStatus: 'idle',
  scheduleError: null,
  schedule: null,
  scheduleSaveStatus: 'idle',
  scheduleSaveError: null,
  runBackupStatus: 'idle',
  runBackupResult: null,

  fetchSchedule: async () => {
    if (get().scheduleStatus === 'loading') return
    set({ scheduleStatus: 'loading', scheduleError: null })
    try {
      const schedule = await fetchBackupSchedule()
      set({ scheduleStatus: 'success', schedule })
    } catch (error) {
      set({ scheduleStatus: 'error', scheduleError: error.message })
    }
  },
  saveSchedule: async (patch) => {
    set({ scheduleSaveStatus: 'loading', scheduleSaveError: null })
    try {
      const schedule = await updateBackupSchedule(patch)
      set({ scheduleSaveStatus: 'success', schedule })
    } catch (error) {
      set({ scheduleSaveStatus: 'error', scheduleSaveError: error.message })
    }
  },
  resetScheduleSaveStatus: () => set({ scheduleSaveStatus: 'idle', scheduleSaveError: null }),
  runBackup: async () => {
    set({ runBackupStatus: 'loading', runBackupResult: null })
    try {
      const result = await runBackupNow()
      set({ runBackupStatus: 'success', runBackupResult: result })
    } catch (error) {
      set({ runBackupStatus: 'error', runBackupResult: { success: false, message: error.message } })
    }
  },

  // History
  historyStatus: 'idle',
  historyError: null,
  history: [],

  fetchHistory: async () => {
    if (get().historyStatus === 'loading') return
    set({ historyStatus: 'loading', historyError: null })
    try {
      const history = await fetchBackupHistory()
      set({ historyStatus: 'success', history })
    } catch (error) {
      set({ historyStatus: 'error', historyError: error.message })
    }
  },

  // Restore
  snapshotsStatus: 'idle',
  snapshotsError: null,
  snapshots: [],
  restoreStatus: 'idle',
  restoreError: null,
  restoreResult: null,

  fetchSnapshots: async () => {
    if (get().snapshotsStatus === 'loading') return
    set({ snapshotsStatus: 'loading', snapshotsError: null })
    try {
      const snapshots = await fetchRestoreSnapshots()
      set({ snapshotsStatus: 'success', snapshots })
    } catch (error) {
      set({ snapshotsStatus: 'error', snapshotsError: error.message })
    }
  },
  restoreSnapshot: async (id) => {
    set({ restoreStatus: 'loading', restoreError: null, restoreResult: null })
    try {
      const result = await restoreFromSnapshot(id)
      set({ restoreStatus: 'success', restoreResult: result })
    } catch (error) {
      set({ restoreStatus: 'error', restoreError: error.message })
    }
  },
  resetRestoreStatus: () => set({ restoreStatus: 'idle', restoreError: null, restoreResult: null }),

  // Data export
  exportHistoryStatus: 'idle',
  exportHistoryError: null,
  exportHistory: [],
  exportActionStatus: 'idle',
  exportActionError: null,

  fetchExportHistory: async () => {
    if (get().exportHistoryStatus === 'loading') return
    set({ exportHistoryStatus: 'loading', exportHistoryError: null })
    try {
      const exportHistory = await fetchExportHistory()
      set({ exportHistoryStatus: 'success', exportHistory })
    } catch (error) {
      set({ exportHistoryStatus: 'error', exportHistoryError: error.message })
    }
  },
  createExport: async (payload) => {
    set({ exportActionStatus: 'loading', exportActionError: null })
    try {
      const exportHistory = await generateExport(payload)
      set({ exportActionStatus: 'success', exportHistory })
    } catch (error) {
      set({ exportActionStatus: 'error', exportActionError: error.message })
    }
  },
  resetExportActionStatus: () => set({ exportActionStatus: 'idle', exportActionError: null }),
}))
