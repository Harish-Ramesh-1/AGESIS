import clsx from 'clsx'

export default function PaymentTypeCard({ icon: Icon, title, description, isSelected, onSelect }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={onSelect}
      className={clsx(
        'flex flex-col items-start gap-2 rounded-clay border p-4 text-left transition-all duration-200 ease-premium hover:-translate-y-0.5 focus-visible:outline-none',
        isSelected
          ? 'border-brand-400/70 bg-white/60 shadow-clay-active dark:border-brand-400/40 dark:bg-white/[0.08]'
          : 'border-white/40 bg-white/30 shadow-clay hover:bg-white/45 dark:border-white/10 dark:bg-white/[0.03]',
      )}
    >
      <span
        className={clsx(
          'flex h-10 w-10 items-center justify-center rounded-xl',
          isSelected
            ? 'bg-brand-600 text-white'
            : 'bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300',
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </button>
  )
}
