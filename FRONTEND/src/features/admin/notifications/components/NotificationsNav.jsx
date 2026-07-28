import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { ADMIN_ROUTES } from '../../../../constants/routes'

const TABS = [
  { path: ADMIN_ROUTES.announcements, label: 'Announcements' },
  { path: ADMIN_ROUTES.notificationTemplates, label: 'Templates' },
  { path: ADMIN_ROUTES.notificationScheduled, label: 'Scheduled' },
  { path: ADMIN_ROUTES.notificationLogs, label: 'Delivery Logs' },
]

export default function NotificationsNav() {
  return (
    <nav aria-label="Notifications & announcements module navigation" className="thin-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {TABS.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            clsx(
              'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ease-premium',
              isActive
                ? 'bg-brand-600 text-white shadow-clay-button'
                : 'border border-white/40 bg-white/40 text-slate-600 hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.07]',
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
