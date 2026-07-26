const MOCK_RECEIPTS = [
  { id: 'RCT-9821', transactionId: 'TXN-98213', paymentDate: '2026-06-02', amount: 25000, method: 'UPI' },
  { id: 'RCT-9765', transactionId: 'TXN-97650', paymentDate: '2026-04-18', amount: 15000, method: 'Credit Card' },
  { id: 'RCT-9641', transactionId: 'TXN-96410', paymentDate: '2026-02-05', amount: 5000, method: 'Net Banking' },
  { id: 'RCT-9512', transactionId: 'TXN-95120', paymentDate: '2025-12-10', amount: 8000, method: 'UPI' },
  { id: 'RCT-9321', transactionId: 'TXN-93210', paymentDate: '2025-09-12', amount: 27500, method: 'Credit Card' },
  { id: 'RCT-9105', transactionId: 'TXN-91050', paymentDate: '2024-11-10', amount: 27500, method: 'UPI' },
]

const FETCH_DELAY_MS = 700

export async function fetchReceipts() {
  await new Promise((resolve) => setTimeout(resolve, FETCH_DELAY_MS))
  return MOCK_RECEIPTS
}
