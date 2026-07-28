import { apiGet } from '../../../../services/apiClient'

export const ACTORS = ['Kavita Sharma', 'Rohit Verma', 'Ananya Iyer']

export const ACTION_TYPES = [
  'Payment Recorded',
  'Refund Approved',
  'Refund Rejected',
  'Fee Structure Edited',
  'Student Record Updated',
  'Login',
  'Export Generated',
  'Reminder Sent',
  'Late Fee Waived',
]

export const CRITICAL_ACTION_TYPES = new Set(['Refund Approved', 'Refund Rejected', 'Fee Structure Edited', 'Late Fee Waived'])

export async function fetchAuditLogs(filters = {}) {
  const { query, actor, actionType, dateFrom, dateTo } = filters
  const params = new URLSearchParams()
  if (query) params.set('query', query)
  if (actor) params.set('actor', actor)
  if (actionType) params.set('actionType', actionType)
  if (dateFrom) params.set('dateFrom', dateFrom)
  if (dateTo) params.set('dateTo', dateTo)
  const qs = params.toString()
  const { data } = await apiGet(`/audit-logs${qs ? `?${qs}` : ''}`)
  return (data ?? []).slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}
