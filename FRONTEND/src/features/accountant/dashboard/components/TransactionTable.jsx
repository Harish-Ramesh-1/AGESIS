import { useEffect } from 'react'
import { ChevronDown, Eye } from 'lucide-react'
import { usePaymentStore } from '../store/paymentStore'
import DataTable from '../../../../components/common/DataTable'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import SectionHeader from './SectionHeader'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { formatDate } from '../../../../utils/formatDate'
import { downloadTextFile } from '../../../../utils/downloadTextFile'
import { STATUS_BADGE_VARIANT } from '../utils/dashboardUtils'

const STATUS_LABEL = { success: 'Success', failed: 'Failed', pending: 'Pending' }

function viewReceipt(row) {
  downloadTextFile(
    `${row.id}.txt`,
    `Receipt\n${row.id}\nStudent: ${row.student}\nDate: ${formatDate(row.date)}\nAmount: ${formatCurrency(row.amount)}\nMethod: ${row.method}\nStatus: ${STATUS_LABEL[row.status]}`,
  )
}

export default function TransactionTable() {
  const status = usePaymentStore((state) => state.status)
  const transactions = usePaymentStore((state) => state.transactions)
  const error = usePaymentStore((state) => state.error)
  const fetchRecentTransactions = usePaymentStore((state) => state.fetchRecentTransactions)

  useEffect(() => {
    fetchRecentTransactions()
  }, [fetchRecentTransactions])

  const columns = [
    { key: 'id', header: 'Transaction ID' },
    { key: 'student', header: 'Student' },
    { key: 'method', header: 'Method' },
    { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge variant={STATUS_BADGE_VARIANT[row.status]}>{STATUS_LABEL[row.status]}</Badge>,
    },
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    {
      key: 'action',
      header: 'Receipt',
      render: (row) => (
        <button
          type="button"
          aria-label={`View receipt for ${row.id}`}
          onClick={() => viewReceipt(row)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 ease-premium hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
        </button>
      ),
    },
  ]

  return (
    <div className="relative h-full overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <SectionHeader title="Recent Transactions" description="Latest 10 transactions" />

      {status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load transactions. {error}</p>
      )}

      {(status === 'loading' || status === 'idle') && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-10" />
          ))}
        </div>
      )}

      {status === 'success' && (
        <>
          <div className="hidden md:block">
            <DataTable columns={columns} rows={transactions} emptyMessage="No transactions yet." />
          </div>

          <div className="flex flex-col gap-2 md:hidden">
            {transactions.map((row) => (
              <details
                key={row.id}
                className="group rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{row.student}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{row.id}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(row.amount)}
                    </span>
                    <ChevronDown
                      className="h-4 w-4 text-slate-400 transition-transform duration-200 ease-premium group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </span>
                </summary>
                <div className="mt-3 flex flex-col gap-3 border-t border-slate-200/70 pt-3 dark:border-white/10">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-slate-400 dark:text-slate-500">Method</p>
                      <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{row.method}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 dark:text-slate-500">Date</p>
                      <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{formatDate(row.date)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 dark:text-slate-500">Status</p>
                      <Badge variant={STATUS_BADGE_VARIANT[row.status]} className="mt-0.5">
                        {STATUS_LABEL[row.status]}
                      </Badge>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => viewReceipt(row)}
                    className="inline-flex items-center gap-1.5 self-start rounded-lg border border-white/50 bg-white/60 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/80 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    View Receipt
                  </button>
                </div>
              </details>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
