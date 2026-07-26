import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Download } from 'lucide-react'
import clsx from 'clsx'
import Breadcrumb from '../../../../components/common/Breadcrumb'
import { GlassButton } from '../../../../components/common/Button'
import { ACCOUNTANT_ROUTES } from '../../../../constants/routes'

const ACADEMIC_YEAR_OPTIONS = ['2025-2026', '2024-2025']

const TABS = [
  { path: ACCOUNTANT_ROUTES.receivePayment, label: 'Receive Payment' },
  { path: ACCOUNTANT_ROUTES.paymentVerification, label: 'Verification' },
  { path: ACCOUNTANT_ROUTES.paymentHistory, label: 'History' },
  { path: ACCOUNTANT_ROUTES.refundManagement, label: 'Refunds' },
  { path: ACCOUNTANT_ROUTES.failedTransactions, label: 'Failed' },
  { path: ACCOUNTANT_ROUTES.paymentReconciliation, label: 'Reconciliation' },
]

export default function PaymentsPageHeader({ pageTitle, onExport, extraControls }) {
  const [academicYear, setAcademicYear] = useState('2025-2026')

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', to: ACCOUNTANT_ROUTES.dashboard },
            { label: 'Payments', to: ACCOUNTANT_ROUTES.paymentHistory },
            { label: pageTitle },
          ]}
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{pageTitle}</h1>
          <div className="flex flex-wrap items-center gap-3">
            {extraControls}
            <select
              value={academicYear}
              onChange={(event) => setAcademicYear(event.target.value)}
              aria-label="Academic year"
              className="rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
            >
              {ACADEMIC_YEAR_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {onExport && (
              <GlassButton icon={Download} onClick={onExport}>
                Export
              </GlassButton>
            )}
          </div>
        </div>
      </div>

      <nav aria-label="Payments module navigation" className="thin-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
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
