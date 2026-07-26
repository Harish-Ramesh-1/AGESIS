import clsx from 'clsx'

export default function EmptyState({ icon: Icon, title, description, className }) {
  return (
    <div
      className={clsx(
        'flex min-h-[60vh] flex-col items-center justify-center rounded-clay border border-white/50 bg-white/30 p-10 text-center shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]',
        className,
      )}
    >
      {Icon && (
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h1>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-300">
        Coming soon
      </p>
    </div>
  )
}
