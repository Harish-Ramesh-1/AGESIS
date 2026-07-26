export async function downloadPdf(filename, title, lines) {
  // Loaded on demand — jsPDF pulls in html2canvas and drags the initial bundle
  // up by ~500kB, so it's only worth paying for once someone downloads a PDF.
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text(title, 14, 20)
  doc.setFontSize(10)
  doc.setTextColor(100)
  let y = 32
  lines.forEach((line) => {
    doc.text(String(line), 14, y)
    y += 8
  })
  doc.save(filename)
}

export function downloadCsv(filename, headers, rows) {
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function printContent(title, lines) {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer')
  if (!printWindow) return
  printWindow.document.write(
    `<html><head><title>${title}</title></head><body style="font-family: sans-serif; padding: 32px; color: #1e293b;">` +
      `<h2>${title}</h2>${lines.map((line) => `<p>${line}</p>`).join('')}</body></html>`,
  )
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}
