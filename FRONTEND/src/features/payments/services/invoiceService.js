import { apiGet } from '../../../services/apiClient'

function deriveStatus(invoice) {
  if (invoice.status === 'paid') return 'paid'
  if (invoice.due_date && new Date(invoice.due_date) < new Date()) return 'overdue'
  return 'pending'
}

export async function fetchInvoices() {
  const { data: invoices } = await apiGet('/documents/invoices')
  return (invoices || []).map((invoice) => ({
    id: invoice.invoice_no,
    generatedDate: invoice.created_at?.slice(0, 10),
    feeType: invoice.items?.[0]?.category || 'Tuition',
    amount: Number(invoice.total),
    status: deriveStatus(invoice),
    dueDate: invoice.due_date,
  }))
}
