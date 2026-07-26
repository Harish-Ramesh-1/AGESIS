import clsx from 'clsx'
import { formatCurrency } from '../../../utils/formatCurrency'

export default function FeeComponentCheckbox({ label, pending, isChecked, onToggle, disabled }) {
  return (
    <label
      className={clsx(
        'flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all duration-200 ease-premium',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        isChecked
          ? 'border-brand-400/60 bg-white/60 dark:border-brand-400/40 dark:bg-white/[0.08]'
          : 'border-white/40 bg-white/30 dark:border-white/10 dark:bg-white/[0.03]',
      )}
    >
      <span className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onToggle}
          disabled={disabled}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus-visible:outline-none focus:ring-brand-500 dark:border-white/20"
        />
        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{label}</span>
      </span>
      <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(pending)}</span>
    </label>
  )
}
