import { useEffect } from 'react'
import { Download, History, RotateCcw } from 'lucide-react'
import { useBackupRecoveryStore } from '../store/backupRecoveryStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import GlassCard from '../../../../components/common/GlassCard'
import Badge from '../../../../components/common/Badge'
import DataTable from '../../../../components/common/DataTable'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import EmptyState from '../../../../components/common/EmptyState'
import { formatDate } from '../../../../utils/formatDate'

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `${minutes}m ${remaining}s`
}

export default function BackupHistory() {
  const status = useBackupRecoveryStore((state) => state.historyStatus)
  const error = useBackupRecoveryStore((state) => state.historyError)
  const history = useBackupRecoveryStore((state) => state.history)
  const fetchHistory = useBackupRecoveryStore((state) => state.fetchHistory)

  useEffect(() => {
    fetchHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const columns = [
    { key: 'timestamp', header: 'Date / Time', render: (row) => formatDate(row.timestamp) },
    { key: 'sizeMb', header: 'Size', render: (row) => `${row.sizeMb.toLocaleString('en-IN')} MB` },
    { key: 'durationSeconds', header: 'Duration', render: (row) => formatDuration(row.durationSeconds) },
    { key: 'trigger', header: 'Trigger', render: (row) => (row.trigger === 'manual' ? 'Manual' : 'Scheduled') },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge variant={row.status === 'success' ? 'success' : 'danger'}>{row.status === 'success' ? 'Success' : 'Failed'}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={row.status !== 'success'}
            aria-label={`Download backup from ${formatDate(row.timestamp)}`}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors duration-200 hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Download
          </button>
          <button
            type="button"
            disabled={row.status !== 'success'}
            aria-label={`Restore from backup taken ${formatDate(row.timestamp)}`}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-600 transition-colors duration-200 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-brand-300 dark:hover:bg-brand-500/10"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Restore
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Backup History" />

      <GlassCard title="Past Backups" description="A complete record of every automated and manual backup taken.">
        {status === 'loading' || status === 'idle' ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : status === 'error' ? (
          <ErrorState message={error} onRetry={fetchHistory} />
        ) : history.length === 0 ? (
          <EmptyState icon={History} title="No backups yet" description="Backups will appear here once the schedule runs or a manual backup is triggered." />
        ) : (
          <DataTable columns={columns} rows={history} />
        )}
      </GlassCard>
    </div>
  )
}
