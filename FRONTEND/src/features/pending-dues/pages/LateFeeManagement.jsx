import { useEffect, useMemo } from 'react'
import { BadgeCheck, BadgePercent, ClipboardX, ShieldOff } from 'lucide-react'
import { usePendingDueStore } from '../store/pendingDueStore'
import { usePenaltyStore } from '../store/penaltyStore'
import { useLateFeeStore } from '../store/lateFeeStore'
import Skeleton from '../../../components/common/Skeleton'
import Timeline from '../../../components/common/Timeline'
import PendingDuesPageHeader from '../components/PendingDuesPageHeader'
import SectionHeader from '../components/SectionHeader'
import OutstandingSummaryCard from '../components/OutstandingSummaryCard'
import LateFeeCalculator from '../components/LateFeeCalculator'
import PenaltyTable from '../components/PenaltyTable'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatRelativeTime } from '../../../utils/formatDate'
import { PENALTY_STATUS_LABEL } from '../utils/pendingDuesUtils'

export default function LateFeeManagement() {
  const overdueStatus = usePendingDueStore((state) => state.overdueStatus)
  const overdueList = usePendingDueStore((state) => state.overdueList)
  const fetchOverdue = usePendingDueStore((state) => state.fetchOverdue)

  const historyStatus = usePenaltyStore((state) => state.historyStatus)
  const history = usePenaltyStore((state) => state.history)
  const fetchHistory = usePenaltyStore((state) => state.fetchHistory)

  const rules = useLateFeeStore((state) => state.rules)

  useEffect(() => {
    fetchOverdue({})
    fetchHistory()
  }, [fetchOverdue, fetchHistory])

  const summary = useMemo(() => {
    const totalLateFees = overdueList.reduce((sum, row) => sum + row.lateFee, 0)
    const pendingPenalties = overdueList.filter((row) => row.penaltyStatus === 'pending').reduce((sum, row) => sum + row.lateFee, 0)
    const waivedAmount = history.filter((item) => item.action === 'Penalty Waived').reduce((sum, item) => sum + item.amount, 0)
    const collectedPenalties = history.filter((item) => item.action === 'Penalty Applied').reduce((sum, item) => sum + item.amount, 0)
    return { totalLateFees, pendingPenalties, waivedAmount, collectedPenalties }
  }, [overdueList, history])

  return (
    <div className="flex flex-col gap-6">
      <PendingDuesPageHeader pageTitle="Late Fee Management" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OutstandingSummaryCard icon={ShieldOff} label="Total Late Fees" value={formatCurrency(summary.totalLateFees)} status={overdueStatus} />
        <OutstandingSummaryCard icon={BadgePercent} label="Waived Amount" value={formatCurrency(summary.waivedAmount)} status={historyStatus} />
        <OutstandingSummaryCard icon={BadgeCheck} label="Applied Penalties" value={formatCurrency(summary.collectedPenalties)} status={historyStatus} />
        <OutstandingSummaryCard icon={ClipboardX} label="Pending Penalties" value={formatCurrency(summary.pendingPenalties)} status={overdueStatus} />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Late Fee Rules" description="Active penalty configuration" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: 'Per Day', value: formatCurrency(rules.perDay) },
            { label: 'Flat Amount', value: formatCurrency(rules.flatAmount) },
            { label: 'Percentage', value: `${rules.percentage}%` },
            { label: 'Max Penalty', value: formatCurrency(rules.maxPenalty) },
            { label: 'Grace Period', value: `${rules.gracePeriodDays} days` },
          ].map((rule) => (
            <div key={rule.label} className="rounded-xl border border-white/40 bg-white/40 px-3 py-3 text-center dark:border-white/10 dark:bg-white/[0.03]">
              <p className="text-xs text-slate-400 dark:text-slate-500">{rule.label}</p>
              <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{rule.value}</p>
            </div>
          ))}
        </div>
      </div>

      <LateFeeCalculator />

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Penalty Management" description="Overdue accounts with late fees applied or pending" />
        <PenaltyTable />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Late Fee Timeline" description="Penalty adjustments and waiver history" />
        {historyStatus === 'loading' && <Skeleton className="h-32" />}
        {historyStatus === 'success' && history.length === 0 && <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">No penalty activity yet.</p>}
        {historyStatus === 'success' && history.length > 0 && (
          <Timeline
            items={history.map((item) => ({
              id: item.id,
              icon: item.action === 'Penalty Waived' ? BadgePercent : item.action === 'Penalty Adjusted' ? ShieldOff : BadgeCheck,
              tone: item.action === 'Penalty Waived' ? 'emerald' : item.action === 'Penalty Adjusted' ? 'amber' : 'red',
              title: `${item.studentName} · ${item.action}`,
              badge: PENALTY_STATUS_LABEL[item.action === 'Penalty Waived' ? 'waived' : 'applied'],
              description: `${formatCurrency(item.amount)}${item.remarks ? ` — ${item.remarks}` : ''}`,
              meta: `${formatRelativeTime(item.date)} · ${item.updatedBy}`,
            }))}
          />
        )}
      </div>
    </div>
  )
}
