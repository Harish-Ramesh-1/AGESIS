import clsx from 'clsx'

export default function ToggleSwitch({ checked, onChange, disabled, label, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        checked ? 'bg-brand-600' : 'bg-slate-300 dark:bg-white/15',
        className,
      )}
    >
      <span
        className={clsx(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-premium',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
