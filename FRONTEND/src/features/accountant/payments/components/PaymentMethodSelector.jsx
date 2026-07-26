import { Banknote, CreditCard, FileSignature, Landmark, QrCode, ScrollText, Wallet } from 'lucide-react'
import clsx from 'clsx'

const METHOD_ICONS = {
  Cash: Banknote,
  UPI: QrCode,
  'Credit Card': CreditCard,
  'Debit Card': CreditCard,
  'Net Banking': Landmark,
  Cheque: FileSignature,
  'Demand Draft': ScrollText,
  Wallet,
}

export default function PaymentMethodSelector({ methods, value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Payment method" className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {methods.map((method) => {
        const Icon = METHOD_ICONS[method] ?? Banknote
        const isActive = value === method
        return (
          <button
            key={method}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(method)}
            className={clsx(
              'flex flex-col items-center gap-2 rounded-clay border px-3 py-4 text-center transition-all duration-200 ease-premium hover:-translate-y-0.5',
              isActive
                ? 'border-brand-400/70 bg-white/60 shadow-clay-active dark:border-brand-400/40 dark:bg-white/[0.08]'
                : 'border-white/40 bg-white/30 shadow-clay dark:border-white/10 dark:bg-white/[0.03]',
            )}
          >
            <Icon className={clsx('h-5 w-5', isActive ? 'text-brand-600 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400')} aria-hidden="true" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{method}</span>
          </button>
        )
      })}
    </div>
  )
}
