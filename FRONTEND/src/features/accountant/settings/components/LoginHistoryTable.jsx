import { ChevronDown, History } from 'lucide-react'
import DataTable from '../../../../components/common/DataTable'
import Badge from '../../../../components/common/Badge'
import EmptyState from '../../../../components/common/EmptyState'
import { formatDate } from '../../../../utils/formatDate'

const STATUS_VARIANT = { success: 'success', failed: 'danger' }
const STATUS_LABEL = { success: 'Success', failed: 'Failed' }

export default function LoginHistoryTable({ rows }) {
  if (!rows.length) {
    return <EmptyState icon={History} title="No login history" description="Login attempts will appear here." />
  }

  const columns = [
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    { key: 'device', header: 'Device' },
    { key: 'ipAddress', header: 'IP Address' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge variant={STATUS_VARIANT[row.status]}>{STATUS_LABEL[row.status]}</Badge>,
    },
  ]

  return (
    <div>
      <div className="hidden md:block">
        <DataTable columns={columns} rows={rows} keyField="id" emptyMessage="No login history found." />
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {rows.map((row) => (
          <details key={row.id} className="group rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{row.device}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(row.date)}</p>
              </div>
              <span className="flex shrink-0 items-center gap-2">
                <Badge variant={STATUS_VARIANT[row.status]}>{STATUS_LABEL[row.status]}</Badge>
                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 ease-premium group-open:rotate-180" aria-hidden="true" />
              </span>
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200/70 pt-3 text-xs dark:border-white/10">
              <div>
                <p className="text-slate-400 dark:text-slate-500">IP Address</p>
                <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{row.ipAddress}</p>
              </div>
              <div>
                <p className="text-slate-400 dark:text-slate-500">Status</p>
                <Badge variant={STATUS_VARIANT[row.status]} className="mt-0.5">
                  {STATUS_LABEL[row.status]}
                </Badge>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
