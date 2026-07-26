import { ChevronDown } from 'lucide-react'
import DataTable from '../../../components/common/DataTable'
import Badge from '../../../components/common/Badge'
import { formatCurrency } from '../../../utils/formatCurrency'

const STATUS_META = {
  paid: { variant: 'success', label: 'Paid' },
  partial: { variant: 'warning', label: 'Partial' },
  pending: { variant: 'danger', label: 'Pending' },
  applied: { variant: 'info', label: 'Applied' },
  not_applicable: { variant: 'neutral', label: 'N/A' },
}

export default function FeeBreakdownTable({ components }) {
  const columns = [
    { key: 'label', header: 'Fee Component' },
    { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'paid', header: 'Paid', render: (row) => formatCurrency(row.paid) },
    { key: 'pending', header: 'Pending', render: (row) => formatCurrency(row.pending) },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const meta = STATUS_META[row.status] ?? STATUS_META.pending
        return <Badge variant={meta.variant}>{meta.label}</Badge>
      },
    },
  ]

  return (
    <>
      <div className="hidden md:block">
        <DataTable columns={columns} rows={components} keyField="key" emptyMessage="No fee components found." />
      </div>

      {/* Mobile: rows become expandable cards instead of a horizontally-scrolling table */}
      <div className="flex flex-col gap-2 md:hidden">
        {components.map((component) => {
          const meta = STATUS_META[component.status] ?? STATUS_META.pending
          return (
            <details
              key={component.key}
              className="group rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{component.label}</span>
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(component.amount)}
                  </span>
                  <ChevronDown
                    className="h-4 w-4 text-slate-400 transition-transform duration-200 ease-premium group-open:rotate-180"
                    aria-hidden="true"
                  />
                </span>
              </summary>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-200/70 pt-3 text-xs dark:border-white/10">
                <div>
                  <p className="text-slate-400 dark:text-slate-500">Paid</p>
                  <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">
                    {formatCurrency(component.paid)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500">Pending</p>
                  <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">
                    {formatCurrency(component.pending)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500">Status</p>
                  <Badge variant={meta.variant} className="mt-0.5">
                    {meta.label}
                  </Badge>
                </div>
              </div>
            </details>
          )
        })}
      </div>
    </>
  )
}
