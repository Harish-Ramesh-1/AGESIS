import { apiGet } from '../../../services/apiClient'

export async function fetchDocuments() {
  const { data: archive } = await apiGet('/documents/archive')
  const latestInvoice = (archive || []).find((doc) => doc.type === 'invoice')
  const latestReceipt = (archive || []).find((doc) => doc.type === 'receipt')

  return {
    statement: latestInvoice
      ? { id: latestInvoice.number, label: 'Fee Statement', date: latestInvoice.createdAt?.slice(0, 10) }
      : null,
    invoice: latestInvoice
      ? { id: latestInvoice.number, label: `Invoice - ${latestInvoice.number}`, date: latestInvoice.createdAt?.slice(0, 10) }
      : null,
    receipt: latestReceipt
      ? { id: latestReceipt.number, label: `Receipt - ${latestReceipt.number}`, date: latestReceipt.createdAt?.slice(0, 10) }
      : null,
  }
}
