import { create } from 'zustand'
import { createTemplate, duplicateTemplate, fetchTemplates, setDefaultTemplate } from '../services/invoicesService'

export const useTemplatesStore = create((set, get) => ({
  status: 'idle',
  error: null,
  templates: [],
  actioningId: null,

  fetchTemplates: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const templates = await fetchTemplates()
      set({ status: 'success', templates })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  makeDefault: async (id) => {
    set({ actioningId: id })
    try {
      const templates = await setDefaultTemplate(id)
      set({ templates, actioningId: null })
    } catch (error) {
      set({ actioningId: null, error: error.message })
    }
  },

  duplicate: async (id) => {
    set({ actioningId: id })
    try {
      const copy = await duplicateTemplate(id)
      set((state) => ({ templates: [...state.templates, copy], actioningId: null }))
    } catch (error) {
      set({ actioningId: null, error: error.message })
    }
  },

  create: async (payload) => {
    const record = await createTemplate(payload)
    set((state) => ({ templates: [...state.templates, record] }))
    return record
  },
}))
