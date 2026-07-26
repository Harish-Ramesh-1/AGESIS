import { useState } from 'react'
import { CheckCircle2, Copy, Download, Mail, Printer, QrCode } from 'lucide-react'
import { useDocumentViewerStore } from '../store/documentViewerStore'
import { PrimaryButton, SecondaryButton, GlassButton } from '../../../components/common/Button'
import { downloadTextFile } from '../../../utils/downloadTextFile'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatDate } from '../../../utils/formatDate'
import { ACCOUNTANT_NAME } from '../services/documentsService'
import agesisLogo from '../../../assets/logos/agesis-logo.svg'

export default function ReceiptPreview({ receipt, studentMeta, showActions = true }) {
  const [emailSent, setEmailSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const share = useDocumentViewerStore((state) => state.share)
  const shareLink = useDocumentViewerStore((state) => state.shareLink)

  if (!receipt) return null

  function handleDownload() {
    downloadTextFile(
      `${receipt.id ?? 'receipt-draft'}.txt`,
      [
        'AGESIS International School',
        'Fee Payment Receipt',
        '',
        `Receipt No.: ${receipt.id ?? 'Pending generation'}`,
        `Transaction Ref.: ${receipt.transactionId}`,
        `Date: ${formatDate(receipt.paymentDate)}`,
        `Student: ${receipt.studentName} (${receipt.registrationNumber})`,
        `Payment Method: ${receipt.paymentMethod}`,
        `Collected By: ${ACCOUNTANT_NAME}`,
        '',
        ...(receipt.feeComponents ?? []).map((item) => `${item.label}: ${formatCurrency(item.amount)}`),
        `Paid Amount: ${formatCurrency(receipt.paidAmount)}`,
        `Balance Amount: ${formatCurrency(receipt.balanceAmount)}`,
        receipt.remarks ? `Remarks: ${receipt.remarks}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    )
  }

  async function handleShare() {
    if (!receipt.id) return
    await share(receipt.id)
  }

  function handleCopyLink() {
    if (shareLink) navigator.clipboard?.writeText(shareLink)
    setCopied(true)
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
          <p className="text-lg font-bold text-slate-900 dark:text-white">RECEIPT</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{receipt.id ?? 'Draft — not yet generated'}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Student</p>
          <p className="font-medium text-slate-800 dark:text-slate-100">
            {receipt.studentName}
            {studentMeta ? ` · ${studentMeta}` : ''}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Transaction Ref.</p>
          <p className="font-medium text-slate-800 dark:text-slate-100">{receipt.transactionId}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Payment Date</p>
          <p className="font-medium text-slate-800 dark:text-slate-100">{formatDate(receipt.paymentDate)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Payment Method</p>
          <p className="font-medium text-slate-800 dark:text-slate-100">{receipt.paymentMethod}</p>
        </div>
      </div>

      {receipt.feeComponents?.length > 0 && (
        <table className="mt-5 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200/70 dark:border-white/10">
              <th className="py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Fee Component</th>
              <th className="py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Amount</th>
            </tr>
          </thead>
          <tbody>
            {receipt.feeComponents.map((item) => (
              <tr key={item.label} className="border-b border-slate-100/80 dark:border-white/5">
                <td className="py-2 text-slate-700 dark:text-slate-200">{item.label}</td>
                <td className="py-2 text-right text-slate-700 dark:text-slate-200">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-500/10">
          <p className="text-xs text-emerald-700 dark:text-emerald-300">Paid Amount</p>
          <p className="text-xl font-bold text-emerald-800 dark:text-emerald-200">{formatCurrency(receipt.paidAmount)}</p>
        </div>
        <div className="rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-500/10">
          <p className="text-xs text-amber-700 dark:text-amber-300">Balance Amount</p>
          <p className="text-xl font-bold text-amber-800 dark:text-amber-200">{formatCurrency(receipt.balanceAmount)}</p>
        </div>
      </div>

      {receipt.remarks && <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Remarks: {receipt.remarks}</p>}

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-slate-200/70 pt-4 dark:border-white/10">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Digital Signature</p>
          <p className="mt-1 font-serif text-lg italic text-slate-700 dark:text-slate-200">{ACCOUNTANT_NAME}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Accounts Department</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400 dark:border-white/15 dark:text-slate-500">
            <QrCode className="h-8 w-8" aria-hidden="true" />
          </span>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">QR Verification</p>
        </div>
      </div>

      {showActions && (
        <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200/70 pt-4 dark:border-white/10 print:hidden">
          <PrimaryButton fullWidth={false} onClick={handleDownload}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Download PDF
          </PrimaryButton>
          <SecondaryButton fullWidth={false} onClick={() => window.print()}>
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print
          </SecondaryButton>
          <GlassButton onClick={() => setEmailSent(true)} disabled={emailSent}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            {emailSent ? 'Emailed' : 'Email Receipt'}
          </GlassButton>
          {shareLink ? (
            <GlassButton onClick={handleCopyLink}>
              {copied ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? 'Link Copied' : 'Copy Share Link'}
            </GlassButton>
          ) : (
            <GlassButton onClick={handleShare}>
              <Copy className="h-4 w-4" aria-hidden="true" />
              Share Receipt
            </GlassButton>
          )}
        </div>
      )}
    </div>
  )
}
