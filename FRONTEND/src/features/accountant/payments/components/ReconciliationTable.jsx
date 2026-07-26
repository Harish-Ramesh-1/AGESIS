import { ChevronDown, Wrench } from 'lucide-react'
import DataTable from '../../../../components/common/DataTable'
import EmptyState from '../../../../components/common/EmptyState'
import { CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { formatDate } from '../../../../utils/formatDate'

export default function ReconciliationTable({ rows, variant, onResolve, emptyMessage }) {
  if (rows.length === 0) {
    return <EmptyState icon={CheckCircle2} title="Nothing here" description={emptyMessage ?? 'No records in this category.'} />
  }

  const columns = [
    { key: 'transactionId', header: 'Transaction ID' },
    { key: 'studentName', header: 'Student' },
    { key: 'gatewayAmount', header: 'Gateway Amount', render: (row) => formatCurrency(row.gatewayAmount) },
    { key: 'ledgerAmount', header: 'Ledger Amount', render: (row) => formatCurrency(row.ledgerAmount) },
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    { key: 'note', header: 'Note', render: (row) => row.note ?? '—' },
  ]

  if (variant !== 'matched') {
    columns.push({
      key: 'action',
      header: 'Action',
      render: (row) => (
        <button
          type="button"
          onClick={() => onResolve(row)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/50 bg-white/60 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/80 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/10"
        >
          <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
          {variant === 'duplicate' ? 'Resolve Conflict' : 'Manual Match'}
        </button>
      ),
    })
  }

  return (
    <>
      <div className="hidden md:block">
        <DataTable columns={columns} rows={rows} keyField="id" emptyMessage={emptyMessage ?? 'No records.'} />
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {rows.map((row) => (
          <details key={row.id} className="group rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{row.studentName}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{row.transactionId}</p>
              </div>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(row.gatewayAmount)}</span>
                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 ease-premium group-open:rotate-180" aria-hidden="true" />
              </span>
            </summary>
            <div className="mt-3 flex flex-col gap-3 border-t border-slate-200/70 pt-3 text-xs dark:border-white/10">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-slate-400 dark:text-slate-500">Ledger Amount</p>
                  <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{formatCurrency(row.ledgerAmount)}</p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500">Date</p>
                  <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{formatDate(row.date)}</p>
                </div>
              </div>
              {row.note && <p className="text-slate-500 dark:text-slate-400">{row.note}</p>}
              {variant !== 'matched' && (
                <button
                  type="button"
                  onClick={() => onResolve(row)}
                  className="inline-flex items-center gap-1.5 self-start rounded-lg border border-white/50 bg-white/60 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200"
                >
                  <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                  {variant === 'duplicate' ? 'Resolve Conflict' : 'Manual Match'}
                </button>
              )}
            </div>
          </details>
        ))}
      </div>
    </>
  )
}
