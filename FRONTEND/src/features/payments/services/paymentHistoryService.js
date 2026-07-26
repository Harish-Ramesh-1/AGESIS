const MOCK_TRANSACTIONS = [
  {
    id: 'TXN-98213',
    receiptNumber: 'RCT-9821',
    invoiceNumber: 'INV-2216',
    date: '2026-06-02',
    feeCategory: 'Tuition',
    method: 'UPI',
    amount: 25000,
    status: 'paid',
    academicYear: '2025-2026',
    month: 'June',
  },
  {
    id: 'TXN-97650',
    receiptNumber: 'RCT-9765',
    invoiceNumber: 'INV-2198',
    date: '2026-04-18',
    feeCategory: 'Transport',
    method: 'Credit Card',
    amount: 15000,
    status: 'paid',
    academicYear: '2025-2026',
    month: 'April',
  },
  {
    id: 'TXN-96410',
    receiptNumber: 'RCT-9641',
    invoiceNumber: 'INV-2170',
    date: '2026-02-05',
    feeCategory: 'Hostel',
    method: 'Net Banking',
    amount: 5000,
    status: 'paid',
    academicYear: '2025-2026',
    month: 'February',
  },
  {
    id: 'TXN-95120',
    receiptNumber: 'RCT-9512',
    invoiceNumber: 'INV-2145',
    date: '2025-12-10',
    feeCategory: 'Exam',
    method: 'UPI',
    amount: 8000,
    status: 'paid',
    academicYear: '2025-2026',
    month: 'December',
  },
  {
    id: 'TXN-94002',
    receiptNumber: null,
    invoiceNumber: 'INV-2110',
    date: '2025-10-01',
    feeCategory: 'Miscellaneous',
    method: 'Cash',
    amount: 6000,
    status: 'failed',
    academicYear: '2025-2026',
    month: 'October',
  },
  {
    id: 'TXN-93210',
    receiptNumber: 'RCT-9321',
    invoiceNumber: 'INV-2090',
    date: '2025-09-12',
    feeCategory: 'Tuition',
    method: 'Credit Card',
    amount: 27500,
    status: 'paid',
    academicYear: '2025-2026',
    month: 'September',
  },
  {
    id: 'TXN-92100',
    receiptNumber: null,
    invoiceNumber: 'INV-2075',
    date: '2025-08-20',
    feeCategory: 'Sports',
    method: 'Wallet',
    amount: 3500,
    status: 'pending',
    academicYear: '2025-2026',
    month: 'August',
  },
  {
    id: 'TXN-91050',
    receiptNumber: 'RCT-9105',
    invoiceNumber: 'INV-2050',
    date: '2024-11-10',
    feeCategory: 'Tuition',
    method: 'UPI',
    amount: 27500,
    status: 'paid',
    academicYear: '2024-2025',
    month: 'November',
  },
  {
    id: 'TXN-90200',
    receiptNumber: 'RCT-9020',
    invoiceNumber: 'INV-2020',
    date: '2024-09-01',
    feeCategory: 'Library',
    method: 'Net Banking',
    amount: 2000,
    status: 'refunded',
    academicYear: '2024-2025',
    month: 'September',
  },
]

function buildSummary(transactions) {
  const paid = transactions.filter((transaction) => transaction.status === 'paid')
  const pending = transactions.filter((transaction) => transaction.status === 'pending')
  const lastPayment = [...paid].sort((a, b) => new Date(b.date) - new Date(a.date))[0] ?? null

  return {
    totalPaid: paid.reduce((sum, transaction) => sum + transaction.amount, 0),
    totalTransactions: transactions.length,
    pendingAmount: pending.reduce((sum, transaction) => sum + transaction.amount, 0),
    pendingCount: pending.length,
    lastPayment,
  }
}

const FETCH_DELAY_MS = 800

export async function fetchPaymentHistory() {
  await new Promise((resolve) => setTimeout(resolve, FETCH_DELAY_MS))
  return {
    transactions: MOCK_TRANSACTIONS,
    summary: buildSummary(MOCK_TRANSACTIONS),
  }
}
