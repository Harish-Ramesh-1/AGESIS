import clsx from 'clsx'

export default function GlassCard({ title, description, action, children, className, hover = true }) {
  return (
    <section
      className={clsx(
        'relative h-full overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl transition-all duration-200 ease-premium dark:border-white/10 dark:bg-white/[0.05] sm:p-6',
        hover && 'hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-clay-active',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
