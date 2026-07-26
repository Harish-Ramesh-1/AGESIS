const DELAY_MS = 600

function delay(ms = DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const NOW = Date.now()

function hoursAgo(hours) {
  return new Date(NOW - hours * 60 * 60 * 1000).toISOString()
}

function daysAgo(days) {
  return new Date(NOW - days * 24 * 60 * 60 * 1000).toISOString()
}

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

const LOGS = [
  { id: 'LOG-3021', timestamp: hoursAgo(0.4), actor: 'Kavita Sharma', actionType: 'Payment Recorded', entity: 'Aarav Nair', details: 'Recorded Rs. 45,000 UPI payment against tuition fee (RCT-8801).' },
  { id: 'LOG-3020', timestamp: hoursAgo(1), actor: 'Kavita Sharma', actionType: 'Reminder Sent', entity: 'Kabir Menon', details: 'Sent overdue fee reminder for installment 1 (Rs. 31,000).' },
  { id: 'LOG-3019', timestamp: hoursAgo(2), actor: 'Rohit Verma', actionType: 'Login', entity: 'Accountant Portal', details: 'Signed in from Chrome on Windows, Mumbai.' },
  { id: 'LOG-3018', timestamp: hoursAgo(2.5), actor: 'Rohit Verma', actionType: 'Refund Approved', entity: 'RFD-4402', details: 'Approved refund of Rs. 15,000 for Meera Pillai (Sports Academy withdrawal).' },
  { id: 'LOG-3017', timestamp: hoursAgo(3.2), actor: 'Kavita Sharma', actionType: 'Export Generated', entity: 'Payment History Report', details: 'Exported payment-history.csv covering the last 30 days.' },
  { id: 'LOG-3016', timestamp: hoursAgo(4), actor: 'Ananya Iyer', actionType: 'Student Record Updated', entity: 'Diya Kulkarni', details: 'Updated guardian contact number on the student profile.' },
  { id: 'LOG-3015', timestamp: hoursAgo(5.5), actor: 'Kavita Sharma', actionType: 'Fee Structure Edited', entity: 'Class 9 Fee Structure', details: 'Revised transport fee component from Rs. 14,000 to Rs. 15,000.' },
  { id: 'LOG-3014', timestamp: hoursAgo(7), actor: 'Ananya Iyer', actionType: 'Payment Recorded', entity: 'Ishita Rao', details: 'Recorded Rs. 29,500 Debit Card payment against tuition fee (RCT-8799).' },
  { id: 'LOG-3013', timestamp: daysAgo(1), actor: 'Rohit Verma', actionType: 'Late Fee Waived', entity: 'Yash Kapoor', details: 'Waived Rs. 1,200 late fee citing genuine payment gateway delay.' },
  { id: 'LOG-3012', timestamp: daysAgo(1.2), actor: 'Kavita Sharma', actionType: 'Login', entity: 'Accountant Portal', details: 'Signed in from Safari on macOS, Bengaluru.' },
  { id: 'LOG-3011', timestamp: daysAgo(1.6), actor: 'Kavita Sharma', actionType: 'Refund Rejected', entity: 'RFD-4404', details: 'Rejected refund request for Diya Kulkarni — outside refund policy window.' },
  { id: 'LOG-3010', timestamp: daysAgo(2), actor: 'Ananya Iyer', actionType: 'Student Record Updated', entity: 'Vihaan Pillai', details: 'Updated section from 9-A to 9-B after class transfer.' },
  { id: 'LOG-3009', timestamp: daysAgo(2.4), actor: 'Rohit Verma', actionType: 'Reminder Sent', entity: 'Yash Kapoor', details: 'Sent bulk overdue reminder batch covering 18 students.' },
  { id: 'LOG-3008', timestamp: daysAgo(2.9), actor: 'Kavita Sharma', actionType: 'Payment Recorded', entity: 'Sanya Kapoor', details: 'Recorded Rs. 25,500 Cash payment against tuition fee (RCT-8790).' },
  { id: 'LOG-3007', timestamp: daysAgo(3.3), actor: 'Ananya Iyer', actionType: 'Export Generated', entity: 'Outstanding Dues Report', details: 'Exported outstanding-dues.csv for Class 6 through Class 8.' },
  { id: 'LOG-3006', timestamp: daysAgo(3.8), actor: 'Kavita Sharma', actionType: 'Fee Structure Edited', entity: 'Class 11 Fee Structure', details: 'Added new lab fee component of Rs. 5,000.' },
  { id: 'LOG-3005', timestamp: daysAgo(4.2), actor: 'Rohit Verma', actionType: 'Refund Approved', entity: 'RFD-4405', details: 'Approved refund of Rs. 15,000 for Meera Pillai (duplicate wallet charge).' },
  { id: 'LOG-3004', timestamp: daysAgo(4.7), actor: 'Kavita Sharma', actionType: 'Login', entity: 'Accountant Portal', details: 'Signed in from Chrome on Windows, Mumbai.' },
  { id: 'LOG-3003', timestamp: daysAgo(5.1), actor: 'Ananya Iyer', actionType: 'Student Record Updated', entity: 'Meera Pillai', details: 'Updated parent email address on the student profile.' },
  { id: 'LOG-3002', timestamp: daysAgo(5.6), actor: 'Kavita Sharma', actionType: 'Payment Recorded', entity: 'Vihaan Pillai', details: 'Recorded Rs. 51,000 Credit Card payment against tuition fee (RCT-8789).' },
]

export async function fetchAuditLogs(filters = {}) {
  await delay()
  const { query, actor, actionType, dateFrom, dateTo } = filters
  return LOGS.filter((row) => {
    if (actor && row.actor !== actor) return false
    if (actionType && row.actionType !== actionType) return false
    if (dateFrom && row.timestamp.slice(0, 10) < dateFrom) return false
    if (dateTo && row.timestamp.slice(0, 10) > dateTo) return false
    if (query) {
      const q = query.toLowerCase()
      if (![row.id, row.actor, row.actionType, row.entity, row.details].join(' ').toLowerCase().includes(q)) return false
    }
    return true
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}
