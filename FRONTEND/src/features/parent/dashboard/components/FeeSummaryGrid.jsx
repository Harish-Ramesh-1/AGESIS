import { useEffect } from 'react'
import { Calendar, PiggyBank, Wallet, Wallet2 } from 'lucide-react'
import { usePaymentsStore } from '../../../../store/paymentsStore'
import Skeleton from '../../../../components/common/Skeleton/Skeleton'
import SummaryCard from './SummaryCard'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { formatDate } from '../../../../utils/formatDate'

export default function FeeSummaryGrid() {
  const status = usePaymentsStore((state) => state.status)
  const data = usePaymentsStore((state) => state.data)
  const fetchPayments = usePaymentsStore((state) => state.fetchPayments)

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-36" />
        ))}
      </div>
    )
  }

  if (status === 'error' || !data) {
    return (
      <div className="rounded-clay border border-red-100 bg-red-50/60 p-5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
        Couldn&apos;t load fee summary.
      </div>
    )
  }

  const paidPercent = Math.round((data.amountPaid / data.annualFee) * 100)
  const pendingPercent = 100 - paidPercent

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <SummaryCard
        icon={Wallet}
        label="Annual Fee"
        value={formatCurrency(data.annualFee)}
        description="Total fee for this academic year"
      />
      <SummaryCard
        icon={PiggyBank}
        label="Amount Paid"
        value={formatCurrency(data.amountPaid)}
        description={`${paidPercent}% of annual fee`}
        progress={paidPercent}
      />
      <SummaryCard
        icon={Wallet2}
        label="Pending Amount"
        value={formatCurrency(data.pendingAmount)}
        description={`${pendingPercent}% remaining`}
        progress={pendingPercent}
      />
      <SummaryCard
        icon={Calendar}
        label="Next Due Date"
        value={formatDate(data.nextDueDate)}
        description={`${data.upcomingDue.daysRemaining} days remaining`}
      />
    </div>
  )
}
