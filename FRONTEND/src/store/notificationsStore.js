import { create } from 'zustand'

const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'payment',
    title: 'Payment Successful',
    message: '₹25,000 received via UPI.',
    timestamp: '2026-06-02T10:15:00Z',
    unread: false,
  },
  {
    id: 'n2',
    type: 'due',
    title: 'Due Reminder',
    message: 'Next installment due in 22 days.',
    timestamp: '2026-07-20T09:00:00Z',
    unread: true,
  },
  {
    id: 'n3',
    type: 'invoice',
    title: 'Invoice Generated',
    message: 'Invoice INV-2216 is ready to download.',
    timestamp: '2026-07-18T14:30:00Z',
    unread: true,
  },
  {
    id: 'n4',
    type: 'circular',
    title: 'School Circular',
    message: 'Annual Sports Day scheduled for Aug 5.',
    timestamp: '2026-07-15T08:00:00Z',
    unread: false,
  },
  {
    id: 'n5',
    type: 'scholarship',
    title: 'Scholarship Update',
    message: 'Merit scholarship applications now open.',
    timestamp: '2026-07-10T11:00:00Z',
    unread: false,
  },
]

const FETCH_DELAY_MS = 600

export const useNotificationsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  items: [],

  fetchNotifications: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      await new Promise((resolve) => setTimeout(resolve, FETCH_DELAY_MS))
      set({ status: 'success', items: MOCK_NOTIFICATIONS })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  markAllRead: () =>
    set((state) => ({ items: state.items.map((item) => ({ ...item, unread: false })) })),
}))
