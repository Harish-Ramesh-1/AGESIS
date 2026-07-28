import { useEffect, useState } from 'react'
import { Search, Server } from 'lucide-react'
import { useGatewayStore } from '../store/gatewayStore'
import DataTable from '../../../../components/common/DataTable'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import EmptyState from '../../../../components/common/EmptyState'
import { SecondaryButton } from '../../../../components/common/Button'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { formatDate } from '../../../../utils/formatDate'
import PageHeaderSimple from '../components/PageHeaderSimple'
import SectionHeader from '../components/SectionHeader'
import { PAYMENT_METHODS } from '../services/paymentsService'
import { GATEWAY_STATUS_LABEL, GATEWAY_STATUS_VARIANT } from '../utils/paymentsUtils'

const GATEWAY_STATUS_OPTIONS = ['', 'captured', 'authorized', 'failed']

const selectClass =
  'rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

const COLUMNS = [
  { key: 'gatewayReferenceId', header: 'Gateway Ref. ID' },
  { key: 'orderId', header: 'Order ID' },
  { key: 'studentName', header: 'Student' },
  { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
  { key: 'method', header: 'Method' },
  { key: 'gatewayStatus', header: 'Gateway Status', render: (row) => <Badge variant={GATEWAY_STATUS_VARIANT[row.gatewayStatus]}>{GATEWAY_STATUS_LABEL[row.gatewayStatus]}</Badge> },
  { key: 'timestamp', header: 'Timestamp', render: (row) => formatDate(row.timestamp) },
]

export default function GatewayTransactions() {
  const status = useGatewayStore((state) => state.status)
  const error = useGatewayStore((state) => state.error)
  const items = useGatewayStore((state) => state.items)
  const fetchTransactions = useGatewayStore((state) => state.fetchTransactions)

  const [query, setQuery] = useState('')
  const [gatewayStatus, setGatewayStatus] = useState('')
  const [method, setMethod] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchTransactions({ query, gatewayStatus, method })
    }, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, gatewayStatus, method])

  function handleReset() {
    setQuery('')
    setGatewayStatus('')
    setMethod('')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Gateway Transactions" />

      <div aria-live="polite" className="sr-only">
        {status === 'success' && `${items.length} gateway transactions matching current filters.`}
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Raw Gateway Log" description="Every transaction attempt recorded by the payment gateway" />

        <div className="mb-4 flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by gateway ref., order ID or student"
              aria-label="Search gateway transactions"
              className="w-full rounded-clay border border-white/50 bg-white/50 py-3 pl-11 pr-4 text-sm text-slate-800 shadow-clay-inset backdrop-blur-xl transition-colors duration-200 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="gateway-status" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Gateway Status
              </label>
              <select id="gateway-status" value={gatewayStatus} onChange={(event) => setGatewayStatus(event.target.value)} className={selectClass}>
                <option value="">All Statuses</option>
                {GATEWAY_STATUS_OPTIONS.filter(Boolean).map((option) => (
                  <option key={option} value={option}>
                    {GATEWAY_STATUS_LABEL[option]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="gateway-method" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Method
              </label>
              <select id="gateway-method" value={method} onChange={(event) => setMethod(event.target.value)} className={selectClass}>
                <option value="">All Methods</option>
                {PAYMENT_METHODS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <SecondaryButton fullWidth={false} onClick={handleReset}>
              Reset
            </SecondaryButton>
          </div>
        </div>

        {status === 'loading' && (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={() => fetchTransactions({ query, gatewayStatus, method })} />}

        {status === 'success' && items.length === 0 && (
          <EmptyState icon={Server} title="No gateway transactions found" description="Try adjusting your search or filters." />
        )}

        {status === 'success' && items.length > 0 && <DataTable columns={COLUMNS} rows={items} emptyMessage="No gateway transactions found." />}
      </div>
    </div>
  )
}
