import { RotateCcw, XCircle } from 'lucide-react'
import { PrimaryButton, SecondaryButton } from '../../../components/common/Button'

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL

export default function PaymentFailureScreen({ reason, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-clay border border-red-100 bg-red-50/60 p-8 text-center dark:border-red-500/20 dark:bg-red-500/10">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300">
        <XCircle className="h-8 w-8" aria-hidden="true" />
      </span>

      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Payment Failed</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {reason || 'Something went wrong while processing your payment.'}
        </p>
      </div>

      <div className="mt-2 flex w-full max-w-sm flex-col gap-2 sm:flex-row">
        <SecondaryButton onClick={() => window.location.assign(`mailto:${SUPPORT_EMAIL}`)}>
          Contact Support
        </SecondaryButton>
        <PrimaryButton onClick={onRetry}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Retry Payment
        </PrimaryButton>
      </div>
    </div>
  )
}
