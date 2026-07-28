import { apiGet } from '../../../services/apiClient'

export async function fetchReceipts() {
  const [{ data: receipts }, { data: payments }] = await Promise.all([
    apiGet('/documents/receipts'),
    apiGet('/payments'),
  ])

  const paymentsById = new Map((payments || []).map((payment) => [payment.id, payment]))

  return (receipts || []).map((receipt) => {
    const payment = paymentsById.get(receipt.payment_id)
    return {
      id: receipt.receipt_no,
      transactionId: payment?.reference_no || receipt.payment_id || '',
      paymentDate: receipt.created_at?.slice(0, 10),
      amount: Number(receipt.amount),
      method: payment?.method || '',
    }
  })
}
