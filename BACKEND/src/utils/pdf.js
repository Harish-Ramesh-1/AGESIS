import PDFDocument from 'pdfkit'

function bufferFromDoc(doc) {
  return new Promise((resolve, reject) => {
    const chunks = []
    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
    doc.end()
  })
}

function drawHeader(doc, { title, docNo, date }) {
  doc.fontSize(20).fillColor('#4f46e5').text('AGESIS School', { continued: false })
  doc.fontSize(10).fillColor('#6b7280').text('www.agesisschool.edu')
  doc.moveDown(1.5)
  doc.fontSize(16).fillColor('#111827').text(title)
  doc.fontSize(10).fillColor('#6b7280').text(`No: ${docNo}`)
  doc.text(`Date: ${date}`)
  doc.moveDown(1)
  doc.strokeColor('#e5e7eb').moveTo(50, doc.y).lineTo(545, doc.y).stroke()
  doc.moveDown(1)
}

function drawStudent(doc, student) {
  doc.fontSize(11).fillColor('#111827').text(`Student: ${student.full_name || ''}`)
  doc.fontSize(10).fillColor('#6b7280').text(`Admission No: ${student.admission_no || ''}`)
  doc.text(`Class: ${student.class_name || ''}${student.section ? ' - ' + student.section : ''}`)
  doc.moveDown(1)
}

function drawItemsTable(doc, items) {
  doc.fontSize(10).fillColor('#111827')
  const startY = doc.y
  doc.font('Helvetica-Bold')
  doc.text('Description', 50, startY, { width: 350 })
  doc.text('Amount', 420, startY, { width: 120, align: 'right' })
  doc.moveDown(0.5)
  doc.strokeColor('#e5e7eb').moveTo(50, doc.y).lineTo(545, doc.y).stroke()
  doc.moveDown(0.3)
  doc.font('Helvetica')

  items.forEach((item) => {
    const rowY = doc.y
    doc.text(item.category || item.description || item.label || 'Item', 50, rowY, { width: 350 })
    doc.text(Number(item.amount || 0).toFixed(2), 420, rowY, { width: 120, align: 'right' })
    doc.moveDown(0.5)
  })
  doc.moveDown(0.5)
  doc.strokeColor('#e5e7eb').moveTo(50, doc.y).lineTo(545, doc.y).stroke()
  doc.moveDown(0.5)
}

function drawTotals(doc, totals) {
  doc.font('Helvetica')
  totals.forEach(({ label, value, bold }) => {
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica')
    doc.fontSize(bold ? 12 : 10)
    doc.text(`${label}:`, 350, doc.y, { continued: true, width: 120 })
    doc.text(` ${Number(value).toFixed(2)}`, { align: 'right' })
  })
}

export async function generateInvoicePdf({ invoice, student }) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' })
  drawHeader(doc, { title: 'Fee Invoice', docNo: invoice.invoice_no, date: new Date(invoice.created_at).toLocaleDateString() })
  drawStudent(doc, student)
  drawItemsTable(doc, invoice.items || [])
  drawTotals(doc, [
    { label: 'Subtotal', value: invoice.subtotal },
    { label: 'Tax', value: invoice.tax },
    { label: 'Total', value: invoice.total, bold: true },
  ])
  doc.moveDown(2)
  doc.fontSize(9).fillColor('#9ca3af').text(`Due date: ${invoice.due_date || '—'}`, 50)
  return bufferFromDoc(doc)
}

export async function generateReceiptPdf({ receipt, student }) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' })
  drawHeader(doc, { title: 'Payment Receipt', docNo: receipt.receipt_no, date: new Date(receipt.created_at).toLocaleDateString() })
  drawStudent(doc, student)
  drawItemsTable(doc, receipt.items || [{ description: 'Fee Payment', amount: receipt.amount }])
  drawTotals(doc, [{ label: 'Amount Paid', value: receipt.amount, bold: true }])
  doc.moveDown(2)
  doc.fontSize(9).fillColor('#9ca3af').text('This is a system-generated receipt.', 50)
  return bufferFromDoc(doc)
}
