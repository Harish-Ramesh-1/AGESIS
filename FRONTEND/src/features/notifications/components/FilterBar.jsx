import clsx from 'clsx'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'payment', label: 'Payments' },
  { key: 'invoice', label: 'Invoices' },
  { key: 'receipt', label: 'Receipts' },
  { key: 'announcement', label: 'Announcements' },
  { key: 'event', label: 'Events' },
  { key: 'scholarship', label: 'Scholarships' },
  { key: 'academic', label: 'Academic' },
  { key: 'system', label: 'System' },
]

export default function FilterBar({ active, onChange }) {
  return (
    <div role="tablist" aria-label="Notification filters" className="thin-scrollbar flex gap-2 overflow-x-auto pb-1">
      {FILTERS.map((filter) => (
        <button
          key={filter.key}
          type="button"
          role="tab"
          aria-selected={active === filter.key}
          onClick={() => onChange(filter.key)}
          className={clsx(
            'shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ease-premium',
            active === filter.key
              ? 'border-brand-400/70 bg-brand-600 text-white shadow-clay-active'
              : 'border-white/40 bg-white/30 text-slate-600 hover:bg-white/50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.07]',
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
