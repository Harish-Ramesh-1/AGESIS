import { forwardRef, useId } from 'react'
import clsx from 'clsx'

const InputField = forwardRef(function InputField(
  { label, error, helperText, icon: Icon, className, id, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id || generatedId
  const describedBy = error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-xs font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={clsx(
            'w-full rounded-xl border bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500',
            Icon && 'pl-10',
            error ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-white/10',
            className,
          )}
          {...props}
        />
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="text-[11px] font-medium text-red-500" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="text-[11px] text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      ) : null}
    </div>
  )
})

export default InputField
