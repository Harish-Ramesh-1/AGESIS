import { X } from 'lucide-react'
import { PrimaryButton, SecondaryButton } from '../../../components/common/Button'
import { formatCurrency } from '../../../utils/formatCurrency'

const METHOD_LABEL = {
  upi: 'UPI',
  'credit-card': 'Credit Card',
  'debit-card': 'Debit Card',
  netbanking: 'Net Banking',
  wallet: 'Wallet',
  razorpay: 'Razorpay',
}

export default function ConfirmPaymentModal({ studentName, amount, method, isSubmitting, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Confirm payment"
        className="relative z-10 w-full max-w-sm rounded-clay border border-white/50 bg-white/95 p-6 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Confirm Payment</h2>

        <div className="mt-4 flex flex-col gap-3 text-sm">
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>Student</span>
            <span className="font-medium text-slate-900 dark:text-white">{studentName}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>Amount</span>
            <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(amount)}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>Method</span>
            <span className="font-medium text-slate-900 dark:text-white">{METHOD_LABEL[method] ?? method}</span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <SecondaryButton onClick={onClose} disabled={isSubmitting}>
            Cancel
          </SecondaryButton>
          <PrimaryButton onClick={onConfirm} isLoading={isSubmitting}>
            Confirm Payment
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
