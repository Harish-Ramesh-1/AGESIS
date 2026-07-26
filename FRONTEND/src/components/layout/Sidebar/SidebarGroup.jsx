import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { NAV_ICONS } from './navIcons'
import SidebarTooltip from './SidebarTooltip'

export default function SidebarGroup({
  icon,
  label,
  isCollapsed,
  isExpanded,
  isActive,
  onToggle,
  onRequestExpandSidebar,
  children,
}) {
  const Icon = NAV_ICONS[icon]

  function handleClick() {
    if (isCollapsed) {
      onRequestExpandSidebar()
      return
    }
    onToggle()
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={isCollapsed ? undefined : isExpanded}
        className={clsx(
          'group relative flex w-full items-center gap-3 rounded-xl py-2.5 text-sm transition-all duration-200 ease-premium focus-visible:outline-none',
          isCollapsed ? 'justify-center px-0' : 'px-3',
          isActive
            ? 'bg-white/50 font-semibold text-slate-900 shadow-clay dark:bg-white/[0.07] dark:text-white'
            : 'text-slate-600 hover:-translate-y-0.5 hover:bg-white/40 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white',
        )}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
        {!isCollapsed && (
          <>
            <span className="flex-1 truncate text-left">{label}</span>
            <ChevronDown
              className={clsx(
                'h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ease-premium dark:text-slate-500',
                isExpanded && 'rotate-180',
              )}
              aria-hidden="true"
            />
          </>
        )}
        {isCollapsed && <SidebarTooltip>{label}</SidebarTooltip>}
      </button>

      {!isCollapsed && (
        <div
          className={clsx(
            'grid transition-[grid-template-rows] duration-300 ease-premium',
            isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="overflow-hidden">
            <div className="mt-1 flex flex-col gap-1 border-l border-slate-200/70 pl-3.5 dark:border-white/10">
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
