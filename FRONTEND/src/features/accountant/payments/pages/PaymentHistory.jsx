import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { BarChart3, CalendarDays, Landmark, Search, X } from 'lucide-react'
import { useHistoryStore } from '../store/historyStore'
import { usePaymentReceiptStore } from '../store/receiptStore'
import Skeleton from '../../../../components/common/Skeleton'
import { PrimaryButton, SecondaryButton } from '../../../../components/common/Button'
import PaymentsPageHeader from '../components/PaymentsPageHeader'
import SectionHeader from '../components/SectionHeader'
import TransactionTable from '../components/TransactionTable'
import AnalyticsCard from '../components/AnalyticsCard'
import ReceiptPreview from '../components/ReceiptPreview'
import { PAYMENT_METHODS } from '../services/paymentsService'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { downloadTextFile } from '../../../../utils/downloadTextFile'
import { formatDate } from '../../../../utils/formatDate'

const RevenueChart = lazy(() => import('../../../../components/charts/RevenueChart'))

const STATUS_OPTIONS = ['', 'paid', 'partial', 'refunded', 'cancelled']

const selectClass =
  'rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function PaymentHistory() {
  const status = useHistoryStore((state) => state.status)
  const transactions = useHistoryStore((state) => state.transactions)
  const fetchHistory = useHistoryStore((state) => state.fetchHistory)
  const receiptStatus = usePaymentReceiptStore((state) => state.status)
  const activeReceipt = usePaymentReceiptStore((state) => state.activeReceipt)
  const closeReceipt = usePaymentReceiptStore((state) => state.closeReceipt)

  const [query, setQuery] = useState('')
  const [method, setMethod] = useState('')
  const [txnStatus, setTxnStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchHistory({ query, method, status: txnStatus, dateFrom, dateTo })
    }, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, method, txnStatus, dateFrom, dateTo])

  function handleReset() {
    setQuery('')
    setMethod('')
    setTxnStatus('')
    setDateFrom('')
    setDateTo('')
  }

  function handleExport() {
    const header = 'Transaction ID,Receipt No.,Student,Amount,Method,Status,Date,Collected By'
    const rows = transactions.map((row) => [row.id, row.receiptNumber, row.studentName, row.amount, row.method, row.status, formatDate(row.date), row.collectedBy].join(','))
    downloadTextFile('payment-history.csv', [header, ...rows].join('\n'))
  }

  const today = new Date().toISOString().slice(0, 10)
  const dailyCollection = transactions.filter((row) => row.date.slice(0, 10) === today).reduce((sum, row) => sum + row.amount, 0)
  const monthKey = today.slice(0, 7)
  const monthlyCollection = transactions.filter((row) => row.date.slice(0, 7) === monthKey).reduce((sum, row) => sum + row.amount, 0)

  const trendData = useMemo(() => {
    const byDate = new Map()
    ;[...transactions]
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((row) => {
        const key = formatDate(row.date)
        byDate.set(key, (byDate.get(key) ?? 0) + row.amount)
      })
    return [...byDate.entries()].slice(-7).map(([label, revenue]) => ({ label, revenue }))
  }, [transactions])

  return (
    <div className="flex flex-col gap-6">
      <PaymentsPageHeader pageTitle="Payment History" onExport={handleExport} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AnalyticsCard icon={CalendarDays} label="Daily Collection" value={formatCurrency(dailyCollection)} meta="Collected today" status={status} />
        <AnalyticsCard icon={Landmark} label="Monthly Collection" value={formatCurrency(monthlyCollection)} meta="This calendar month" status={status} />
        <AnalyticsCard icon={BarChart3} label="Total Transactions" value={transactions.length} meta="Matching current filters" status={status} />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Payment Trends" description="Daily collection across the last 7 active days" />
        {trendData.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No data to chart yet.</p>
        ) : (
          <Suspense fallback={<Skeleton className="h-56" />}>
            <RevenueChart data={trendData} xKey="label" series={[{ key: 'revenue', label: 'Collection', color: '#3d52c4' }]} valueFormatter={formatCurrency} height={220} />
          </Suspense>
        )}
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Transaction History" />

        <div className="mb-4 flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by transaction ID, receipt number or student"
              className="w-full rounded-clay border border-white/50 bg-white/50 py-3 pl-11 pr-4 text-sm text-slate-800 shadow-clay-inset backdrop-blur-xl transition-colors duration-200 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200">From</label>
              <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className={selectClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200">To</label>
              <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className={selectClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Method</label>
              <select value={method} onChange={(event) => setMethod(event.target.value)} className={selectClass}>
                <option value="">All Methods</option>
                {PAYMENT_METHODS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Status</label>
              <select value={txnStatus} onChange={(event) => setTxnStatus(event.target.value)} className={selectClass}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option || 'all'} value={option}>
                    {option ? option[0].toUpperCase() + option.slice(1) : 'All Statuses'}
                  </option>
                ))}
              </select>
            </div>
            <SecondaryButton fullWidth={false} onClick={handleReset}>
              Reset
            </SecondaryButton>
          </div>
        </div>

        <TransactionTable />
      </div>

      {(receiptStatus === 'loading' || activeReceipt) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div aria-hidden="true" onClick={closeReceipt} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md">
            {receiptStatus === 'loading' ? (
              <div className="rounded-clay border border-white/50 bg-white/95 p-6 shadow-glass dark:border-white/10 dark:bg-slate-900/95">
                <Skeleton className="h-64" />
              </div>
            ) : (
              <>
                <ReceiptPreview receipt={activeReceipt} />
                <div className="mt-3 flex justify-center">
                  <PrimaryButton fullWidth={false} onClick={closeReceipt}>
                    <X className="h-4 w-4" aria-hidden="true" />
                    Close
                  </PrimaryButton>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
