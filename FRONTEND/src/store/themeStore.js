import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function applyThemeClass(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: getSystemTheme(),
      toggleTheme: () => {
        const nextTheme = get().theme === 'dark' ? 'light' : 'dark'
        applyThemeClass(nextTheme)
        set({ theme: nextTheme })
      },
      setTheme: (theme) => {
        applyThemeClass(theme)
        set({ theme })
      },
      useSystemTheme: () => {
        const systemTheme = getSystemTheme()
        applyThemeClass(systemTheme)
        set({ theme: systemTheme })
      },
    }),
    {
      name: 'agesis-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeClass(state.theme)
      },
    },
  ),
)

applyThemeClass(useThemeStore.getState().theme)
