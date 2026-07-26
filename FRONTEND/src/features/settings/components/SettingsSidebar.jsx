import clsx from 'clsx'

const SECTIONS = [
  { key: 'general', label: 'General' },
  { key: 'appearance', label: 'Appearance' },
  { key: 'security', label: 'Security' },
  { key: 'about', label: 'About' },
]

export default function SettingsSidebar({ active, onChange }) {
  return (
    <nav aria-label="Settings sections" className="flex flex-col gap-1">
      {SECTIONS.map((section) => (
        <button
          key={section.key}
          type="button"
          onClick={() => onChange(section.key)}
          aria-current={active === section.key ? 'page' : undefined}
          className={clsx(
            'rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all duration-200 ease-premium',
            active === section.key
              ? 'bg-white/60 text-brand-700 shadow-clay dark:bg-white/[0.08] dark:text-brand-300'
              : 'text-slate-600 hover:bg-white/40 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white',
          )}
        >
          {section.label}
        </button>
      ))}
    </nav>
  )
}

export { SECTIONS }
