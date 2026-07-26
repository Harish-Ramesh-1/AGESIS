import { useEffect, useMemo } from 'react'
import { AlertTriangle, ServerCrash, TrendingDown } from 'lucide-react'
import { useFailedTransactionsStore } from '../store/failedTransactionsStore'
import PaymentsPageHeader from '../components/PaymentsPageHeader'
import SectionHeader from '../components/SectionHeader'
import FailedTransactionTable from '../components/FailedTransactionTable'
import AnalyticsCard from '../components/AnalyticsCard'

export default function FailedTransactions() {
  const status = useFailedTransactionsStore((state) => state.status)
  const items = useFailedTransactionsStore((state) => state.items)
  const fetchFailed = useFailedTransactionsStore((state) => state.fetchFailed)

  useEffect(() => {
    fetchFailed()
  }, [fetchFailed])

  const stats = useMemo(() => {
    if (items.length === 0) return { failureRate: 0, gatewayErrors: 0, mostCommon: '—' }
    const failedCount = items.filter((item) => item.status === 'failed').length
    const gatewayErrors = new Set(items.map((item) => item.gatewayResponse)).size
    const counts = {}
    items.forEach((item) => {
      counts[item.failureReason] = (counts[item.failureReason] ?? 0) + 1
    })
    const mostCommon = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
    return { failureRate: Math.round((failedCount / items.length) * 100), gatewayErrors, mostCommon }
  }, [items])

  return (
    <div className="flex flex-col gap-6">
      <PaymentsPageHeader pageTitle="Failed Transactions" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AnalyticsCard icon={TrendingDown} label="Failure Rate" value={`${stats.failureRate}%`} meta="Of tracked attempts still failed" status={status} />
        <AnalyticsCard icon={ServerCrash} label="Gateway Errors" value={stats.gatewayErrors} meta="Distinct gateway error codes" status={status} />
        <AnalyticsCard icon={AlertTriangle} label="Most Common Failure" value={stats.mostCommon} status={status} />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Failed Transactions" description="Track and resolve unsuccessful payment attempts" />
        <FailedTransactionTable />
      </div>
    </div>
  )
}
