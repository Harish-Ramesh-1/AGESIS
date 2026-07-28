import { ChevronDown, ShieldCheck } from 'lucide-react'
import DataTable from '../../../../components/common/DataTable'
import EmptyState from '../../../../components/common/EmptyState'

export default function SecurityTable({
  columns,
  rows,
  keyField = 'id',
  titleKey,
  subtitleKey,
  trailingKey,
  emptyIcon: EmptyIcon = ShieldCheck,
  emptyTitle = 'No records found',
  emptyMessage = 'Try adjusting your search or filters.',
}) {
  if (rows.length === 0) return <EmptyState icon={EmptyIcon} title={emptyTitle} description={emptyMessage} />

  const titleColumn = columns.find((c) => c.key === titleKey)
  const trailingColumn = columns.find((c) => c.key === trailingKey)
  const detailColumns = columns.filter((c) => c.key !== titleKey)

  return (
    <div>
      <div className="hidden md:block">
        <DataTable columns={columns} rows={rows} keyField={keyField} emptyMessage={emptyMessage} />
      </div>
      <div className="flex flex-col gap-2 md:hidden">
        {rows.map((row) => (
          <details key={row[keyField]} className="group rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                  {titleColumn?.render ? titleColumn.render(row) : row[titleKey]}
                </div>
                {subtitleKey && <p className="truncate text-xs text-slate-400 dark:text-slate-500">{row[subtitleKey]}</p>}
              </div>
              <span className="flex shrink-0 items-center gap-2">
                {trailingColumn && (
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {trailingColumn.render ? trailingColumn.render(row) : row[trailingKey]}
                  </span>
                )}
                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 ease-premium group-open:rotate-180" aria-hidden="true" />
              </span>
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200/70 pt-3 text-xs dark:border-white/10">
              {detailColumns.map((column) => (
                <div key={column.key}>
                  <p className="text-slate-400 dark:text-slate-500">{column.header}</p>
                  <div className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">
                    {column.render ? column.render(row) : row[column.key]}
                  </div>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
