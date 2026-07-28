import { apiGet, apiPost } from '../../../../services/apiClient'

export const TICKET_CATEGORIES = ['Payments', 'Refunds', 'Fee Structure', 'Reports', 'Account Access', 'Other']
export const TICKET_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']

function mapTicket(row) {
  return {
    id: row.id,
    subject: row.subject,
    category: row.category,
    description: row.description,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at ?? row.createdAt,
  }
}

export async function fetchFaqs(query) {
  const qs = query ? `?query=${encodeURIComponent(query)}` : ''
  const { data } = await apiGet(`/support/faqs${qs}`)
  return (data ?? []).map((row) => ({ id: row.id, question: row.question, answer: row.answer }))
}

export async function fetchTickets() {
  const { data } = await apiGet('/support/tickets')
  return (data ?? []).map(mapTicket).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function createTicket(payload) {
  const { data } = await apiPost('/support/tickets', {
    subject: payload.subject,
    description: payload.description,
    category: payload.category,
    priority: payload.priority,
  })
  return mapTicket(data)
}
