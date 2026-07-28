import { apiGet, apiPost } from '../../../../services/apiClient'

export const TICKET_CATEGORIES = ['User Management', 'Payments & Gateway', 'Reports & Exports', 'Integrations', 'Backup & Restore', 'Security', 'Other']
export const TICKET_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']

function mapFaq(row) {
  return { id: row.id, question: row.question, answer: row.answer }
}

export async function fetchFaqs(query) {
  const params = query ? `?query=${encodeURIComponent(query)}` : ''
  const { data } = await apiGet(`/support/faqs${params}`)
  return (data || []).map(mapFaq)
}

function mapTicketStatus(status) {
  if (status === 'in_progress') return 'in-progress'
  // "closed" has no equivalent badge in the UI's STATUS_META (open/in-progress/resolved only)
  // — the closest honest bucket to show it under is "resolved".
  if (status === 'closed') return 'resolved'
  return status
}

function mapTicketPriority(priority) {
  const label = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' }[priority]
  return label || priority
}

function mapTicket(row) {
  return {
    // ticket_no is the human-readable "TCK-…" identifier shown in the UI; the real primary
    // key (row.id, a UUID) is kept only internally for API calls.
    id: row.ticket_no,
    subject: row.subject,
    category: row.category,
    description: row.description || '',
    priority: mapTicketPriority(row.priority),
    status: mapTicketStatus(row.status),
    createdAt: row.created_at,
  }
}

export async function fetchTickets() {
  const { data } = await apiGet('/support/tickets')
  return (data || []).map(mapTicket).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function createTicket(payload) {
  const { data } = await apiPost('/support/tickets', {
    subject: payload.subject,
    description: payload.description,
    category: payload.category,
    priority: payload.priority?.toLowerCase() || 'medium',
  })
  return mapTicket(data)
}
