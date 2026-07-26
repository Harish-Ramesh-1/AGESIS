import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import Breadcrumb from '../../../../components/common/Breadcrumb'
import { ACCOUNTANT_ROUTES } from '../../../../constants/routes'

const TABS = [
  { path: ACCOUNTANT_ROUTES.accountantProfile, label: 'Accountant Profile' },
  { path: ACCOUNTANT_ROUTES.security, label: 'Security' },
  { path: ACCOUNTANT_ROUTES.preferences, label: 'Preferences' },
]

export default function SettingsPageHeader({ pageTitle }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', to: ACCOUNTANT_ROUTES.dashboard },
            { label: 'Profile & Settings', to: ACCOUNTANT_ROUTES.accountantProfile },
            { label: pageTitle },
          ]}
        />
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{pageTitle}</h1>
      </div>
      <nav aria-label="Profile and settings navigation" className="thin-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
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
    </div>
  )
}
