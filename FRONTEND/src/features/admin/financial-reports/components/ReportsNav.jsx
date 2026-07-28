import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { ADMIN_ROUTES } from '../../../../constants/routes'

const TABS = [
  { path: ADMIN_ROUTES.reportsDailyCollection, label: 'Daily Collection' },
  { path: ADMIN_ROUTES.reportsMonthlyRevenue, label: 'Monthly Revenue' },
  { path: ADMIN_ROUTES.reportsOutstandingDues, label: 'Outstanding Dues' },
  { path: ADMIN_ROUTES.reportsCollectionAnalytics, label: 'Collection Analytics' },
  { path: ADMIN_ROUTES.reportsPaymentAnalytics, label: 'Payment Analytics' },
  { path: ADMIN_ROUTES.reportsExport, label: 'Export Reports' },
]

export default function ReportsNav() {
  return (
    <nav aria-label="Financial reports module navigation" className="thin-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
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
