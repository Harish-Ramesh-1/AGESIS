import { create } from 'zustand'

const DEFAULT_FILTERS = {
  academicYear: '2025-2026',
  className: '',
  section: '',
  feeStatus: '',
  scholarship: false,
  discount: false,
  hostel: false,
  transport: false,
}

export const useSearchStore = create((set, get) => ({
  query: '',
  draftFilters: DEFAULT_FILTERS,
  appliedFilters: DEFAULT_FILTERS,

  setQuery: (query) => set({ query }),
  setDraftFilter: (key, value) => set((state) => ({ draftFilters: { ...state.draftFilters, [key]: value } })),
  applyFilters: () => set({ appliedFilters: get().draftFilters }),
  resetFilters: () => set({ draftFilters: DEFAULT_FILTERS, appliedFilters: DEFAULT_FILTERS, query: '' }),
}))
