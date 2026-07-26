import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock, Download, FileSpreadsheet, FileText, Printer, Receipt, Wallet } from 'lucide-react'
import { usePaymentHistoryStore } from '../store/paymentsStore'
import { useAnalyticsStore } from '../store/analyticsStore'
import useTransactionFilters from '../hooks/useTransactionFilters'
import { downloadCsv, downloadPdf, printContent } from '../utils/exportUtils'
import PageHeader from '../components/PageHeader'
import SectionHeader from '../components/SectionHeader'
import PaymentSummaryCard from '../components/PaymentSummaryCard'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'
import TransactionTable from '../components/TransactionTable'
import TimelineCard from '../components/TimelineCard'
import AnalyticsChart from '../components/AnalyticsChart'
import DownloadCard from '../components/DownloadCard'
import GlassCard from '../../../components/common/GlassCard'
import Skeleton from '../../../components/common/Skeleton'
import ErrorState from '../../../components/common/ErrorState'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatDate } from '../../../utils/formatDate'

const CHART_SERIES = [{ key: 'paid', label: 'Paid', color: '#3d52c4' }]

export default function PaymentHistory() {
  const status = usePaymentHistoryStore((state) => state.status)
  const transactions = usePaymentHistoryStore((state) => state.transactions)
  const summary = usePaymentHistoryStore((state) => state.summary)
  const fetchPaymentHistory = usePaymentHistoryStore((state) => state.fetchPaymentHistory)

  const analyticsStatus = useAnalyticsStore((state) => state.status)
  const monthlyTrend = useAnalyticsStore((state) => state.monthlyTrend)
  const annualSummary = useAnalyticsStore((state) => state.annualSummary)
  const fetchAnalytics = useAnalyticsStore((state) => state.fetchAnalytics)

  const { filters, setFilter, resetFilters, filteredTransactions, isFiltered } = useTransactionFilters(transactions)
  const [selectedTransactionId, setSelectedTransactionId] = useState(null)

  useEffect(() => {
    fetchPaymentHistory()
    fetchAnalytics()
  }, [fetchPaymentHistory, fetchAnalytics])

  const filterOptions = useMemo(() => {
    const unique = (key) => [...new Set(transactions.map((transaction) => transaction[key]))].sort()
    return {
      academicYears: unique('academicYear'),
      months: unique('month'),
      methods: unique('method'),
      statuses: unique('status'),
      categories: unique('feeCategory'),
    }
  }, [transactions])

  const selectedTransaction = useMemo(() => {
    if (selectedTransactionId) {
      const found = transactions.find((transaction) => transaction.id === selectedTransactionId)
      if (found) return found
    }
    return transactions.find((transaction) => transaction.status === 'paid') ?? null
  }, [transactions, selectedTransactionId])

  function handleExportExcel() {
    downloadCsv(
      'payment-history.csv',
      ['Transaction ID', 'Receipt No.', 'Date', 'Fee Category', 'Method', 'Amount', 'Status'],
      filteredTransactions.map((transaction) => [
        transaction.id,
        transaction.receiptNumber ?? '',
        transaction.date,
        transaction.feeCategory,
        transaction.method,
        transaction.amount,
        transaction.status,
      ]),
    )
  }

  function handleExportPdf() {
    downloadPdf(
      'payment-history.pdf',
      'Payment History Statement',
      filteredTransactions.map(
        (transaction) =>
          `${formatDate(transaction.date)}  ${transaction.id}  ${transaction.feeCategory}  ${formatCurrency(transaction.amount)}  ${transaction.status}`,
      ),
    )
  }

  function handlePrintStatement() {
    printContent(
      'Payment History Statement',
      filteredTransactions.map(
        (transaction) =>
          `${formatDate(transaction.date)} — ${transaction.id} — ${transaction.feeCategory} — ${formatCurrency(transaction.amount)} — ${transaction.status}`,
      ),
    )
  }

  function handleDownloadAllReceipts() {
    filteredTransactions
      .filter((transaction) => transaction.receiptNumber)
      .forEach((transaction) => {
        downloadPdf(`${transaction.receiptNumber}.pdf`, 'Payment Receipt', [
          `Receipt Number: ${transaction.receiptNumber}`,
          `Transaction ID: ${transaction.id}`,
          `Date: ${formatDate(transaction.date)}`,
          `Amount: ${formatCurrency(transaction.amount)}`,
        ])
      })
  }

  if (status === 'error') {
    return (
      <div>
        <PageHeader title="Payment History" description="Every successful and failed payment made to the school." />
        <ErrorState message="Couldn't load payment history." onRetry={fetchPaymentHistory} />
      </div>
    )
  }

  if (status !== 'success' || !summary) {
    return (
      <div>
        <PageHeader title="Payment History" description="Every successful and failed payment made to the school." />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Payment History" description="Every successful and failed payment made to the school." />

      <div className="flex flex-col gap-8">
        <section>
          <SectionHeader title="Payment Summary" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <PaymentSummaryCard icon={Wallet} label="Total Paid" value={formatCurrency(summary.totalPaid)} tone="brand" />
            <PaymentSummaryCard
              icon={Receipt}
              label="Total Transactions"
              value={summary.totalTransactions}
              tone="emerald"
            />
            <PaymentSummaryCard
              icon={Clock}
              label="Pending Payments"
              value={formatCurrency(summary.pendingAmount)}
              description={`${summary.pendingCount} pending`}
              tone="amber"
            />
            <PaymentSummaryCard
              icon={CheckCircle2}
              label="Last Payment"
              value={summary.lastPayment ? formatCurrency(summary.lastPayment.amount) : '—'}
              description={summary.lastPayment ? formatDate(summary.lastPayment.date) : 'No payments yet'}
              tone="violet"
            />
          </div>
        </section>

        <section>
          <SectionHeader title="Search & Filters" />
          <GlassCard hover={false}>
            <div className="flex flex-col gap-4">
              <SearchBar
                value={filters.search}
                onChange={(value) => setFilter('search', value)}
                placeholder="Search by transaction, receipt or invoice number..."
              />
              <FilterBar
                filters={filters}
                onFilterChange={setFilter}
                onReset={resetFilters}
                isFiltered={isFiltered}
                options={filterOptions}
              />
            </div>
          </GlassCard>
        </section>

        <section>
          <SectionHeader
            title="Transaction History"
            description={`${filteredTransactions.length} of ${transactions.length} transactions`}
          />
          <GlassCard hover={false}>
            <TransactionTable
              transactions={filteredTransactions}
              onView={(transaction) => setSelectedTransactionId(transaction.id)}
            />
          </GlassCard>
        </section>

        <TimelineCard transaction={selectedTransaction} />

        <section>
          <SectionHeader title="Payment Analytics" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <GlassCard className="p-5">
              <p className="text-xs text-slate-400 dark:text-slate-500">Total Amount Paid</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {analyticsStatus === 'success' && annualSummary ? formatCurrency(annualSummary.totalPaid) : '—'}
              </p>
            </GlassCard>
            <GlassCard className="p-5">
              <p className="text-xs text-slate-400 dark:text-slate-500">Average Payment</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {analyticsStatus === 'success' && annualSummary ? formatCurrency(annualSummary.averagePayment) : '—'}
              </p>
            </GlassCard>
            <GlassCard className="p-5">
              <p className="text-xs text-slate-400 dark:text-slate-500">Payment Frequency</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {analyticsStatus === 'success' && annualSummary ? annualSummary.paymentFrequency : '—'}
              </p>
            </GlassCard>
          </div>
          <GlassCard hover={false} title="Monthly Payments" className="mt-4">
            {analyticsStatus === 'success' ? (
              <AnalyticsChart
                type="trend"
                data={monthlyTrend}
                xKey="month"
                series={CHART_SERIES}
                valueFormatter={formatCurrency}
              />
            ) : (
              <Skeleton className="h-64" />
            )}
          </GlassCard>
        </section>

        <DownloadCard
          title="Quick Actions"
          actions={[
            { label: 'Download All Receipts', icon: Download, onClick: handleDownloadAllReceipts },
            { label: 'Export PDF', icon: FileText, onClick: handleExportPdf },
            { label: 'Export Excel', icon: FileSpreadsheet, onClick: handleExportExcel },
            { label: 'Print Statement', icon: Printer, onClick: handlePrintStatement },
          ]}
        />
      </div>
    </div>
  )
}
