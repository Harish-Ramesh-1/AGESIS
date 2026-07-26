import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

export default function PrimaryButton({
  children,
  type = 'button',
  isLoading = false,
  disabled = false,
  fullWidth = true,
  className,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-clay-button transition-all duration-200 ease-premium hover:bg-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100',
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}
