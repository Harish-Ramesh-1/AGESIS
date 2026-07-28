import { create } from 'zustand'
import {
  fetchGeneralSettings,
  updateGeneralSettings,
  fetchBrandingSettings,
  updateBrandingSettings,
  fetchAcademicConfig,
  updateAcademicConfig,
  fetchNotificationConfig,
  updateNotificationConfig,
} from '../services/systemSettingsService'

export const useSystemSettingsStore = create((set, get) => ({
  // General
  generalStatus: 'idle',
  generalError: null,
  general: null,
  generalSaveStatus: 'idle',
  generalSaveError: null,

  fetchGeneral: async () => {
    if (get().generalStatus === 'loading') return
    set({ generalStatus: 'loading', generalError: null })
    try {
      const general = await fetchGeneralSettings()
      set({ generalStatus: 'success', general })
    } catch (error) {
      set({ generalStatus: 'error', generalError: error.message })
    }
  },
  saveGeneral: async (patch) => {
    set({ generalSaveStatus: 'loading', generalSaveError: null })
    try {
      const general = await updateGeneralSettings(patch)
      set({ generalSaveStatus: 'success', general })
    } catch (error) {
      set({ generalSaveStatus: 'error', generalSaveError: error.message })
    }
  },
  resetGeneralSaveStatus: () => set({ generalSaveStatus: 'idle', generalSaveError: null }),

  // Branding
  brandingStatus: 'idle',
  brandingError: null,
  branding: null,
  brandingSaveStatus: 'idle',
  brandingSaveError: null,

  fetchBranding: async () => {
    if (get().brandingStatus === 'loading') return
    set({ brandingStatus: 'loading', brandingError: null })
    try {
      const branding = await fetchBrandingSettings()
      set({ brandingStatus: 'success', branding })
    } catch (error) {
      set({ brandingStatus: 'error', brandingError: error.message })
    }
  },
  saveBranding: async (patch) => {
    set({ brandingSaveStatus: 'loading', brandingSaveError: null })
    try {
      const branding = await updateBrandingSettings(patch)
      set({ brandingSaveStatus: 'success', branding })
    } catch (error) {
      set({ brandingSaveStatus: 'error', brandingSaveError: error.message })
    }
  },
  resetBrandingSaveStatus: () => set({ brandingSaveStatus: 'idle', brandingSaveError: null }),

  // Academic Configuration
  academicStatus: 'idle',
  academicError: null,
  academic: null,
  academicSaveStatus: 'idle',
  academicSaveError: null,

  fetchAcademic: async () => {
    if (get().academicStatus === 'loading') return
    set({ academicStatus: 'loading', academicError: null })
    try {
      const academic = await fetchAcademicConfig()
      set({ academicStatus: 'success', academic })
    } catch (error) {
      set({ academicStatus: 'error', academicError: error.message })
    }
  },
  saveAcademic: async (patch) => {
    set({ academicSaveStatus: 'loading', academicSaveError: null })
    try {
      const academic = await updateAcademicConfig(patch)
      set({ academicSaveStatus: 'success', academic })
    } catch (error) {
      set({ academicSaveStatus: 'error', academicSaveError: error.message })
    }
  },
  resetAcademicSaveStatus: () => set({ academicSaveStatus: 'idle', academicSaveError: null }),

  // Notification Configuration
  notificationStatus: 'idle',
  notificationError: null,
  notificationConfig: null,
  notificationSaveStatus: 'idle',
  notificationSaveError: null,

  fetchNotificationConfig: async () => {
    if (get().notificationStatus === 'loading') return
    set({ notificationStatus: 'loading', notificationError: null })
    try {
      const notificationConfig = await fetchNotificationConfig()
      set({ notificationStatus: 'success', notificationConfig })
    } catch (error) {
      set({ notificationStatus: 'error', notificationError: error.message })
    }
  },
  saveNotificationConfig: async (patch) => {
    set({ notificationSaveStatus: 'loading', notificationSaveError: null })
    try {
      const notificationConfig = await updateNotificationConfig(patch)
      set({ notificationSaveStatus: 'success', notificationConfig })
    } catch (error) {
      set({ notificationSaveStatus: 'error', notificationSaveError: error.message })
    }
  },
  resetNotificationSaveStatus: () => set({ notificationSaveStatus: 'idle', notificationSaveError: null }),
}))
