import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarClock, CircleDollarSign, Wallet, Wallet2 } from 'lucide-react'
import { useFeeStore } from '../../../store/feeStore'
import GlassCard from '../../../components/common/GlassCard'
import Skeleton from '../../../components/common/Skeleton'
import { GlassButton } from '../../../components/common/Button'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatDate } from '../../../utils/formatDate'
import { PARENT_ROUTES } from '../../../constants/routes'

export default function FeeSummaryCard() {
  const status = useFeeStore((state) => state.status)
  const details = useFeeStore((state) => state.details)
  const fetchFeeDetails = useFeeStore((state) => state.fetchFeeDetails)
  const navigate = useNavigate()

  useEffect(() => {
    fetchFeeDetails()
  }, [fetchFeeDetails])

  const action = (
    <GlassButton onClick={() => navigate(PARENT_ROUTES.feeDetails)}>View Fee Details</GlassButton>
  )

  if (status === 'loading' || status === 'idle') {
    return (
      <GlassCard title="Fee Overview" action={action}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20" />
          ))}
        </div>
      </GlassCard>
    )
  }

  if (status === 'error' || !details) {
    return (
      <GlassCard title="Fee Overview" action={action}>
        <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load fee overview.</p>
      </GlassCard>
    )
  }

  const tiles = [
    { icon: Wallet, label: 'Annual Fee', value: formatCurrency(details.totalFee) },
    { icon: Wallet2, label: 'Paid', value: formatCurrency(details.amountPaid) },
    { icon: CircleDollarSign, label: 'Pending', value: formatCurrency(details.pendingAmount) },
    { icon: CalendarClock, label: 'Next Due Date', value: formatDate(details.upcomingDue.dueDate) },
  ]

  return (
    <GlassCard title="Fee Overview" action={action}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-clay border border-white/40 bg-white/30 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
              <tile.icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="mt-3 truncate text-lg font-bold text-slate-900 dark:text-white">{tile.value}</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{tile.label}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
