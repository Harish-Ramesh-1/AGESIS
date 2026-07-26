import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Download, FileText, LayoutDashboard } from 'lucide-react'
import { PrimaryButton, SecondaryButton } from '../../../components/common/Button'
import { formatCurrency } from '../../../utils/formatCurrency'
import { downloadTextFile } from '../../../utils/downloadTextFile'
import { PARENT_ROUTES } from '../../../constants/routes'

export default function PaymentSuccessScreen({ transaction, onDone }) {
  const navigate = useNavigate()

  function handleDownloadReceipt() {
    downloadTextFile(
      `${transaction.receiptNumber}.txt`,
      `Receipt\n${transaction.receiptNumber}\nAmount: ${formatCurrency(transaction.amount)}\nMethod: ${transaction.method}`,
    )
  }

  function handleDownloadInvoice() {
    downloadTextFile(
      `${transaction.invoiceNumber}.txt`,
      `Invoice\n${transaction.invoiceNumber}\nAmount: ${formatCurrency(transaction.amount)}`,
    )
  }

  function handleReturnToDashboard() {
    onDone()
    navigate(PARENT_ROUTES.dashboard)
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-clay border border-emerald-100 bg-emerald-50/60 p-8 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10">
      <span className="flex h-16 w-16 animate-[fade-in_300ms_ease-premium] items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
        <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
      </span>

      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Payment Successful</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {formatCurrency(transaction.amount)} paid successfully
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-2 rounded-xl bg-white/60 p-4 text-left text-xs dark:bg-white/5">
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400">Transaction ID</span>
          <span className="font-medium text-slate-800 dark:text-slate-100">{transaction.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400">Receipt Number</span>
          <span className="font-medium text-slate-800 dark:text-slate-100">{transaction.receiptNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400">Invoice Number</span>
          <span className="font-medium text-slate-800 dark:text-slate-100">{transaction.invoiceNumber}</span>
        </div>
      </div>

      <div className="mt-2 flex w-full max-w-sm flex-col gap-2 sm:flex-row">
        <SecondaryButton onClick={handleDownloadReceipt}>
          <Download className="h-4 w-4" aria-hidden="true" />
          Receipt
        </SecondaryButton>
        <SecondaryButton onClick={handleDownloadInvoice}>
          <FileText className="h-4 w-4" aria-hidden="true" />
          Invoice
        </SecondaryButton>
        <PrimaryButton onClick={handleReturnToDashboard}>
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </PrimaryButton>
      </div>
    </div>
  )
}
