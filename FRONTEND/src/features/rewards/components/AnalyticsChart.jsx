import { lazy, Suspense } from 'react'
import GlassCard from '../../../components/common/GlassCard'
import Skeleton from '../../../components/common/Skeleton'

const RevenueChart = lazy(() => import('../../../components/charts/RevenueChart'))

const SERIES = [
  { key: 'onTime', label: 'On Time', color: '#10b981' },
  { key: 'late', label: 'Late', color: '#ef4444' },
]

export default function AnalyticsChart({ analytics, streak }) {
  return (
    <GlassCard title="Payment Consistency" description="Your on-time payment trend">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{streak.current}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Current Streak</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{streak.longest}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Longest Streak</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.consistencyScore}%</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Consistency Score</p>
        </div>
      </div>

      <div className="mt-6">
        <Suspense fallback={<Skeleton className="h-56" />}>
          <RevenueChart data={analytics.monthlyPayments} xKey="month" series={SERIES} height={220} />
        </Suspense>
      </div>
    </GlassCard>
  )
}
