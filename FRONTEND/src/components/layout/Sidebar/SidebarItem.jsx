import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { NAV_ICONS } from './navIcons'
import SidebarTooltip from './SidebarTooltip'

export default function SidebarItem({ icon, label, path, isCollapsed, nested, onNavigate }) {
  const Icon = NAV_ICONS[icon]

  return (
    <NavLink
      to={path}
      end
      onClick={onNavigate}
      className={({ isActive }) =>
        clsx(
          'group relative flex items-center gap-3 rounded-xl py-2.5 text-sm transition-all duration-200 ease-premium focus-visible:outline-none',
          isCollapsed ? 'justify-center px-0' : 'px-3',
          nested && !isCollapsed && 'text-[13px]',
          isActive
            ? 'bg-white/60 font-semibold text-brand-700 shadow-clay-active dark:bg-white/[0.09] dark:text-brand-300'
            : 'text-slate-600 hover:-translate-y-0.5 hover:bg-white/40 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              aria-hidden="true"
              className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-brand-600 dark:bg-brand-400"
            />
          )}
          <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          {!isCollapsed && <span className="truncate">{label}</span>}
          {isCollapsed && <SidebarTooltip>{label}</SidebarTooltip>}
        </>
      )}
    </NavLink>
  )
}
