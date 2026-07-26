import { useRef, useState } from 'react'
import { MoreVertical } from 'lucide-react'
import useClickOutside from '../../../hooks/useClickOutside'

export default function ActionDropdown({ actions, label = 'Row actions' }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  useClickOutside(containerRef, () => setIsOpen(false))

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={label}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
      >
        <MoreVertical className="h-4 w-4" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 w-48 overflow-hidden rounded-xl border border-white/50 bg-white/95 py-1 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95"
        >
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              role="menuitem"
              onClick={() => {
                action.onClick()
                setIsOpen(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition-colors duration-200 hover:bg-white/60 dark:text-slate-200 dark:hover:bg-white/10"
            >
              <action.icon className="h-4 w-4" aria-hidden="true" />
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
