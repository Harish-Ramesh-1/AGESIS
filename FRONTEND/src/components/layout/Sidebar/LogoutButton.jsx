import { LogOut } from 'lucide-react'
import clsx from 'clsx'
import SidebarTooltip from './SidebarTooltip'
import { useAuthStore } from '../../../store/authStore'

export default function LogoutButton({ isCollapsed }) {
  const logout = useAuthStore((state) => state.logout)

  function handleLogout() {
    logout()
    // Full page load, not SPA navigation — see usePortalAuth.js for why:
    // per-user data stores cache in memory with no reset hook, so a hard
    // navigation is what guarantees this account's data can't leak into
    // whichever account logs in next in this tab.
    window.location.assign('/')
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={clsx(
        'group relative flex w-full items-center gap-3 rounded-xl py-2.5 text-sm text-red-600 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-red-50 focus-visible:outline-none dark:text-red-400 dark:hover:bg-red-500/10',
        isCollapsed ? 'justify-center px-0' : 'px-3',
      )}
    >
      <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      {!isCollapsed && <span>Logout</span>}
      {isCollapsed && <SidebarTooltip>Logout</SidebarTooltip>}
    </button>
  )
}
