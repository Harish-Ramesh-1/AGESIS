const DELAY_MS = 600

function delay(ms = DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const NOW = Date.now()

function daysAgo(days) {
  return new Date(NOW - days * 24 * 60 * 60 * 1000).toISOString()
}

export const TICKET_CATEGORIES = ['Payments', 'Refunds', 'Fee Structure', 'Reports', 'Account Access', 'Other']
export const TICKET_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']

const FAQS = [
  {
    id: 'faq-1',
    question: 'How do I issue a refund?',
    answer:
      'Go to Payments > Refund Management, locate the transaction, and click Approve on the refund request. You can choose to refund to the original payment method or via bank transfer.',
  },
  {
    id: 'faq-2',
    question: 'How do I waive a late fee?',
    answer:
      'Open Dues > Late Fee Management, select the student record, and use the Waive action. Provide a short reason — this is recorded in the audit log.',
  },
  {
    id: 'faq-3',
    question: 'How do I record a cash payment received in person?',
    answer:
      'Go to Payments > Receive Payment, search for the student, choose Cash as the method, enter the amount, and submit. A receipt is generated automatically.',
  },
  {
    id: 'faq-4',
    question: 'A payment shows as failed but the parent says it was deducted. What do I do?',
    answer:
      'Check Payments > Failed Transactions for the gateway response. If the bank confirms deduction, ask the parent to share the reference ID and raise a support ticket for manual reconciliation.',
  },
  {
    id: 'faq-5',
    question: 'How do I edit a fee structure for a class?',
    answer:
      'Navigate to Student Fee Management > Fee Structure, select the academic year and class, then edit the relevant fee component. Changes apply to future assignments only.',
  },
  {
    id: 'faq-6',
    question: 'How do I generate a bulk set of invoices for a term?',
    answer:
      'Go to Documents > Bulk Invoice Generation, choose the class range and academic term, and click Generate. Invoices are queued and can be tracked from Document Archive.',
  },
  {
    id: 'faq-7',
    question: 'How do I export a report for the finance team?',
    answer:
      'Most report pages have an Export CSV button in the page header. For consolidated exports, use Reports > Export Reports and choose the report type and date range.',
  },
  {
    id: 'faq-8',
    question: 'How do I reset my accountant portal password?',
    answer:
      'Go to Profile & Settings > Security and click Change Password. If you are locked out, raise a support ticket under the Account Access category.',
  },
]

let ticketCounter = 4102
const TICKETS = [
  {
    id: 'TCK-4101',
    subject: 'Refund stuck in pending for 3 days',
    category: 'Refunds',
    description: 'Refund RFD-4402 for Meera Pillai has been pending approval for 3 days despite being flagged urgent.',
    priority: 'High',
    status: 'in-progress',
    createdAt: daysAgo(2),
  },
  {
    id: 'TCK-4100',
    subject: 'Need help exporting a custom date range report',
    category: 'Reports',
    description: 'Unable to export collection analytics for a custom 45-day range — the export button stays disabled.',
    priority: 'Medium',
    status: 'resolved',
    createdAt: daysAgo(6),
  },
  {
    id: 'TCK-4099',
    subject: 'Fee structure edit not reflecting for new admissions',
    category: 'Fee Structure',
    description: 'Updated Class 9 transport fee, but newly assigned students still show the old amount.',
    priority: 'Low',
    status: 'open',
    createdAt: daysAgo(1),
  },
]

export async function fetchFaqs(query) {
  await delay(400)
  if (!query) return FAQS
  const q = query.toLowerCase()
  return FAQS.filter((faq) => `${faq.question} ${faq.answer}`.toLowerCase().includes(q))
}

export async function fetchTickets() {
  await delay(400)
  return [...TICKETS].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function createTicket(payload) {
  await delay(700)
  ticketCounter += 1
  const ticket = {
    id: `TCK-${ticketCounter}`,
    subject: payload.subject,
    category: payload.category,
    description: payload.description,
    priority: payload.priority,
    status: 'open',
    createdAt: new Date().toISOString(),
  }
  TICKETS.unshift(ticket)
  return ticket
}
