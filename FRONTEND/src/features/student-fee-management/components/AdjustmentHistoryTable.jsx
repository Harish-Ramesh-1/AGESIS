import { useEffect, useMemo, useState } from 'react'
import { FileEdit, List, Rows3 } from 'lucide-react'
import clsx from 'clsx'
import { useAdjustmentStore } from '../store/adjustmentStore'
import { useStudentDirectoryStore } from '../store/studentDirectoryStore'
import DataTable from '../../../components/common/DataTable'
import Timeline from '../../../components/common/Timeline'
import Skeleton from '../../../components/common/Skeleton'
import SectionHeader from './SectionHeader'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatDate } from '../../../utils/formatDate'

const selectClass =
  'rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function AdjustmentHistoryTable() {
  const studentId = useStudentDirectoryStore((state) => state.selectedStudentId)
  const status = useAdjustmentStore((state) => state.status)
  const history = useAdjustmentStore((state) => state.history)
  const error = useAdjustmentStore((state) => state.error)
  const fetchHistory = useAdjustmentStore((state) => state.fetchHistory)

  const [view, setView] = useState('timeline')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    if (studentId) fetchHistory(studentId)
  }, [studentId, fetchHistory])

  const categories = useMemo(() => [...new Set(history.map((item) => item.feeComponent))], [history])
  const filtered = categoryFilter ? history.filter((item) => item.feeComponent === categoryFilter) : history

  const columns = [
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    { key: 'feeComponent', header: 'Fee Component' },
    { key: 'oldAmount', header: 'Old Amount', render: (row) => (row.oldAmount != null ? formatCurrency(row.oldAmount) : '—') },
    { key: 'newAmount', header: 'New Amount', render: (row) => (row.newAmount != null ? formatCurrency(row.newAmount) : '—') },
    { key: 'reason', header: 'Reason' },
    { key: 'updatedBy', header: 'Updated By' },
    { key: 'remarks', header: 'Remarks', render: (row) => row.remarks || '—' },
  ]

  return (
    <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <SectionHeader
        title="Fee Adjustment History"
        description="Every change made to this student's fee record"
        action={
          <div className="flex items-center gap-1 rounded-full border border-white/40 bg-white/40 p-1 dark:border-white/10 dark:bg-white/[0.03]">
            <button
              type="button"
              onClick={() => setView('timeline')}
              aria-pressed={view === 'timeline'}
              className={clsx(
                'flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200',
                view === 'timeline' ? 'bg-brand-600 text-white' : 'text-slate-500 dark:text-slate-400',
              )}
              aria-label="Timeline view"
            >
              <List className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setView('table')}
              aria-pressed={view === 'table'}
              className={clsx(
                'flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200',
                view === 'table' ? 'bg-brand-600 text-white' : 'text-slate-500 dark:text-slate-400',
              )}
              aria-label="Table view"
            >
              <Rows3 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <select value="2025-2026" disabled className={selectClass}>
          <option value="2025-2026">2025-2026</option>
        </select>
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className={selectClass}>
          <option value="">All Fee Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {status === 'error' && <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load adjustment history. {error}</p>}

      {(status === 'loading' || status === 'idle') && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-14" />
          ))}
        </div>
      )}

      {status === 'success' && filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No fee adjustments recorded yet.</p>
      )}

      {status === 'success' && filtered.length > 0 && view === 'timeline' && (
        <Timeline
          items={filtered.map((item) => ({
            id: item.id,
            icon: FileEdit,
            tone: 'brand',
            title: item.feeComponent,
            description: item.reason,
            meta: `${formatDate(item.date)} · ${item.updatedBy}${item.oldAmount != null && item.newAmount != null ? ` · ${formatCurrency(item.oldAmount)} → ${formatCurrency(item.newAmount)}` : ''}`,
          }))}
        />
      )}

      {status === 'success' && filtered.length > 0 && view === 'table' && (
        <div className="thin-scrollbar overflow-x-auto">
          <DataTable columns={columns} rows={filtered} emptyMessage="No fee adjustments recorded yet." />
        </div>
      )}
    </div>
  )
}
