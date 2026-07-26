import { create } from 'zustand'

export const useFeeNotificationStore = create((set) => ({
  dismissedIds: [],
  dismiss: (id) =>
    set((state) => ({
      dismissedIds: state.dismissedIds.includes(id) ? state.dismissedIds : [...state.dismissedIds, id],
    })),
}))
