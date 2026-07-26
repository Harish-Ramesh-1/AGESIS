import clsx from 'clsx'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
import SupportButton from './SupportButton'
import LogoutButton from './LogoutButton'

export default function SidebarFooter({ isCollapsed }) {
  return (
    <div className="shrink-0 border-t border-slate-200/70 px-3 py-3 dark:border-white/10">
      <div
        className={clsx(
          'flex items-center rounded-xl px-3 py-2',
          isCollapsed ? 'flex-col gap-2' : 'justify-between',
        )}
      >
        {!isCollapsed && (
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Theme</span>
        )}
        <ThemeToggle />
      </div>
      <div className="mt-1 flex flex-col gap-1">
        <SupportButton isCollapsed={isCollapsed} />
        <LogoutButton isCollapsed={isCollapsed} />
      </div>
    </div>
  )
}
