import { useState } from 'react'
import { CheckCircle2, Download, Mail, Printer } from 'lucide-react'
import { PrimaryButton, SecondaryButton, GlassButton } from '../../../../components/common/Button'
import { downloadTextFile } from '../../../../utils/downloadTextFile'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { formatDate } from '../../../../utils/formatDate'
import agesisLogo from '../../../../assets/logos/agesis-logo.svg'

export default function ReceiptPreview({ receipt, studentMeta, showSuccessBanner = false }) {
  const [emailSent, setEmailSent] = useState(false)

  function handleDownload() {
    downloadTextFile(
      `${receipt.receiptNumber}.txt`,
      [
        'AGESIS International School',
        'Fee Payment Receipt',
        '',
        `Receipt No.: ${receipt.receiptNumber}`,
        `Transaction ID: ${receipt.id}`,
        `Date: ${formatDate(receipt.date)}`,
        `Student: ${receipt.studentName}`,
        studentMeta ? `Class: ${studentMeta}` : null,
        `Payment Method: ${receipt.method}`,
        `Amount: ${formatCurrency(receipt.amount)}`,
        `Collected By: ${receipt.collectedBy}`,
        receipt.remarks ? `Remarks: ${receipt.remarks}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    )
  }

  return (
    <div className="rounded-clay border border-white/50 bg-white/40 p-6 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]">
      {showSuccessBanner && (
        <div className="mb-5 flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="text-base font-semibold text-slate-900 dark:text-white">Payment recorded successfully</p>
        </div>
      )}

      <div className="flex items-center gap-3 border-b border-slate-200/70 pb-4 dark:border-white/10">
        <img src={agesisLogo} alt="AGESIS logo" className="h-9 w-9 rounded-lg" />
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">AGESIS International School</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Fee Payment Receipt</p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div>
          <dt className="text-xs text-slate-400 dark:text-slate-500">Receipt No.</dt>
          <dd className="font-medium text-slate-700 dark:text-slate-200">{receipt.receiptNumber}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400 dark:text-slate-500">Transaction ID</dt>
          <dd className="font-medium text-slate-700 dark:text-slate-200">{receipt.id}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400 dark:text-slate-500">Date</dt>
          <dd className="font-medium text-slate-700 dark:text-slate-200">{formatDate(receipt.date)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400 dark:text-slate-500">Student</dt>
          <dd className="font-medium text-slate-700 dark:text-slate-200">
            {receipt.studentName}
            {studentMeta ? ` · ${studentMeta}` : ''}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400 dark:text-slate-500">Payment Method</dt>
          <dd className="font-medium text-slate-700 dark:text-slate-200">{receipt.method}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400 dark:text-slate-500">Collected By</dt>
          <dd className="font-medium text-slate-700 dark:text-slate-200">{receipt.collectedBy}</dd>
        </div>
      </dl>

      <div className="mt-5 rounded-xl bg-brand-50/70 px-4 py-3 dark:bg-brand-500/10">
        <p className="text-xs text-brand-700 dark:text-brand-300">Amount Paid</p>
        <p className="mt-0.5 text-2xl font-bold text-brand-800 dark:text-brand-200">{formatCurrency(receipt.amount)}</p>
      </div>

      {receipt.remarks && <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Remarks: {receipt.remarks}</p>}

      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryButton fullWidth={false} onClick={handleDownload}>
          <Download className="h-4 w-4" aria-hidden="true" />
          Generate Receipt
        </PrimaryButton>
        <SecondaryButton fullWidth={false} onClick={() => window.print()}>
          <Printer className="h-4 w-4" aria-hidden="true" />
          Print
        </SecondaryButton>
        <GlassButton onClick={() => setEmailSent(true)} disabled={emailSent}>
          <Mail className="h-4 w-4" aria-hidden="true" />
          {emailSent ? 'Emailed' : 'Email Receipt'}
        </GlassButton>
      </div>
    </div>
  )
}
