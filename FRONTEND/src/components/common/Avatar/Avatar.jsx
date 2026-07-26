import clsx from 'clsx'

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-lg',
}

export default function Avatar({ initials, size = 'md', className }) {
  return (
    <span
      className={clsx(
        'flex shrink-0 items-center justify-center rounded-full bg-brand-600 font-semibold text-white shadow-clay-button',
        SIZES[size],
        className,
      )}
    >
      {initials}
    </span>
  )
}
