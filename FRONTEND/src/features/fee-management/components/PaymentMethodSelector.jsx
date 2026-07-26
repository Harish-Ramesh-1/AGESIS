import { Building2, CreditCard, QrCode, Wallet, Zap } from 'lucide-react'
import clsx from 'clsx'

const METHODS = [
  { key: 'upi', label: 'UPI', icon: QrCode },
  { key: 'credit-card', label: 'Credit Card', icon: CreditCard },
  { key: 'debit-card', label: 'Debit Card', icon: CreditCard },
  { key: 'netbanking', label: 'Net Banking', icon: Building2 },
  { key: 'wallet', label: 'Wallet', icon: Wallet },
  { key: 'razorpay', label: 'Razorpay', icon: Zap },
]

export default function PaymentMethodSelector({ selectedMethod, onSelect }) {
  return (
    <div role="radiogroup" aria-label="Payment method" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {METHODS.map((method) => {
        const Icon = method.icon
        const isSelected = selectedMethod === method.key
        return (
          <button
            key={method.key}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(method.key)}
            className={clsx(
              'flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center transition-all duration-200 ease-premium hover:-translate-y-0.5 focus-visible:outline-none',
              isSelected
                ? 'border-brand-400/70 bg-white/60 shadow-clay-active dark:border-brand-400/40 dark:bg-white/[0.08]'
                : 'border-white/40 bg-white/30 shadow-clay dark:border-white/10 dark:bg-white/[0.03]',
            )}
          >
            <span
              className={clsx(
                'flex h-9 w-9 items-center justify-center rounded-xl',
                isSelected
                  ? 'bg-brand-600 text-white'
                  : 'bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{method.label}</span>
          </button>
        )
      })}
    </div>
  )
}
