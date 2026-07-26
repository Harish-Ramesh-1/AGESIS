import { useEffect } from 'react'
import { BadgeCheck, CircleDollarSign, CircleX, ClockAlert, Landmark, Undo2, UsersRound, WalletCards } from 'lucide-react'
import { useAccountantDashboardStore } from '../store/accountantDashboardStore'
import { useStudentStatsStore } from '../store/studentStatsStore'
import HeroCard from '../components/HeroCard'
import KPICard from '../components/KPICard'
import RevenueChart from '../components/RevenueChart'
import PaymentMethodChart from '../components/PaymentMethodChart'
import PendingDuesTable from '../components/PendingDuesTable'
import OverdueAccountsCard from '../components/OverdueAccountsCard'
import TransactionTable from '../components/TransactionTable'
import NotificationPanel from '../components/NotificationPanel'
import QuickActionsGrid from '../components/QuickActionsGrid'
import PerformanceCard from '../components/PerformanceCard'
import UpcomingTasks from '../components/UpcomingTasks'
import SystemStatusCard from '../components/SystemStatusCard'
import SectionHeader from '../components/SectionHeader'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { formatGrowth } from '../utils/dashboardUtils'

const FULL = 'col-span-4 md:col-span-8 lg:col-span-12'

export default function Dashboard() {
  const summaryStatus = useAccountantDashboardStore((state) => state.summaryStatus)
  const kpis = useAccountantDashboardStore((state) => state.kpis)
  const summaryError = useAccountantDashboardStore((state) => state.summaryError)
  const fetchSummary = useAccountantDashboardStore((state) => state.fetchSummary)

  const studentStatsStatus = useStudentStatsStore((state) => state.status)
  const studentStats = useStudentStatsStore((state) => state.stats)
  const studentStatsError = useStudentStatsStore((state) => state.error)
  const fetchStudentStats = useStudentStatsStore((state) => state.fetchStudentStats)

  useEffect(() => {
    fetchSummary()
    fetchStudentStats()
  }, [fetchSummary, fetchStudentStats])

  const kpiCards = [
    {
      icon: WalletCards,
      label: "Today's Collections",
      value: kpis && formatCurrency(kpis.todaysCollections.amount),
      meta: kpis && `${kpis.todaysCollections.count} transactions today`,
    },
    {
      icon: Landmark,
      label: 'Monthly Collections',
      value: kpis && formatCurrency(kpis.monthlyCollections.amount),
      meta: kpis && 'vs. last month',
      trend: kpis && {
        direction: kpis.monthlyCollections.growthPercent >= 0 ? 'up' : 'down',
        value: formatGrowth(kpis.monthlyCollections.growthPercent),
      },
    },
    {
      icon: CircleDollarSign,
      label: 'Pending Dues',
      value: kpis && formatCurrency(kpis.pendingDues.amount),
      meta: kpis && `${kpis.pendingDues.count} students pending`,
    },
    {
      icon: ClockAlert,
      label: 'Overdue Accounts',
      value: kpis && formatCurrency(kpis.overdueAccounts.amount),
      meta: kpis && `${kpis.overdueAccounts.count} students overdue`,
    },
    {
      icon: UsersRound,
      label: 'Total Students',
      value: studentStats && studentStats.registered.toLocaleString('en-IN'),
      meta: studentStats && `${studentStats.active.toLocaleString('en-IN')} active`,
      status: studentStatsStatus,
      error: studentStatsError,
    },
    {
      icon: BadgeCheck,
      label: 'Successful Payments',
      value: kpis && kpis.successfulPayments.count,
      meta: kpis && `${kpis.successfulPayments.successRate}% success rate`,
    },
    {
      icon: CircleX,
      label: 'Failed Transactions',
      value: kpis && kpis.failedTransactions.count,
      meta: kpis && `${kpis.failedTransactions.retryRequired} need retry`,
    },
    {
      icon: Undo2,
      label: 'Refund Requests',
      value: kpis && kpis.refundRequests.pending,
      meta: kpis && `${kpis.refundRequests.approved} approved this month`,
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-5 md:grid-cols-8 lg:grid-cols-12 lg:gap-6">
      <div className={FULL}>
        <HeroCard />
      </div>

      <div className={FULL}>
        <SectionHeader title="Financial Overview" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card) => (
            <KPICard
              key={card.label}
              icon={card.icon}
              label={card.label}
              value={card.value}
              meta={card.meta}
              trend={card.trend}
              status={card.status ?? summaryStatus}
              error={card.error ?? summaryError}
            />
          ))}
        </div>
      </div>

      <div className="col-span-4 md:col-span-8 lg:col-span-8">
        <RevenueChart />
      </div>
      <div className="col-span-4 md:col-span-8 lg:col-span-4">
        <PaymentMethodChart />
      </div>

      <div className="col-span-4 md:col-span-8 lg:col-span-7">
        <PendingDuesTable />
      </div>
      <div className="col-span-4 md:col-span-8 lg:col-span-5">
        <OverdueAccountsCard />
      </div>

      <div className="col-span-4 md:col-span-8 lg:col-span-8">
        <TransactionTable />
      </div>
      <div className="col-span-4 md:col-span-8 lg:col-span-4">
        <NotificationPanel />
      </div>

      <div className={FULL}>
        <QuickActionsGrid />
      </div>

      <div className="col-span-4 md:col-span-4 lg:col-span-4">
        <PerformanceCard />
      </div>
      <div className="col-span-4 md:col-span-4 lg:col-span-4">
        <UpcomingTasks />
      </div>
      <div className="col-span-4 md:col-span-8 lg:col-span-4">
        <SystemStatusCard />
      </div>
    </div>
  )
}
