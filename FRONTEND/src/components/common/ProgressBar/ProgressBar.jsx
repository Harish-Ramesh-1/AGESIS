import clsx from 'clsx'

export default function ProgressBar({ value, className, trackClassName, barClassName }) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={clsx('h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10', trackClassName, className)}
    >
      <div
        className={clsx('h-full rounded-full bg-brand-600 transition-[width] duration-700 ease-premium dark:bg-brand-400', barClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
