const DELAY_MS = 550
const ACCOUNTANT_NAME = 'Kavita Sharma'
const SCHOOL_NAME = 'AGESIS International School'

function delay(ms = DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function initialsOf(name) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

export const MOCK_STUDENTS = [
  { id: 'std-1', name: 'Aarav Nair', registrationNumber: 'P-12345', admissionNumber: 'ADM-2019-0456', className: '8', section: 'B', parentName: 'Rajesh Nair', parentPhone: '+91 90000 11111', parentEmail: 'rajesh.nair@example.com', academicYear: '2025-2026', feeComponents: [{ label: 'Tuition Fee', amount: 30000 }, { label: 'Transport Fee', amount: 15000 }], pendingAmount: 45000, installments: ['Installment 1 of 2', 'Installment 2 of 2'] },
  { id: 'std-2', name: 'Kabir Menon', registrationNumber: 'P-10456', admissionNumber: 'ADM-2017-0198', className: '10', section: 'C', parentName: 'Prakash Menon', parentPhone: '+91 97400 11298', parentEmail: 'prakash.menon@example.com', academicYear: '2025-2026', feeComponents: [{ label: 'Tuition Fee', amount: 45000 }, { label: 'Hostel Fee', amount: 17000 }], pendingAmount: 62000, installments: ['Installment 1 of 2', 'Installment 2 of 2'] },
  { id: 'std-3', name: 'Diya Kulkarni', registrationNumber: 'P-11023', admissionNumber: 'ADM-2021-0567', className: '6', section: 'A', parentName: 'Manoj Kulkarni', parentPhone: '+91 98450 12233', parentEmail: 'manoj.kulkarni@example.com', academicYear: '2025-2026', feeComponents: [{ label: 'Tuition Fee', amount: 38500 }], pendingAmount: 38500, installments: ['Full Balance'] },
  { id: 'std-4', name: 'Sanya Kapoor', registrationNumber: 'P-10998', admissionNumber: 'ADM-2020-0345', className: '9', section: 'A', parentName: 'Vikram Kapoor', parentPhone: '+91 99000 55667', parentEmail: 'vikram.kapoor@example.com', academicYear: '2025-2026', feeComponents: [{ label: 'Tuition Fee', amount: 36000 }, { label: 'Transport Fee', amount: 15000 }], pendingAmount: 51000, installments: ['Installment 1 of 2', 'Installment 2 of 2'] },
  { id: 'std-5', name: 'Vihaan Pillai', registrationNumber: 'P-10777', admissionNumber: 'ADM-2019-0289', className: '9', section: 'B', parentName: 'Anand Pillai', parentPhone: '+91 90000 33445', parentEmail: 'anand.pillai@example.com', academicYear: '2025-2026', feeComponents: [{ label: 'Tuition Fee', amount: 51000 }, { label: 'Hostel Fee', amount: 27000 }], pendingAmount: 0, installments: [] },
  { id: 'std-6', name: 'Ishita Rao', registrationNumber: 'P-10912', admissionNumber: 'ADM-2019-0334', className: '7', section: 'A', parentName: 'Ganesh Rao', parentPhone: '+91 98765 43299', parentEmail: 'ganesh.rao@example.com', academicYear: '2025-2026', feeComponents: [{ label: 'Tuition Fee', amount: 29500 }], pendingAmount: 29500, installments: ['Full Balance'] },
  { id: 'std-7', name: 'Yash Kapoor', registrationNumber: 'P-10345', admissionNumber: 'ADM-2017-0145', className: '9', section: 'A', parentName: 'Sanjay Kapoor', parentPhone: '+91 98450 12233', parentEmail: 'sanjay.kapoor@example.com', academicYear: '2025-2026', feeComponents: [{ label: 'Tuition Fee', amount: 51000 }, { label: 'Hostel Fee', amount: 17000 }], pendingAmount: 68000, installments: ['Installment 1 of 2', 'Installment 2 of 2'] },
  { id: 'std-8', name: 'Meera Pillai', registrationNumber: 'P-10765', admissionNumber: 'ADM-2016-0089', className: '11', section: 'B', parentName: 'Girish Pillai', parentPhone: '+91 90000 44556', parentEmail: 'girish.pillai@example.com', academicYear: '2025-2026', feeComponents: [{ label: 'Tuition Fee', amount: 62000 }], pendingAmount: 0, installments: [] },
  { id: 'std-9', name: 'Reyansh Bhat', registrationNumber: 'P-10654', admissionNumber: 'ADM-2016-0102', className: '11', section: 'A', parentName: 'Deepak Bhat', parentPhone: '+91 99870 66554', parentEmail: 'deepak.bhat@example.com', academicYear: '2025-2026', feeComponents: [{ label: 'Tuition Fee', amount: 61000 }, { label: 'Hostel Fee', amount: 17000 }], pendingAmount: 78000, installments: ['Full Balance'] },
  { id: 'std-10', name: 'Saanvi Joshi', registrationNumber: 'P-10589', admissionNumber: 'ADM-2018-0267', className: '6', section: 'B', parentName: 'Ramesh Joshi', parentPhone: '+91 90080 44521', parentEmail: 'ramesh.joshi@example.com', academicYear: '2025-2026', feeComponents: [{ label: 'Tuition Fee', amount: 41500 }], pendingAmount: 41500, installments: ['Full Balance'] },
].map((student) => ({ ...student, avatarInitials: initialsOf(student.name) }))

let invoiceCounter = 3040
export const MOCK_INVOICES = [
  { id: 'INV-3038', studentId: 'std-1', studentName: 'Aarav Nair', registrationNumber: 'P-12345', className: '8-B', academicYear: '2025-2026', invoiceDate: '2026-07-20', dueDate: '2026-08-02', totalAmount: 45000, status: 'sent', createdBy: ACCOUNTANT_NAME, createdDate: '2026-07-20T09:00:00Z', fileSizeKb: 142 },
  { id: 'INV-3037', studentId: 'std-2', studentName: 'Kabir Menon', registrationNumber: 'P-10456', className: '10-C', academicYear: '2025-2026', invoiceDate: '2026-07-18', dueDate: '2026-07-10', totalAmount: 62000, status: 'generated', createdBy: ACCOUNTANT_NAME, createdDate: '2026-07-18T11:20:00Z', fileSizeKb: 138 },
  { id: 'INV-3036', studentId: 'std-4', studentName: 'Sanya Kapoor', registrationNumber: 'P-10998', className: '9-A', academicYear: '2025-2026', invoiceDate: '2026-07-15', dueDate: '2026-08-02', totalAmount: 51000, status: 'downloaded', createdBy: ACCOUNTANT_NAME, createdDate: '2026-07-15T10:00:00Z', fileSizeKb: 140 },
  { id: 'INV-3035', studentId: 'std-7', studentName: 'Yash Kapoor', registrationNumber: 'P-10345', className: '9-A', academicYear: '2025-2026', invoiceDate: '2026-07-10', dueDate: '2026-06-20', totalAmount: 68000, status: 'printed', createdBy: ACCOUNTANT_NAME, createdDate: '2026-07-10T14:30:00Z', fileSizeKb: 145 },
  { id: 'INV-3034', studentId: 'std-3', studentName: 'Diya Kulkarni', registrationNumber: 'P-11023', className: '6-A', academicYear: '2025-2026', invoiceDate: '2026-07-05', dueDate: '2026-07-15', totalAmount: 38500, status: 'archived', createdBy: ACCOUNTANT_NAME, createdDate: '2026-07-05T09:15:00Z', fileSizeKb: 133 },
  { id: 'INV-3033', studentId: 'std-9', studentName: 'Reyansh Bhat', registrationNumber: 'P-10654', className: '11-A', academicYear: '2025-2026', invoiceDate: '2026-06-28', dueDate: '2026-08-05', totalAmount: 78000, status: 'draft', createdBy: ACCOUNTANT_NAME, createdDate: '2026-06-28T16:00:00Z', fileSizeKb: 0 },
]

let receiptCounter = 8801
export const MOCK_RECEIPTS = [
  { id: 'RCT-8800', transactionId: 'TXN-58230', studentId: 'std-8', studentName: 'Meera Pillai', registrationNumber: 'P-10765', paymentDate: '2026-07-24T09:05:00Z', paymentMethod: 'Credit Card', paidAmount: 62000, balanceAmount: 0, remarks: '', status: 'sent', createdBy: ACCOUNTANT_NAME, createdDate: '2026-07-24T09:05:00Z', fileSizeKb: 96 },
  { id: 'RCT-8799', transactionId: 'TXN-58229', studentId: 'std-6', studentName: 'Ishita Rao', registrationNumber: 'P-10912', paymentDate: '2026-07-24T08:40:00Z', paymentMethod: 'Debit Card', paidAmount: 29500, balanceAmount: 0, remarks: '', status: 'downloaded', createdBy: ACCOUNTANT_NAME, createdDate: '2026-07-24T08:40:00Z', fileSizeKb: 94 },
  { id: 'RCT-8798', transactionId: 'TXN-58228', studentId: 'std-4', studentName: 'Sanya Kapoor', registrationNumber: 'P-10998', paymentDate: '2026-07-23T15:20:00Z', paymentMethod: 'Cash', paidAmount: 25500, balanceAmount: 25500, remarks: 'Partial payment of installment 1', status: 'generated', createdBy: ACCOUNTANT_NAME, createdDate: '2026-07-23T15:20:00Z', fileSizeKb: 98 },
  { id: 'RCT-8797', transactionId: 'TXN-58227', studentId: 'std-5', studentName: 'Vihaan Pillai', registrationNumber: 'P-10777', paymentDate: '2026-07-23T11:58:00Z', paymentMethod: 'UPI', paidAmount: 78000, balanceAmount: 0, remarks: '', status: 'printed', createdBy: ACCOUNTANT_NAME, createdDate: '2026-07-23T11:58:00Z', fileSizeKb: 99 },
  { id: 'RCT-8796', transactionId: 'TXN-58226', studentId: 'std-3', studentName: 'Diya Kulkarni', registrationNumber: 'P-11023', paymentDate: '2026-07-22T14:10:00Z', paymentMethod: 'Cheque', paidAmount: 12000, balanceAmount: 26500, remarks: 'Cheque no. 445210', status: 'archived', createdBy: ACCOUNTANT_NAME, createdDate: '2026-07-22T14:10:00Z', fileSizeKb: 90 },
  { id: 'RCT-8795', transactionId: 'TXN-58224', studentId: 'std-7', studentName: 'Yash Kapoor', registrationNumber: 'P-10345', paymentDate: '2026-07-20T09:30:00Z', paymentMethod: 'Net Banking', paidAmount: 34000, balanceAmount: 34000, remarks: '', status: 'sent', createdBy: ACCOUNTANT_NAME, createdDate: '2026-07-20T09:30:00Z', fileSizeKb: 95 },
]

export const BULK_CANDIDATES = [
  { id: 'bc-1', studentId: 'std-1', studentName: 'Aarav Nair', registrationNumber: 'P-12345', className: '8', section: 'B', feeCategory: 'Tuition Fee', installment: 'Installment 2 of 2', feeStatus: 'pending', amount: 22500 },
  { id: 'bc-2', studentId: 'std-2', studentName: 'Kabir Menon', registrationNumber: 'P-10456', className: '10', section: 'C', feeCategory: 'Hostel Fee', installment: 'Installment 1 of 2', feeStatus: 'overdue', amount: 31000 },
  { id: 'bc-3', studentId: 'std-3', studentName: 'Diya Kulkarni', registrationNumber: 'P-11023', className: '6', section: 'A', feeCategory: 'Tuition Fee', installment: 'Full Balance', feeStatus: 'overdue', amount: 38500 },
  { id: 'bc-4', studentId: 'std-4', studentName: 'Sanya Kapoor', registrationNumber: 'P-10998', className: '9', section: 'A', feeCategory: 'Transport Fee', installment: 'Installment 2 of 2', feeStatus: 'pending', amount: 25500 },
  { id: 'bc-5', studentId: 'std-6', studentName: 'Ishita Rao', registrationNumber: 'P-10912', className: '7', section: 'A', feeCategory: 'Tuition Fee', installment: 'Full Balance', feeStatus: 'pending', amount: 29500 },
  { id: 'bc-6', studentId: 'std-7', studentName: 'Yash Kapoor', registrationNumber: 'P-10345', className: '9', section: 'A', feeCategory: 'Hostel Fee', installment: 'Installment 1 of 2', feeStatus: 'overdue', amount: 34000 },
  { id: 'bc-7', studentId: 'std-9', studentName: 'Reyansh Bhat', registrationNumber: 'P-10654', className: '11', section: 'A', feeCategory: 'Hostel Fee', installment: 'Full Balance', feeStatus: 'pending', amount: 78000 },
  { id: 'bc-8', studentId: 'std-10', studentName: 'Saanvi Joshi', registrationNumber: 'P-10589', className: '6', section: 'B', feeCategory: 'Tuition Fee', installment: 'Full Balance', feeStatus: 'overdue', amount: 41500 },
]

const activityLog = new Map()
function logActivity(docId, action) {
  const entries = activityLog.get(docId) ?? []
  entries.unshift({ id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, action, by: ACCOUNTANT_NAME, date: new Date().toISOString() })
  activityLog.set(docId, entries)
}

MOCK_INVOICES.forEach((invoice) => logActivity(invoice.id, 'Created'))
MOCK_RECEIPTS.forEach((receipt) => logActivity(receipt.id, 'Created'))

function applyDocFilters(rows, filters = {}) {
  const { query, status, className, section } = filters
  return rows.filter((row) => {
    if (query) {
      const q = query.toLowerCase()
      const haystack = [row.id, row.studentName, row.registrationNumber, row.transactionId].filter(Boolean).join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    if (status && row.status !== status) return false
    if (className && row.className && !row.className.startsWith(className)) return false
    if (section && row.className && !row.className.endsWith(section)) return false
    return true
  })
}

export async function fetchStudentsForDocument(query) {
  await delay(350)
  if (!query) return []
  const q = query.toLowerCase()
  return MOCK_STUDENTS.filter((student) => [student.name, student.registrationNumber, student.admissionNumber, student.parentName, student.parentPhone].join(' ').toLowerCase().includes(q))
}

export async function fetchInvoices(filters) {
  await delay()
  return applyDocFilters(MOCK_INVOICES, filters)
}

export async function generateInvoice(payload) {
  await delay(900)
  invoiceCounter += 1
  const id = `INV-${invoiceCounter}`
  const record = {
    id,
    studentId: payload.studentId,
    studentName: payload.studentName,
    registrationNumber: payload.registrationNumber,
    className: payload.className,
    academicYear: payload.academicYear,
    invoiceDate: payload.invoiceDate,
    dueDate: payload.dueDate,
    feeComponents: payload.feeComponents,
    discount: payload.discount ?? 0,
    scholarship: payload.scholarship ?? 0,
    lateFee: payload.lateFee ?? 0,
    tax: payload.tax ?? 0,
    notes: payload.notes ?? '',
    totalAmount: payload.totalAmount,
    status: payload.isDraft ? 'draft' : 'generated',
    createdBy: ACCOUNTANT_NAME,
    createdDate: new Date().toISOString(),
    fileSizeKb: payload.isDraft ? 0 : 128 + Math.round(Math.random() * 30),
  }
  MOCK_INVOICES.unshift(record)
  logActivity(id, payload.isDraft ? 'Saved as Draft' : 'Generated')
  return record
}

export async function generateBulkInvoices(payload) {
  await delay(1400)
  const results = payload.candidates.map((candidate) => {
    invoiceCounter += 1
    const id = `INV-${invoiceCounter}`
    const success = Math.random() > 0.12
    if (success) {
      const record = {
        id,
        studentId: candidate.studentId,
        studentName: candidate.studentName,
        registrationNumber: candidate.registrationNumber,
        className: `${candidate.className}-${candidate.section}`,
        academicYear: '2025-2026',
        invoiceDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date().toISOString().slice(0, 10),
        totalAmount: candidate.amount,
        status: 'generated',
        createdBy: ACCOUNTANT_NAME,
        createdDate: new Date().toISOString(),
        fileSizeKb: 128 + Math.round(Math.random() * 30),
      }
      MOCK_INVOICES.unshift(record)
      logActivity(id, 'Generated via bulk run')
    }
    return { candidateId: candidate.id, studentName: candidate.studentName, invoiceId: success ? id : null, success }
  })
  return results
}

export async function fetchInvoiceById(id) {
  await delay(300)
  const record = MOCK_INVOICES.find((item) => item.id === id)
  if (!record) throw new Error('Invoice not found')
  return record
}

export async function fetchReceipts(filters) {
  await delay()
  return applyDocFilters(MOCK_RECEIPTS, filters)
}

export async function generateReceipt(payload) {
  await delay(900)
  receiptCounter += 1
  const id = `RCT-${receiptCounter}`
  const record = {
    id,
    transactionId: payload.transactionId,
    studentId: payload.studentId,
    studentName: payload.studentName,
    registrationNumber: payload.registrationNumber,
    paymentDate: payload.paymentDate,
    paymentMethod: payload.paymentMethod,
    feeComponents: payload.feeComponents,
    paidAmount: payload.paidAmount,
    balanceAmount: payload.balanceAmount,
    remarks: payload.remarks ?? '',
    status: 'generated',
    createdBy: ACCOUNTANT_NAME,
    createdDate: new Date().toISOString(),
    fileSizeKb: 90 + Math.round(Math.random() * 20),
  }
  MOCK_RECEIPTS.unshift(record)
  logActivity(id, 'Generated')
  return record
}

export async function fetchReceiptById(id) {
  await delay(300)
  const record = MOCK_RECEIPTS.find((item) => item.id === id)
  if (!record) throw new Error('Receipt not found')
  return record
}

function toDocument(row, type) {
  return {
    documentNumber: row.id,
    documentType: type,
    studentName: row.studentName,
    registrationNumber: row.registrationNumber,
    generatedDate: row.createdDate,
    createdBy: row.createdBy,
    status: row.status,
    fileSizeKb: row.fileSizeKb,
    className: row.className,
    totalAmount: type === 'invoice' ? row.totalAmount : row.paidAmount,
  }
}

export async function fetchDocuments(filters) {
  await delay(600)
  const documents = [...MOCK_INVOICES.map((row) => toDocument(row, 'invoice')), ...MOCK_RECEIPTS.map((row) => toDocument(row, 'receipt'))].sort(
    (a, b) => new Date(b.generatedDate) - new Date(a.generatedDate),
  )
  const { documentType } = filters ?? {}
  const scoped = documentType ? documents.filter((doc) => doc.documentType === documentType) : documents
  return applyDocFilters(scoped, filters)
}

export async function fetchDocumentById(id) {
  await delay(300)
  const invoice = MOCK_INVOICES.find((item) => item.id === id)
  if (invoice) return { ...toDocument(invoice, 'invoice'), source: invoice }
  const receipt = MOCK_RECEIPTS.find((item) => item.id === id)
  if (receipt) return { ...toDocument(receipt, 'receipt'), source: receipt }
  throw new Error('Document not found')
}

export async function fetchDocumentActivity(id) {
  await delay(300)
  return activityLog.get(id) ?? []
}

export async function emailDocument(id, payload) {
  await delay(700)
  logActivity(id, `Emailed to ${payload.email}`)
  const invoice = MOCK_INVOICES.find((item) => item.id === id)
  if (invoice) invoice.status = 'sent'
  const receipt = MOCK_RECEIPTS.find((item) => item.id === id)
  if (receipt) receipt.status = 'sent'
  return { success: true }
}

export async function shareDocument(id) {
  await delay(500)
  logActivity(id, 'Share link generated')
  return { success: true, link: `https://agesis.school/documents/${id.toLowerCase()}` }
}

export async function markDownloaded(id) {
  logActivity(id, 'Downloaded')
  const invoice = MOCK_INVOICES.find((item) => item.id === id)
  if (invoice && invoice.status === 'generated') invoice.status = 'downloaded'
  const receipt = MOCK_RECEIPTS.find((item) => item.id === id)
  if (receipt && receipt.status === 'generated') receipt.status = 'downloaded'
}

export async function markPrinted(id) {
  logActivity(id, 'Printed')
  const invoice = MOCK_INVOICES.find((item) => item.id === id)
  if (invoice) invoice.status = 'printed'
  const receipt = MOCK_RECEIPTS.find((item) => item.id === id)
  if (receipt) receipt.status = 'printed'
}

export async function deleteDocument(id) {
  await delay(500)
  const invoiceIndex = MOCK_INVOICES.findIndex((item) => item.id === id)
  if (invoiceIndex >= 0) MOCK_INVOICES.splice(invoiceIndex, 1)
  const receiptIndex = MOCK_RECEIPTS.findIndex((item) => item.id === id)
  if (receiptIndex >= 0) MOCK_RECEIPTS.splice(receiptIndex, 1)
  activityLog.delete(id)
  return { success: true }
}

export { SCHOOL_NAME, ACCOUNTANT_NAME }
