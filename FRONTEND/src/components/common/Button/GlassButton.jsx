import clsx from 'clsx'

export default function GlassButton({ icon: Icon, children, className, ...props }) {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/25 px-3.5 py-2 text-xs font-medium text-slate-600 backdrop-blur-xl transition-all duration-200 ease-premium hover:border-white/60 hover:bg-white/45 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white',
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      {children}
    </button>
  )
}
