import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Gauge, ShieldAlert, TrendingUp, Users, X } from 'lucide-react'
import { usePendingDueStore } from '../store/pendingDueStore'
import { usePendingDuesAnalyticsStore } from '../store/analyticsStore'
import { useLateFeeStore } from '../store/lateFeeStore'
import { usePenaltyStore } from '../store/penaltyStore'
import Skeleton from '../../../components/common/Skeleton'
import { PrimaryButton, SecondaryButton } from '../../../components/common/Button'
import PendingDuesPageHeader from '../components/PendingDuesPageHeader'
import OutstandingSummaryCard from '../components/OutstandingSummaryCard'
import AnalyticsCard from '../components/AnalyticsCard'
import OverdueTable from '../components/OverdueTable'
import { formatCurrency } from '../../../utils/formatCurrency'
import { downloadTextFile } from '../../../utils/downloadTextFile'

const RevenueChart = lazy(() => import('../../../components/charts/RevenueChart'))
const PieChart = lazy(() => import('../../../components/charts/PieChart'))

export default function OverdueFees() {
  const status = usePendingDueStore((state) => state.overdueStatus)
  const overdueList = usePendingDueStore((state) => state.overdueList)
  const fetchOverdue = usePendingDueStore((state) => state.fetchOverdue)

  const analyticsStatus = usePendingDuesAnalyticsStore((state) => state.status)
  const analytics = usePendingDuesAnalyticsStore((state) => state.data)
  const fetchAnalytics = usePendingDuesAnalyticsStore((state) => state.fetchAnalytics)

  const [penaltyTarget, setPenaltyTarget] = useState(null)

  useEffect(() => {
    fetchOverdue({})
    fetchAnalytics()
  }, [fetchOverdue, fetchAnalytics])

  const summary = useMemo(() => {
    const total = overdueList.reduce((sum, row) => sum + row.outstandingAmount, 0)
    const critical = overdueList.filter((row) => row.priority === 'critical').length
    const avgDelay = overdueList.length > 0 ? Math.round(overdueList.reduce((sum, row) => sum + row.daysOverdue, 0) / overdueList.length) : 0
    return { total, count: overdueList.length, critical, avgDelay, recovery: analytics?.recoveryTrend?.at(-1)?.recoveryPercent ?? 0 }
  }, [overdueList, analytics])

  function handleExport() {
    downloadTextFile(
      'overdue-fees.csv',
      ['Student,Parent,Outstanding,Due Date,Days Overdue,Late Fee,Priority', ...overdueList.map((row) => [row.studentName, row.parentName, row.outstandingAmount, row.dueDate, row.daysOverdue, row.lateFee, row.priority].join(','))].join('\n'),
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PendingDuesPageHeader pageTitle="Overdue Fees" onExport={handleExport} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <OutstandingSummaryCard icon={ShieldAlert} label="Total Overdue" value={formatCurrency(summary.total)} status={status} />
        <OutstandingSummaryCard icon={Users} label="Overdue Students" value={summary.count} status={status} />
        <OutstandingSummaryCard icon={AlertTriangle} label="Critical Accounts" value={summary.critical} status={status} />
        <OutstandingSummaryCard icon={Gauge} label="Average Delay" value={`${summary.avgDelay}d`} status={status} />
        <OutstandingSummaryCard icon={TrendingUp} label="Recovery Rate" value={`${summary.recovery}%`} status={analyticsStatus} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AnalyticsCard title="Overdue Trend" description="Total outstanding over time" className="lg:col-span-1">
          {analyticsStatus === 'success' && analytics ? (
            <Suspense fallback={<Skeleton className="h-48" />}>
              <RevenueChart data={analytics.outstandingTrend} xKey="label" series={[{ key: 'amount', label: 'Outstanding', color: '#dc2626' }]} valueFormatter={formatCurrency} height={200} />
            </Suspense>
          ) : (
            <Skeleton className="h-48" />
          )}
        </AnalyticsCard>

        <AnalyticsCard title="Recovery Rate" description="Monthly collection recovery %">
          {analyticsStatus === 'success' && analytics ? (
            <Suspense fallback={<Skeleton className="h-48" />}>
              <RevenueChart data={analytics.recoveryTrend} xKey="label" series={[{ key: 'recoveryPercent', label: 'Recovery %', color: '#10b981' }]} valueFormatter={(v) => `${v}%`} height={200} />
            </Suspense>
          ) : (
            <Skeleton className="h-48" />
          )}
        </AnalyticsCard>

        <AnalyticsCard title="Ageing Analysis" description="Outstanding by age bucket">
          {analyticsStatus === 'success' && analytics ? (
            <Suspense fallback={<Skeleton className="h-48" />}>
              <PieChart data={analytics.ageingBuckets} dataKey="amount" nameKey="bucket" valueFormatter={formatCurrency} height={200} />
            </Suspense>
          ) : (
            <Skeleton className="h-48" />
          )}
        </AnalyticsCard>
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <OverdueTable onApplyPenalty={setPenaltyTarget} />
      </div>

      {penaltyTarget && <ApplyPenaltyDialog row={penaltyTarget} onClose={() => setPenaltyTarget(null)} />}
    </div>
  )
}

function ApplyPenaltyDialog({ row, onClose }) {
  const calculate = useLateFeeStore((state) => state.calculate)
  const isCalculating = useLateFeeStore((state) => state.isCalculating)
  const result = useLateFeeStore((state) => state.result)
  const clearResult = useLateFeeStore((state) => state.clearResult)
  const applyPenalty = usePenaltyStore((state) => state.applyPenalty)
  const actioningId = usePenaltyStore((state) => state.actioningId)
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    calculate({ originalAmount: row.outstandingAmount, daysOverdue: row.daysOverdue, rule: 'perDay' })
    return () => clearResult()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row.id])

  async function handleApply() {
    if (!result) return
    await applyPenalty(row.id, { penalty: result.penalty, remarks: 'Applied from Overdue Fees quick action' })
    setApplied(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div role="dialog" aria-modal="true" aria-label="Apply penalty" className="relative z-10 w-full max-w-sm rounded-clay border border-white/50 bg-white/95 p-6 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-white/10">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Apply Penalty · {row.studentName}</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{row.daysOverdue} days overdue on {formatCurrency(row.outstandingAmount)}</p>

        {applied ? (
          <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Penalty applied successfully.</p>
        ) : (
          <>
            <div className="mt-4 rounded-xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              {isCalculating || !result ? (
                <Skeleton className="h-16" />
              ) : (
                <dl className="grid grid-cols-2 gap-y-2 text-sm">
                  <dt className="text-slate-500 dark:text-slate-400">Calculated Penalty</dt>
                  <dd className="text-right font-semibold text-red-600 dark:text-red-400">{formatCurrency(result.penalty)}</dd>
                  <dt className="text-slate-500 dark:text-slate-400">Net Payable</dt>
                  <dd className="text-right font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(result.netPayable)}</dd>
                </dl>
              )}
            </div>
            <div className="mt-5 flex gap-3">
              <SecondaryButton fullWidth={false} onClick={onClose}>
                Cancel
              </SecondaryButton>
              <PrimaryButton fullWidth={false} isLoading={actioningId === row.id} onClick={handleApply} disabled={!result}>
                Apply Penalty
              </PrimaryButton>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
