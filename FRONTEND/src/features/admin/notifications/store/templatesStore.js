import { create } from 'zustand'
import { createTemplate, duplicateTemplate, fetchTemplates, updateTemplate } from '../services/notificationsService'

export const useTemplatesStore = create((set) => ({
  status: 'idle',
  error: null,
  items: [],
  actionStatus: 'idle',

  fetchTemplates: async () => {
    set({ status: 'loading', error: null })
    try {
      const items = await fetchTemplates()
      set({ status: 'success', items })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  createTemplate: async (payload) => {
    set({ actionStatus: 'loading' })
    try {
      const record = await createTemplate(payload)
      set((state) => ({ actionStatus: 'success', items: [record, ...state.items] }))
      return record
    } catch {
      set({ actionStatus: 'error' })
      return null
    }
  },

  duplicateTemplate: async (id) => {
    set({ actionStatus: 'loading' })
    try {
      const record = await duplicateTemplate(id)
      set((state) => ({ actionStatus: 'success', items: [record, ...state.items] }))
      return record
    } catch {
      set({ actionStatus: 'error' })
      return null
    }
  },

  updateTemplate: async (id, payload) => {
    set({ actionStatus: 'loading' })
    try {
      const record = await updateTemplate(id, payload)
      set((state) => ({ actionStatus: 'success', items: state.items.map((item) => (item.id === id ? record : item)) }))
      return record
    } catch {
      set({ actionStatus: 'error' })
      return null
    }
  },
}))
