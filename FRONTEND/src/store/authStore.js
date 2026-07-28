import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      portal: null,
      user: null,
      accessToken: null,
      refreshToken: null,
      login: ({ portal, user, accessToken, refreshToken }) =>
        set({ isAuthenticated: true, portal, user: user ?? null, accessToken: accessToken ?? null, refreshToken: refreshToken ?? null }),
      logout: () => set({ isAuthenticated: false, portal: null, user: null, accessToken: null, refreshToken: null }),
      setAccessToken: (accessToken) => set({ accessToken }),
    }),
    { name: 'agesis-auth' },
  ),
)
