import clsx from 'clsx'

export default function Skeleton({ className }) {
  return (
    <div
      aria-hidden="true"
      className={clsx('animate-pulse rounded-xl bg-slate-200/70 dark:bg-white/[0.06]', className)}
    />
  )
}
