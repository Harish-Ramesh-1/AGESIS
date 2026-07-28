import { useEffect } from 'react'
import {
  BadgeCheck,
  CircleDollarSign,
  Megaphone,
  ShieldAlert,
  UserCheck,
  UsersRound,
  Wallet,
  Zap,
} from 'lucide-react'
import { useAdminDashboardStore } from '../store/adminDashboardStore'
import HeroCard from '../components/HeroCard'
import KPICard from '../components/KPICard'
import RevenueChart from '../components/RevenueChart'
import UserDistributionChart from '../components/UserDistributionChart'
import PendingApprovalsTable from '../components/PendingApprovalsTable'
import RecentActivityTable from '../components/RecentActivityTable'
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
  const summaryStatus = useAdminDashboardStore((state) => state.summaryStatus)
  const kpis = useAdminDashboardStore((state) => state.kpis)
  const summaryError = useAdminDashboardStore((state) => state.summaryError)
  const fetchSummary = useAdminDashboardStore((state) => state.fetchSummary)

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  const kpiCards = [
    {
      icon: UsersRound,
      label: 'Total Students',
      value: kpis && kpis.totalStudents.count.toLocaleString('en-IN'),
      meta: kpis && `${kpis.totalStudents.activeCount.toLocaleString('en-IN')} active`,
    },
    {
      icon: UserCheck,
      label: 'Total Staff & Accountants',
      value: kpis && kpis.totalStaff.count,
      meta: kpis && 'vs. last quarter',
      trend: kpis && {
        direction: kpis.totalStaff.growthPercent >= 0 ? 'up' : 'down',
        value: formatGrowth(kpis.totalStaff.growthPercent),
      },
    },
    {
      icon: Wallet,
      label: 'Total Revenue (YTD)',
      value: kpis && formatCurrency(kpis.totalRevenue.amount),
      meta: kpis && 'vs. last year',
      trend: kpis && {
        direction: kpis.totalRevenue.growthPercent >= 0 ? 'up' : 'down',
        value: formatGrowth(kpis.totalRevenue.growthPercent),
      },
    },
    {
      icon: CircleDollarSign,
      label: 'Pending Dues',
      value: kpis && formatCurrency(kpis.pendingDues.amount),
      meta: kpis && `${kpis.pendingDues.count} students pending`,
    },
    {
      icon: BadgeCheck,
      label: 'Pending Approvals',
      value: kpis && kpis.pendingApprovals.count,
      meta: kpis && `${kpis.pendingApprovals.urgentCount} urgent`,
    },
    {
      icon: ShieldAlert,
      label: 'Security Alerts',
      value: kpis && kpis.securityAlerts.count,
      meta: kpis && `${kpis.securityAlerts.criticalCount} critical`,
    },
    {
      icon: Zap,
      label: 'System Uptime',
      value: kpis && `${kpis.systemUptime.percent}%`,
      meta: kpis && `${kpis.systemUptime.incidentCount} incidents this month`,
    },
    {
      icon: Megaphone,
      label: 'Announcements Sent',
      value: kpis && kpis.announcementsSent.count,
      meta: kpis && `Reached ${kpis.announcementsSent.reachCount.toLocaleString('en-IN')} parents`,
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-5 md:grid-cols-8 lg:grid-cols-12 lg:gap-6">
      <div className={FULL}>
        <HeroCard />
      </div>

      <div className={FULL}>
        <SectionHeader title="Platform Overview" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card) => (
            <KPICard
              key={card.label}
              icon={card.icon}
              label={card.label}
              value={card.value}
              meta={card.meta}
              trend={card.trend}
              status={summaryStatus}
              error={summaryError}
            />
          ))}
        </div>
      </div>

      <div className="col-span-4 md:col-span-8 lg:col-span-8">
        <RevenueChart />
      </div>
      <div className="col-span-4 md:col-span-8 lg:col-span-4">
        <UserDistributionChart />
      </div>

      <div className="col-span-4 md:col-span-8 lg:col-span-7">
        <PendingApprovalsTable />
      </div>
      <div className="col-span-4 md:col-span-8 lg:col-span-5">
        <NotificationPanel />
      </div>

      <div className={FULL}>
        <RecentActivityTable />
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
