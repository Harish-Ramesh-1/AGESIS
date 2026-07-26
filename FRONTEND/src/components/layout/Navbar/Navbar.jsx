import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, Search } from 'lucide-react'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
import Avatar from '../../common/Avatar/Avatar'
import useClickOutside from '../../../hooks/useClickOutside'
import { useNotificationsStore } from '../../../store/notificationsStore'
import { useStudentStore } from '../../../store/studentStore'
import { useAuthStore } from '../../../store/authStore'
import { formatRelativeTime } from '../../../utils/formatDate'
import agesisLogo from '../../../assets/logos/agesis-logo.svg'

export default function Navbar({
  title = 'Dashboard',
  userName,
  avatarInitials,
  portalLabel = 'Parent Portal',
  notificationItems,
  onMarkAllRead,
  onSearchSubmit,
  searchPlaceholder = 'Search',
}) {
  const [isBellOpen, setIsBellOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const bellRef = useRef(null)
  const profileRef = useRef(null)
  useClickOutside(bellRef, () => setIsBellOpen(false))
  useClickOutside(profileRef, () => setIsProfileOpen(false))

  const globalNotifications = useNotificationsStore((state) => state.items)
  const globalMarkAllRead = useNotificationsStore((state) => state.markAllRead)
  const notifications = notificationItems ?? globalNotifications
  const markAllRead = onMarkAllRead ?? globalMarkAllRead
  const unreadCount = notifications.filter((item) => item.unread).length

  const profile = useStudentStore((state) => state.profile)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const displayName = userName ?? profile?.parentName ?? 'Parent'
  const displayInitials = avatarInitials ?? profile?.avatarInitials ?? '··'

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  function handleSearchSubmit(event) {
    event.preventDefault()
    if (!searchValue.trim()) return
    onSearchSubmit(searchValue.trim())
  }

  return (
    <header className="sticky top-0 z-30 mb-6 flex items-center justify-between gap-4 rounded-clay border border-white/50 bg-white/40 px-4 py-3 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <img src={agesisLogo} alt="AGESIS logo" className="h-8 w-8 shrink-0 rounded-lg" />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
            AGESIS
          </p>
          <h1 className="truncate text-base font-bold text-slate-900 dark:text-white sm:text-lg">{title}</h1>
        </div>
      </div>

      {onSearchSubmit && (
        <form onSubmit={handleSearchSubmit} className="hidden min-w-0 flex-1 max-w-sm md:block">
          <label htmlFor="navbar-search" className="sr-only">
            {searchPlaceholder}
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="navbar-search"
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-full border border-white/40 bg-white/50 py-2 pl-10 pr-4 text-sm text-slate-700 shadow-clay-inset transition-colors duration-200 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:placeholder:text-slate-500"
            />
          </div>
        </form>
      )}

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="relative" ref={bellRef}>
          <button
            type="button"
            onClick={() => setIsBellOpen((prev) => !prev)}
            aria-label="Notifications"
            aria-haspopup="true"
            aria-expanded={isBellOpen}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/50 text-slate-600 shadow-clay transition-all duration-200 ease-premium hover:text-brand-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 animate-[bounce_0.6s_ease-in-out_1] items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {isBellOpen && (
            <div className="absolute right-0 top-12 z-40 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-clay border border-white/50 bg-white/95 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95">
              <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3 dark:border-white/10">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <ul className="thin-scrollbar max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <li className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    You&apos;re all caught up.
                  </li>
                ) : (
                  notifications.slice(0, 5).map((item) => (
                    <li
                      key={item.id}
                      className="border-b border-slate-100/80 px-4 py-3 last:border-0 dark:border-white/5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.title}</p>
                        {item.unread && (
                          <span aria-hidden="true" className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.message}</p>
                      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                        {formatRelativeTime(item.timestamp)}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        <ThemeToggle />

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            aria-haspopup="true"
            aria-expanded={isProfileOpen}
            className="flex items-center gap-2 rounded-full border border-white/40 bg-white/50 py-1 pl-1 pr-3 shadow-clay transition-all duration-200 ease-premium hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <Avatar initials={displayInitials} size="sm" />
            <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:inline">
              {displayName.split(' ')[0]}
            </span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-12 z-40 w-48 overflow-hidden rounded-clay border border-white/50 bg-white/95 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95">
              <div className="border-b border-slate-200/70 px-4 py-3 dark:border-white/10">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{displayName}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{portalLabel}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 transition-colors duration-200 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
