import clsx from 'clsx'

const TONE_CLASSES = {
  brand: 'bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
  emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  violet: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
  sky: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
  red: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300',
  slate: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
}

export default function Timeline({ items }) {
  return (
    <ol>
      {items.map((item, index) => {
        const Icon = item.icon
        const isLast = index === items.length - 1
        const toneClasses = TONE_CLASSES[item.tone] ?? TONE_CLASSES.brand

        return (
          <li
            key={item.id}
            className={clsx('relative flex animate-[fade-in_200ms_ease-premium] gap-4', !isLast && 'pb-6')}
          >
            {!isLast && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-[15px] top-9 w-px bg-slate-200/70 dark:bg-white/10"
              />
            )}
            <span
              className={clsx(
                'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white/60 dark:ring-slate-950/40',
                toneClasses,
              )}
            >
              {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
            </span>
            <div className="min-w-0 flex-1 pb-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                {item.badge && (
                  <span
                    className={clsx(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      toneClasses,
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
              )}
              <div className="mt-1.5 flex flex-wrap items-center gap-3">
                {item.meta && <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{item.meta}</p>}
                {item.action}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
