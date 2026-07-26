const MOCK_INVOICES = [
  { id: 'INV-2216', generatedDate: '2026-07-18', feeType: 'Tuition', amount: 20000, status: 'pending', dueDate: '2026-08-15' },
  { id: 'INV-2198', generatedDate: '2026-04-15', feeType: 'Transport', amount: 15000, status: 'paid', dueDate: '2026-04-20' },
  { id: 'INV-2170', generatedDate: '2026-02-01', feeType: 'Hostel', amount: 5000, status: 'paid', dueDate: '2026-02-10' },
  { id: 'INV-2145', generatedDate: '2025-12-05', feeType: 'Exam', amount: 8000, status: 'paid', dueDate: '2025-12-15' },
  { id: 'INV-2110', generatedDate: '2025-09-25', feeType: 'Miscellaneous', amount: 6000, status: 'overdue', dueDate: '2025-10-01' },
]

const FETCH_DELAY_MS = 700

export async function fetchInvoices() {
  await new Promise((resolve) => setTimeout(resolve, FETCH_DELAY_MS))
  return MOCK_INVOICES
}
