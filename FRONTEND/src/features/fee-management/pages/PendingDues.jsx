import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleDollarSign, CreditCard, SlidersHorizontal, Wallet } from 'lucide-react'
import { useFeeStore } from '../../../store/feeStore'
import { usePaymentStore } from '../../../store/paymentStore'
import PageHeader from '../components/PageHeader'
import SectionHeader from '../components/SectionHeader'
import GlassCard from '../../../components/common/GlassCard'
import Skeleton from '../../../components/common/Skeleton'
import ErrorState from '../../../components/common/ErrorState'
import EmptyState from '../../../components/common/EmptyState'
import { PrimaryButton, SecondaryButton } from '../../../components/common/Button'
import PendingFeeCard from '../components/PendingFeeCard'
import DueTimeline from '../components/DueTimeline'
import LateFeeCalculator from '../components/LateFeeCalculator'
import PaymentTypeCard from '../components/PaymentTypeCard'
import ReminderBanner from '../components/ReminderBanner'
import { formatCurrency } from '../../../utils/formatCurrency'
import { daysUntil, formatDate } from '../../../utils/formatDate'
import { PARENT_ROUTES } from '../../../constants/routes'

const SUGGESTIONS = [
  { key: 'full', title: 'Pay Full', description: 'Clear your entire pending balance', icon: Wallet },
  { key: 'installment', title: 'Pay Installment', description: 'Pay just the next installment', icon: CreditCard },
  { key: 'custom', title: 'Custom Amount', description: 'Choose which fees to pay', icon: SlidersHorizontal },
]

export default function PendingDues() {
  const status = useFeeStore((state) => state.status)
  const details = useFeeStore((state) => state.details)
  const fetchFeeDetails = useFeeStore((state) => state.fetchFeeDetails)
  const prefill = usePaymentStore((state) => state.prefill)
  const navigate = useNavigate()
  const [selectedKeys, setSelectedKeys] = useState([])

  useEffect(() => {
    fetchFeeDetails()
  }, [fetchFeeDetails])

  function goToPay(paymentType, keys) {
    prefill({ paymentType, selectedComponentKeys: keys })
    navigate(PARENT_ROUTES.payFees)
  }

  function toggleSelect(key) {
    setSelectedKeys((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]))
  }

  if (status === 'error') {
    return (
      <div>
        <PageHeader title="Pending Dues" description="All your outstanding fees in one place." />
        <ErrorState message="Couldn't load pending dues." onRetry={fetchFeeDetails} />
      </div>
    )
  }

  if (status !== 'success' || !details) {
    return (
      <div>
        <PageHeader title="Pending Dues" description="All your outstanding fees in one place." />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
      </div>
    )
  }

  const pendingComponents = details.components.filter((component) => component.pending > 0)
  const { upcomingDue } = details
  const remaining = daysUntil(upcomingDue.dueDate)

  if (pendingComponents.length === 0) {
    return (
      <div>
        <PageHeader title="Pending Dues" description="All your outstanding fees in one place." />
        <EmptyState
          icon={CircleDollarSign}
          title="You're all caught up"
          description="There are no pending dues right now."
        />
      </div>
    )
  }

  return (
    <div className="pb-24 md:pb-0">
      <PageHeader title="Pending Dues" description="All your outstanding fees in one place." />

      <div className="flex flex-col gap-8">
        <ReminderBanner id="upcoming-due" dueDate={upcomingDue.dueDate} />

        <section>
          <SectionHeader title="Pending Summary" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <GlassCard className="p-5">
              <p className="text-xs text-slate-400 dark:text-slate-500">Pending Amount</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(details.pendingAmount)}
              </p>
            </GlassCard>
            <GlassCard className="p-5">
              <p className="text-xs text-slate-400 dark:text-slate-500">Due Date</p>
              <p className="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                {formatDate(upcomingDue.dueDate)}
              </p>
            </GlassCard>
            <GlassCard className="p-5">
              <p className="text-xs text-slate-400 dark:text-slate-500">Late Fee</p>
              <p className="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                {formatCurrency(upcomingDue.lateFeePerDay)}/day
              </p>
            </GlassCard>
            <GlassCard className="p-5">
              <p className="text-xs text-slate-400 dark:text-slate-500">Days Remaining</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{Math.max(remaining, 0)}</p>
            </GlassCard>
          </div>
        </section>

        <section>
          <SectionHeader title="Pending Fees" description="Outstanding balances by fee component" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendingComponents.map((component) => (
              <PendingFeeCard
                key={component.key}
                component={component}
                dueDate={upcomingDue.dueDate}
                isSelected={selectedKeys.includes(component.key)}
                onToggleSelect={() => toggleSelect(component.key)}
              />
            ))}
          </div>
        </section>

        <DueTimeline dueDate={upcomingDue.dueDate} graceDays={upcomingDue.lateFeeGraceDays} />

        <LateFeeCalculator
          originalAmount={details.pendingAmount}
          dueDate={upcomingDue.dueDate}
          lateFeePerDay={upcomingDue.lateFeePerDay}
          graceDays={upcomingDue.lateFeeGraceDays}
        />

        <section>
          <SectionHeader title="Payment Suggestions" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {SUGGESTIONS.map((suggestion) => (
              <PaymentTypeCard
                key={suggestion.key}
                icon={suggestion.icon}
                title={suggestion.title}
                description={suggestion.description}
                isSelected={false}
                onSelect={() => goToPay(suggestion.key, [])}
              />
            ))}
          </div>
        </section>

        <section className="hidden md:block">
          <SectionHeader title="Quick Pay" />
          <div className="flex flex-wrap gap-3">
            <PrimaryButton fullWidth={false} className="flex-1" onClick={() => goToPay('full', [])}>
              Pay Full
            </PrimaryButton>
            <SecondaryButton fullWidth={false} className="flex-1" onClick={() => goToPay('installment', [])}>
              Pay Installment
            </SecondaryButton>
            <SecondaryButton
              fullWidth={false}
              className="flex-1"
              disabled={selectedKeys.length === 0}
              onClick={() => goToPay('custom', selectedKeys)}
            >
              Pay Selected Fees{selectedKeys.length > 0 ? ` (${selectedKeys.length})` : ''}
            </SecondaryButton>
          </div>
        </section>
      </div>

      <div className="fixed inset-x-4 bottom-4 z-30 flex gap-2 rounded-clay border border-white/50 bg-white/90 p-3 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/90 md:hidden">
        <PrimaryButton fullWidth={false} className="flex-1" onClick={() => goToPay('full', [])}>
          Pay Full
        </PrimaryButton>
        <SecondaryButton
          fullWidth={false}
          className="flex-1"
          disabled={selectedKeys.length === 0}
          onClick={() => goToPay('custom', selectedKeys)}
        >
          Pay Selected{selectedKeys.length > 0 ? ` (${selectedKeys.length})` : ''}
        </SecondaryButton>
      </div>
    </div>
  )
}
