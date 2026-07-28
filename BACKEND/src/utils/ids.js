function randomSegment(length = 5) {
  return Math.random().toString(36).slice(2, 2 + length).toUpperCase()
}

function datePart() {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`
}

export const generateReferenceNo = (prefix) => `${prefix}-${datePart()}-${randomSegment()}`
export const generateInvoiceNo = () => generateReferenceNo('INV')
export const generateReceiptNo = () => generateReferenceNo('RCT')
export const generatePaymentRef = () => generateReferenceNo('PAY')
export const generateTicketNo = () => generateReferenceNo('TKT')
