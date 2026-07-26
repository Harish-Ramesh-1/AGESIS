import { CircleHelp } from 'lucide-react'
import clsx from 'clsx'
import SidebarTooltip from './SidebarTooltip'

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL

export default function SupportButton({ isCollapsed }) {
  return (
    <button
      type="button"
      onClick={() => window.location.assign(`mailto:${SUPPORT_EMAIL}`)}
      className={clsx(
        'group relative flex w-full items-center gap-3 rounded-xl py-2.5 text-sm text-slate-600 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/40 hover:text-slate-900 focus-visible:outline-none dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white',
        isCollapsed ? 'justify-center px-0' : 'px-3',
      )}
    >
      <CircleHelp className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      {!isCollapsed && <span>Help Center</span>}
      {isCollapsed && <SidebarTooltip>Help Center</SidebarTooltip>}
    </button>
  )
}
