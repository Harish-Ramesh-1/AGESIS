import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      portal: null,
      login: ({ portal }) => set({ isAuthenticated: true, portal }),
      logout: () => set({ isAuthenticated: false, portal: null }),
    }),
    { name: 'agesis-auth' },
  ),
)
