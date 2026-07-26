import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import clsx from 'clsx'

const VARIANTS = {
  error: {
    icon: AlertCircle,
    className:
      'bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20',
  },
  success: {
    icon: CheckCircle2,
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
  },
  info: {
    icon: Info,
    className:
      'bg-brand-50 text-brand-700 border-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/20',
  },
}

export default function Alert({ variant = 'info', children }) {
  const { icon: Icon, className } = VARIANTS[variant]

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={clsx('flex items-start gap-2 rounded-xl border px-3 py-2 text-xs', className)}
    >
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <p>{children}</p>
    </div>
  )
}
