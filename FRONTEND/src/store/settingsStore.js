import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function applyFontSize(size) {
  document.documentElement.setAttribute('data-font-size', size)
}

const initialState = {
  general: {
    name: 'Rajesh Mehta',
    email: 'rajesh.mehta@example.com',
    phone: '+91 90000 11111',
    preferredContact: 'email',
    timezone: 'Asia/Kolkata',
  },
  appearance: { fontSize: 'medium' },
  security: {
    registeredEmail: 'rajesh.mehta@example.com',
    registeredMobile: '+91 90000 11111',
    emailChangeRequest: null,
    mobileChangeRequest: null,
  },
}

export const useSettingsStore = create(
  persist(
    (set) => ({
      ...initialState,

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
