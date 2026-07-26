import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CalendarClock } from 'lucide-react'
import clsx from 'clsx'
import { usePaymentsStore } from '../../../../store/paymentsStore'
import { PrimaryButton } from '../../../../components/common/Button'
import Skeleton from '../../../../components/common/Skeleton/Skeleton'
import DashboardCard from './DashboardCard'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { formatDate } from '../../../../utils/formatDate'
import { PARENT_ROUTES } from '../../../../constants/routes'

export default function UpcomingDueCard() {
  const status = usePaymentsStore((state) => state.status)
  const data = usePaymentsStore((state) => state.data)
  const navigate = useNavigate()

  if (status === 'loading' || status === 'idle') {
    return (
      <DashboardCard title="Upcoming Due">
        <Skeleton className="h-40" />
      </DashboardCard>
    )
  }

  if (status === 'error' || !data) {
    return (
      <DashboardCard title="Upcoming Due">
        <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load upcoming dues.</p>
      </DashboardCard>
    )
  }

  const { upcomingDue } = data
  const isUrgent = upcomingDue.daysRemaining <= 7

  return (
    <DashboardCard title="Upcoming Due" description="Your next fee installment">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
          <CalendarClock className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(upcomingDue.amount)}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Due {formatDate(upcomingDue.dueDate)}</p>
        </div>
      </div>

      <p
        className={clsx(
          'mt-4 text-sm font-medium',
          isUrgent ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400',
        )}
      >
        {upcomingDue.daysRemaining} days remaining
      </p>

      <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50/70 px-3 py-2.5 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{upcomingDue.lateFeeWarning}</span>
      </div>

      <PrimaryButton className="mt-4" onClick={() => navigate(PARENT_ROUTES.payFees)}>
        Pay Now
      </PrimaryButton>
    </DashboardCard>
  )
}
