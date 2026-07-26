import { useEffect } from 'react'
import { usePaymentsStore } from '../../../../store/paymentsStore'
import Skeleton from '../../../../components/common/Skeleton/Skeleton'
import ProgressRing from '../../../../components/common/ProgressRing'
import DashboardCard from './DashboardCard'
import { formatCurrency } from '../../../../utils/formatCurrency'

export default function PaymentProgress() {
  const status = usePaymentsStore((state) => state.status)
  const data = usePaymentsStore((state) => state.data)
  const fetchPayments = usePaymentsStore((state) => state.fetchPayments)

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  if (status === 'loading' || status === 'idle') {
    return (
      <DashboardCard title="Payment Progress">
        <div className="flex items-center justify-center py-6">
          <Skeleton className="h-40 w-40 rounded-full" />
        </div>
      </DashboardCard>
    )
  }

  if (status === 'error' || !data) {
    return (
      <DashboardCard title="Payment Progress">
        <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load payment progress.</p>
      </DashboardCard>
    )
  }

  return (
    <DashboardCard title="Payment Progress" description="Your fee payment status for this academic year">
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-around">
        <ProgressRing percent={data.progressPercent} size={160} />

        <div className="flex w-full flex-col gap-3 sm:w-auto">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600 dark:bg-brand-400" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {formatCurrency(data.amountPaid)} <span className="text-slate-400 dark:text-slate-500">Paid</span>
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-300 dark:bg-white/20" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {formatCurrency(data.pendingAmount)}{' '}
              <span className="text-slate-400 dark:text-slate-500">Pending</span>
            </span>
          </div>
        </div>
      </div>
    </DashboardCard>
  )
}
