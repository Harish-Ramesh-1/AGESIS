const MOCK_FEE_COMPONENTS = [
  { key: 'tuition', label: 'Tuition', amount: 60000, paid: 40000, pending: 20000, status: 'partial' },
  { key: 'transport', label: 'Transport', amount: 15000, paid: 15000, pending: 0, status: 'paid' },
  { key: 'hostel', label: 'Hostel', amount: 10000, paid: 5000, pending: 5000, status: 'partial' },
  { key: 'library', label: 'Library', amount: 5000, paid: 5000, pending: 0, status: 'paid' },
  { key: 'exam', label: 'Exam', amount: 8000, paid: 5000, pending: 3000, status: 'partial' },
  { key: 'sports', label: 'Sports', amount: 6000, paid: 2500, pending: 3500, status: 'partial' },
  { key: 'miscellaneous', label: 'Miscellaneous', amount: 6000, paid: 0, pending: 6000, status: 'pending' },
  { key: 'lateFee', label: 'Late Fee', amount: 0, paid: 0, pending: 0, status: 'not_applicable' },
  { key: 'scholarship', label: 'Scholarship', amount: -5000, paid: -5000, pending: 0, status: 'applied' },
  { key: 'discount', label: 'Discount', amount: -3000, paid: -3000, pending: 0, status: 'applied' },
]

const MOCK_INSTALLMENTS = [
  { id: 1, label: 'Installment 1', amount: 27500, dueDate: '2025-06-15', paidDate: '2025-06-10', status: 'paid' },
  { id: 2, label: 'Installment 2', amount: 27500, dueDate: '2025-09-15', paidDate: '2025-09-12', status: 'paid' },
  { id: 3, label: 'Installment 3', amount: 27500, dueDate: '2026-08-15', status: 'upcoming' },
  { id: 4, label: 'Installment 4', amount: 27500, dueDate: '2026-12-15', status: 'pending' },
]

const MOCK_SCHOLARSHIPS = [
  {
    id: 's1',
    type: 'scholarship',
    name: 'Merit Scholarship',
    appliedAmount: 5000,
    description: 'Awarded for academic excellence in the previous year.',
  },
  {
    id: 's2',
    type: 'discount',
    name: 'Sibling Discount',
    appliedAmount: 3000,
    description: '10% discount for enrolling a second child.',
  },
]

const MOCK_ACTIVITIES = [
  { id: 'act1', type: 'payment', title: 'Payment Completed', description: '₹25,000 paid via UPI', date: '2026-06-02' },
  { id: 'act2', type: 'invoice', title: 'Invoice Generated', description: 'Invoice INV-2216 generated', date: '2026-07-18' },
  { id: 'act3', type: 'receipt', title: 'Receipt Downloaded', description: 'Receipt RCT-9821 downloaded', date: '2026-06-03' },
  { id: 'act4', type: 'latefee', title: 'Late Fee Updated', description: 'Late fee policy updated for Q2', date: '2026-05-20' },
]

const totalFee = MOCK_FEE_COMPONENTS.reduce((sum, item) => (item.amount > 0 ? sum + item.amount : sum), 0)
const amountPaid = MOCK_FEE_COMPONENTS.reduce((sum, item) => (item.amount > 0 ? sum + item.paid : sum), 0)

const MOCK_FEE_DETAILS = {
  totalFee,
  amountPaid,
  pendingAmount: totalFee - amountPaid,
  progressPercent: Math.round((amountPaid / totalFee) * 100),
  scholarshipTotal: MOCK_SCHOLARSHIPS.reduce((sum, item) => sum + item.appliedAmount, 0),
  upcomingDue: {
    amount: 18750,
    dueDate: '2026-08-15',
    daysRemaining: 22,
    lateFeePerDay: 100,
    lateFeeGraceDays: 7,
  },
  components: MOCK_FEE_COMPONENTS,
  installments: MOCK_INSTALLMENTS,
  scholarships: MOCK_SCHOLARSHIPS,
  activities: MOCK_ACTIVITIES,
}

const FETCH_DELAY_MS = 800

export async function fetchFeeDetails() {
  await new Promise((resolve) => setTimeout(resolve, FETCH_DELAY_MS))
  return MOCK_FEE_DETAILS
}
