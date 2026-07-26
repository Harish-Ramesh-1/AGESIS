import { useState } from 'react'
import { Download, Mail, Printer, QrCode } from 'lucide-react'
import { PrimaryButton, SecondaryButton, GlassButton } from '../../../components/common/Button'
import { downloadTextFile } from '../../../utils/downloadTextFile'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatDate } from '../../../utils/formatDate'
import agesisLogo from '../../../assets/logos/agesis-logo.svg'

export default function InvoicePreview({ invoice, onPrint, onDownload, showActions = true }) {
  const [emailSent, setEmailSent] = useState(false)

  if (!invoice) return null

  const componentsTotal = invoice.feeComponents.reduce((sum, item) => sum + item.amount, 0)
  const total = componentsTotal - (invoice.discount ?? 0) - (invoice.scholarship ?? 0) + (invoice.lateFee ?? 0) + (invoice.tax ?? 0)

  function handleDownload() {
    downloadTextFile(
      `${invoice.id ?? 'invoice-draft'}.txt`,
      [
        'AGESIS International School',
        'Fee Invoice',
        '',
        `Invoice No.: ${invoice.id ?? 'Pending generation'}`,
        `Invoice Date: ${formatDate(invoice.invoiceDate)}`,
        `Due Date: ${formatDate(invoice.dueDate)}`,
        `Student: ${invoice.studentName} (${invoice.registrationNumber})`,
        `Class: ${invoice.className}`,
        `Academic Year: ${invoice.academicYear}`,
        '',
        ...invoice.feeComponents.map((item) => `${item.label}: ${formatCurrency(item.amount)}`),
        invoice.discount ? `Discount: -${formatCurrency(invoice.discount)}` : null,
        invoice.scholarship ? `Scholarship: -${formatCurrency(invoice.scholarship)}` : null,
        invoice.lateFee ? `Late Fee: +${formatCurrency(invoice.lateFee)}` : null,
        invoice.tax ? `Tax: +${formatCurrency(invoice.tax)}` : null,
        `Total Payable: ${formatCurrency(total)}`,
        invoice.notes ? `\nNotes: ${invoice.notes}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    )
    onDownload?.()
  }

  function handlePrint() {
    window.print()
    onPrint?.()
  }

  return (
    <div className="rounded-clay border border-white/50 bg-white/95 p-6 shadow-glass dark:border-white/10 dark:bg-slate-900/95 sm:p-8">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 pb-4 dark:border-white/10">
        <div className="flex items-center gap-3">
          <img src={agesisLogo} alt="AGESIS logo" className="h-10 w-10 rounded-lg" />
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">AGESIS International School</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Whitefield Campus, Bengaluru</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-slate-900 dark:text-white">INVOICE</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{invoice.id ?? 'Draft — not yet generated'}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Student</p>
          <p className="font-medium text-slate-800 dark:text-slate-100">{invoice.studentName}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Class</p>
          <p className="font-medium text-slate-800 dark:text-slate-100">{invoice.className}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Invoice Date</p>
          <p className="font-medium text-slate-800 dark:text-slate-100">{formatDate(invoice.invoiceDate)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Due Date</p>
          <p className="font-medium text-slate-800 dark:text-slate-100">{formatDate(invoice.dueDate)}</p>
        </div>
      </div>

      <table className="mt-5 w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200/70 dark:border-white/10">
            <th className="py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Fee Component</th>
            <th className="py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.feeComponents.map((item) => (
            <tr key={item.label} className="border-b border-slate-100/80 dark:border-white/5">
              <td className="py-2 text-slate-700 dark:text-slate-200">{item.label}</td>
              <td className="py-2 text-right text-slate-700 dark:text-slate-200">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
          {invoice.discount > 0 && (
            <tr className="border-b border-slate-100/80 dark:border-white/5">
              <td className="py-2 text-slate-700 dark:text-slate-200">Discount</td>
              <td className="py-2 text-right text-emerald-600 dark:text-emerald-400">-{formatCurrency(invoice.discount)}</td>
            </tr>
          )}
          {invoice.scholarship > 0 && (
            <tr className="border-b border-slate-100/80 dark:border-white/5">
              <td className="py-2 text-slate-700 dark:text-slate-200">Scholarship</td>
              <td className="py-2 text-right text-emerald-600 dark:text-emerald-400">-{formatCurrency(invoice.scholarship)}</td>
            </tr>
          )}
          {invoice.lateFee > 0 && (
            <tr className="border-b border-slate-100/80 dark:border-white/5">
              <td className="py-2 text-slate-700 dark:text-slate-200">Late Fee</td>
              <td className="py-2 text-right text-red-600 dark:text-red-400">+{formatCurrency(invoice.lateFee)}</td>
            </tr>
          )}
          {invoice.tax > 0 && (
            <tr className="border-b border-slate-100/80 dark:border-white/5">
              <td className="py-2 text-slate-700 dark:text-slate-200">Tax</td>
              <td className="py-2 text-right text-slate-700 dark:text-slate-200">+{formatCurrency(invoice.tax)}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-brand-50/70 px-4 py-3 dark:bg-brand-500/10">
        <p className="text-sm font-semibold text-brand-800 dark:text-brand-200">Total Payable</p>
        <p className="text-xl font-bold text-brand-800 dark:text-brand-200">{formatCurrency(total)}</p>
      </div>

      {invoice.notes && <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Notes: {invoice.notes}</p>}

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4 border-t border-slate-200/70 pt-4 dark:border-white/10">
        <div className="max-w-sm text-[11px] text-slate-400 dark:text-slate-500">
          <p className="mb-1 font-semibold text-slate-500 dark:text-slate-400">Payment Instructions</p>
          <p>Pay online via the parent portal, or at the accounts office by cash, cheque or demand draft in favour of &quot;AGESIS International School&quot;.</p>
          <p className="mt-2 font-semibold text-slate-500 dark:text-slate-400">Terms &amp; Conditions</p>
          <p>Payment is due by the date above. Late payments may attract a penalty as per the school&apos;s fee policy.</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400 dark:border-white/15 dark:text-slate-500">
            <QrCode className="h-8 w-8" aria-hidden="true" />
          </span>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Scan to verify</p>
        </div>
      </div>

      {showActions && (
        <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200/70 pt-4 dark:border-white/10 print:hidden">
          <PrimaryButton fullWidth={false} onClick={handleDownload}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Download PDF
          </PrimaryButton>
          <SecondaryButton fullWidth={false} onClick={handlePrint}>
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print
          </SecondaryButton>
          <GlassButton onClick={() => setEmailSent(true)} disabled={emailSent}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            {emailSent ? 'Emailed' : 'Email Invoice'}
          </GlassButton>
        </div>
      )}
    </div>
  )
}
