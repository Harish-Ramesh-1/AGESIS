import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiGet } from '../services/apiClient'

function applyFontSize(size) {
  document.documentElement.setAttribute('data-font-size', size)
}

const initialState = {
  general: {
    name: '',
    email: '',
    phone: '',
    preferredContact: 'email',
    timezone: 'Asia/Kolkata',
  },
  appearance: { fontSize: 'medium' },
  security: {
    registeredEmail: '',
    registeredMobile: '',
    emailChangeRequest: null,
    mobileChangeRequest: null,
  },
}

export const useSettingsStore = create(
  persist(
    (set) => ({
      ...initialState,

      // Seeds `general`/`security` from the real backend profile. There's no
      // endpoint for pending email/mobile change requests, so those stay client-only.
      fetchProfile: async () => {
        try {
          const { data } = await apiGet('/settings/profile')
          set((state) => ({
            general: {
              ...state.general,
              name: data.fullName || state.general.name,
              email: data.email || state.general.email,
              phone: data.phone || state.general.phone,
              preferredContact: data.preferences?.preferredContact || state.general.preferredContact,
              timezone: data.preferences?.timezone || state.general.timezone,
            },
            security: {
              ...state.security,
              registeredEmail: data.email || state.security.registeredEmail,
              registeredMobile: data.phone || state.security.registeredMobile,
            },
          }))
        } catch {
          // best-effort — keep whatever values are already in the (persisted) store
        }
      },

      updateGeneral: (patch) => set((state) => ({ general: { ...state.general, ...patch } })),

      setFontSize: (fontSize) => {
        applyFontSize(fontSize)
        set((state) => ({ appearance: { ...state.appearance, fontSize } }))
      },

      requestEmailChange: (value) =>
        set((state) => ({
          security: { ...state.security, emailChangeRequest: { value, submittedAt: new Date().toISOString() } },
        })),

      requestMobileChange: (value) =>
        set((state) => ({
          security: { ...state.security, mobileChangeRequest: { value, submittedAt: new Date().toISOString() } },
        })),

      cancelEmailChangeRequest: () =>
        set((state) => ({ security: { ...state.security, emailChangeRequest: null } })),

      cancelMobileChangeRequest: () =>
        set((state) => ({ security: { ...state.security, mobileChangeRequest: null } })),
    }),
    {
      name: 'agesis-settings',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyFontSize(state.appearance.fontSize)
        }
      },
    },
  ),
)

applyFontSize(useSettingsStore.getState().appearance.fontSize)
useSettingsStore.getState().fetchProfile()
