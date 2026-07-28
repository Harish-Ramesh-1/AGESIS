import { create } from 'zustand'
import { fetchPromotionCandidates, fetchTransferRequests } from '../services/studentManagementService'
import { apiPatch } from '../../../../services/apiClient'

export const usePromotionTransferStore = create((set, get) => ({
  candidatesStatus: 'idle',
  candidatesError: null,
  candidates: [],
  selectedIds: new Set(),
  promoteStatus: 'idle',

  transfersStatus: 'idle',
  transfersError: null,
  transferRequests: [],

  fetchCandidates: async (currentClass) => {
    set({ candidatesStatus: 'loading', candidatesError: null, promoteStatus: 'idle' })
    try {
      const candidates = await fetchPromotionCandidates(currentClass)
      set({ candidatesStatus: 'success', candidates, selectedIds: new Set(candidates.map((c) => c.id)) })
    } catch (error) {
      set({ candidatesStatus: 'error', candidatesError: error.message })
    }
  },

  toggleSelected: (id) => {
    const next = new Set(get().selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    set({ selectedIds: next })
  },

  toggleSelectAll: () => {
    const { candidates, selectedIds } = get()
    const allSelected = candidates.every((c) => selectedIds.has(c.id))
    set({ selectedIds: allSelected ? new Set() : new Set(candidates.map((c) => c.id)) })
  },

  // The page doesn't pass its local "Promote To" selection into this action,
  // so the target class is derived here from the current candidates' shared
  // className (current class + 1, or 'alumni' status past Grade 12) using
  // the real PATCH /students/:id endpoint for each selected student.
  promoteSelected: async () => {
    const { candidates, selectedIds } = get()
    set({ promoteStatus: 'promoting' })
    try {
      const currentClassNum = Number(candidates[0]?.className)
      const nextClassName = Number.isFinite(currentClassNum) && currentClassNum < 12 ? String(currentClassNum + 1) : null
      const ids = candidates.filter((candidate) => selectedIds.has(candidate.id)).map((candidate) => candidate.id)
      await Promise.all(
        ids.map((id) =>
          nextClassName ? apiPatch(`/students/${id}`, { class_name: nextClassName }) : apiPatch(`/students/${id}`, { status: 'alumni' }),
        ),
      )
      set({ promoteStatus: 'promoted' })
    } catch {
      set({ promoteStatus: 'error' })
    }
  },

  resetPromoteStatus: () => set({ promoteStatus: 'idle' }),

  fetchTransferRequests: async () => {
    if (get().transfersStatus === 'loading') return
    set({ transfersStatus: 'loading', transfersError: null })
    try {
      const transferRequests = await fetchTransferRequests()
      set({ transfersStatus: 'success', transferRequests })
    } catch (error) {
      set({ transfersStatus: 'error', transfersError: error.message })
    }
  },
}))
