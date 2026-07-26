import { create } from 'zustand'

const MOCK_REWARDS = {
  currentStreak: 4,
  longestStreak: 7,
  points: 1280,
  badges: [
    { id: 'b1', label: 'On-Time Payer', icon: 'Award' },
    { id: 'b2', label: 'Early Bird', icon: 'Zap' },
    { id: 'b3', label: '3-Month Streak', icon: 'Flame' },
  ],
}

const MOCK_DOCUMENTS = {
  latestInvoice: { id: 'INV-2216', date: '2026-07-18', label: 'Invoice - July 2026' },
  latestReceipt: { id: 'RCT-9821', date: '2026-06-02', label: 'Receipt - June 2026' },
}

const MOCK_ANNOUNCEMENTS = [
  {
    id: 'a1',
    title: 'Holiday Notice',
    description: 'School closed on Aug 15 for Independence Day.',
    date: '2026-08-01',
    category: 'holiday',
  },
  {
    id: 'a2',
    title: 'Parent-Teacher Meeting',
    description: 'PTM scheduled for Aug 10, 10 AM onwards.',
    date: '2026-07-28',
    category: 'meeting',
  },
  {
    id: 'a3',
    title: 'Fee Reminder',
    description: 'Next installment due by Aug 15.',
    date: '2026-07-20',
    category: 'fee',
  },
  {
    id: 'a4',
    title: 'Scholarship Announcement',
    description: 'Merit scholarship applications now open.',
    date: '2026-07-10',
    category: 'scholarship',
  },
]

const FETCH_DELAY_MS = 800

export const useDashboardStore = create((set, get) => ({
  status: 'idle',
  error: null,
  rewards: null,
  documents: null,
  announcements: [],

  fetchDashboardExtras: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      await new Promise((resolve) => setTimeout(resolve, FETCH_DELAY_MS))
      set({
        status: 'success',
        rewards: MOCK_REWARDS,
        documents: MOCK_DOCUMENTS,
        announcements: MOCK_ANNOUNCEMENTS,
      })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
