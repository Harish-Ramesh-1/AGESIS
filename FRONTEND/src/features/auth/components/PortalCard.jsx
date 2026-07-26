import { forwardRef } from 'react'
import { Briefcase, Check, ShieldCheck, Users } from 'lucide-react'
import clsx from 'clsx'

const ICONS = { Users, Briefcase, ShieldCheck }

const PortalCard = forwardRef(function PortalCard({ portal, isSelected, onSelect }, ref) {
  const Icon = ICONS[portal.icon]

  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={isSelected}
      tabIndex={isSelected ? 0 : -1}
      onClick={() => onSelect(portal.id)}
      className={clsx(
        'group relative flex w-full flex-col items-center gap-1.5 overflow-hidden rounded-2xl border px-2.5 py-3 text-center backdrop-blur-xl transition-all duration-200 ease-premium focus-visible:outline-none',
        isSelected
          ? '-translate-y-0.5 border-brand-400/60 bg-white/25 shadow-clay-active dark:border-brand-300/50 dark:bg-white/[0.09]'
          : 'border-white/40 bg-white/10 shadow-clay hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/20 hover:shadow-clay-active dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]',
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/20"
      />
      <span
        className={clsx(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors duration-200',
          isSelected
            ? 'bg-brand-600 text-white'
            : 'bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300',
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="text-xs font-semibold leading-tight text-slate-900 dark:text-white">
        {portal.title}
      </span>
      <span
        className={clsx(
          'absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 ease-premium',
          isSelected ? 'scale-100 bg-brand-600 text-white opacity-100' : 'scale-75 opacity-0',
        )}
        aria-hidden="true"
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    </button>
  )
})

export default PortalCard
