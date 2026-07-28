import { useEffect } from 'react'
import { BarChart3, CheckCircle2, IndianRupee, Receipt, Wallet } from 'lucide-react'
import { useOverviewStore } from '../store/overviewStore'
import DataTable from '../../../../components/common/DataTable'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import EmptyState from '../../../../components/common/EmptyState'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { formatDate } from '../../../../utils/formatDate'
import PageHeaderSimple from '../components/PageHeaderSimple'
import SectionHeader from '../components/SectionHeader'
import SummaryCard from '../components/SummaryCard'
import RevenueTrendCard from '../components/RevenueTrendCard'
import { PAYMENT_STATUS_LABEL, PAYMENT_STATUS_VARIANT } from '../utils/paymentsUtils'

const COLUMNS = [
  { key: 'id', header: 'Transaction ID' },
  { key: 'studentName', header: 'Student' },
  { key: 'accountant', header: 'Processed By' },
  { key: 'method', header: 'Method' },
  { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
  { key: 'status', header: 'Status', render: (row) => <Badge variant={PAYMENT_STATUS_VARIANT[row.status]}>{PAYMENT_STATUS_LABEL[row.status]}</Badge> },
  { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
]

export default function PaymentsOverview() {
  const summaryStatus = useOverviewStore((state) => state.summaryStatus)
  const summaryError = useOverviewStore((state) => state.summaryError)
  const summary = useOverviewStore((state) => state.summary)
  const fetchSummary = useOverviewStore((state) => state.fetchSummary)

  const transactionsStatus = useOverviewStore((state) => state.transactionsStatus)
  const transactionsError = useOverviewStore((state) => state.transactionsError)
  const transactions = useOverviewStore((state) => state.transactions)
  const fetchTransactions = useOverviewStore((state) => state.fetchTransactions)

  useEffect(() => {
    fetchSummary()
    fetchTransactions()
  }, [fetchSummary, fetchTransactions])

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Payments Overview" />

      <div aria-live="polite" className="sr-only">
        {summaryStatus === 'success' && `Total collected today ${formatCurrency(summary?.collectedToday ?? 0)}.`}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={IndianRupee}
          label="Total Collected Today"
          value={summary ? formatCurrency(summary.collectedToday) : '—'}
          trend={summary?.collectedTodayTrend}
          status={summaryStatus}
          error={summaryError}
          tone="brand"
        />
        <SummaryCard
          icon={Wallet}
          label="Total Collected This Month"
          value={summary ? formatCurrency(summary.collectedMonth) : '—'}
          trend={summary?.collectedMonthTrend}
          status={summaryStatus}
          error={summaryError}
          tone="brand"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Success Rate"
          value={summary ? `${summary.successRate}%` : '—'}
          trend={summary?.successRateTrend}
          status={summaryStatus}
          error={summaryError}
          tone="success"
        />
        <SummaryCard
          icon={BarChart3}
          label="Avg. Transaction Value"
          value={summary ? formatCurrency(summary.avgTransactionValue) : '—'}
          trend={summary?.avgTransactionValueTrend}
          status={summaryStatus}
          error={summaryError}
          tone="brand"
        />
      </div>

      <RevenueTrendCard />

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Recent Transactions" description="Most recent payments recorded across all accountants" />

        {transactionsStatus === 'loading' && (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10" />
            ))}
          </div>
        )}

        {transactionsStatus === 'error' && <ErrorState message={transactionsError} onRetry={fetchTransactions} />}

        {transactionsStatus === 'success' && transactions.length === 0 && (
          <EmptyState icon={Receipt} title="No transactions yet" description="Recorded payments will appear here." />
        )}

        {transactionsStatus === 'success' && transactions.length > 0 && (
          <DataTable columns={COLUMNS} rows={transactions} emptyMessage="No transactions found." />
        )}
      </div>
    </div>
  )
}
