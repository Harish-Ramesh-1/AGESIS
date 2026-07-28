import { useEffect, useState } from 'react'
import { CheckCircle2, RotateCcw } from 'lucide-react'
import { useBackupRecoveryStore } from '../store/backupRecoveryStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import GlassCard from '../../../../components/common/GlassCard'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import EmptyState from '../../../../components/common/EmptyState'
import Alert from '../../../../components/feedback/Alert'
import { PrimaryButton } from '../../../../components/common/Button'
import { formatDate } from '../../../../utils/formatDate'

const CONFIRM_PHRASE = 'RESTORE'

export default function RestoreData() {
  const status = useBackupRecoveryStore((state) => state.snapshotsStatus)
  const error = useBackupRecoveryStore((state) => state.snapshotsError)
  const snapshots = useBackupRecoveryStore((state) => state.snapshots)
  const restoreStatus = useBackupRecoveryStore((state) => state.restoreStatus)
  const restoreError = useBackupRecoveryStore((state) => state.restoreError)
  const restoreResult = useBackupRecoveryStore((state) => state.restoreResult)
  const fetchSnapshots = useBackupRecoveryStore((state) => state.fetchSnapshots)
  const restoreSnapshot = useBackupRecoveryStore((state) => state.restoreSnapshot)
  const resetRestoreStatus = useBackupRecoveryStore((state) => state.resetRestoreStatus)

  const [selectedId, setSelectedId] = useState(null)
  const [confirmText, setConfirmText] = useState('')

  useEffect(() => {
    fetchSnapshots()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSelect(id) {
    setSelectedId(id)
    resetRestoreStatus()
    setConfirmText('')
  }

  async function handleRestore() {
    if (!selectedId || confirmText !== CONFIRM_PHRASE) return
    await restoreSnapshot(selectedId)
  }

  const canRestore = Boolean(selectedId) && confirmText === CONFIRM_PHRASE && restoreStatus !== 'loading'

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeaderSimple title="Restore Data" />
        <ErrorState message={error} onRetry={fetchSnapshots} />
      </div>
    )
  }

  const isLoading = status === 'loading' || status === 'idle'

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Restore Data" />

      <div aria-live="polite" className="sr-only">
        {restoreStatus === 'success' && 'Data restore completed successfully.'}
        {restoreStatus === 'error' && `Restore failed. ${restoreError ?? ''}`}
      </div>

      <Alert variant="error">
        Restoring from a backup will overwrite current data with the selected snapshot. Any changes made after that snapshot
        was taken — payments, student records, settings — will be permanently lost. This action cannot be undone.
      </Alert>

      <GlassCard title="Select a Backup Snapshot" description="Choose the point in time you want to restore the system to.">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-14" />
            ))}
          </div>
        ) : snapshots.length === 0 ? (
          <EmptyState icon={RotateCcw} title="No restorable snapshots" description="Successful backups will appear here once available." />
        ) : (
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">Backup snapshots</legend>
            {snapshots.map((snapshot) => {
              const isSelected = selectedId === snapshot.id
              return (
                <label
                  key={snapshot.id}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all duration-200 ease-premium ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/80 dark:border-brand-400/50 dark:bg-brand-500/10'
                      : 'border-white/40 bg-white/40 hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="restore-snapshot"
                      checked={isSelected}
                      onChange={() => handleSelect(snapshot.id)}
                      className="h-4 w-4 text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{formatDate(snapshot.timestamp)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {snapshot.sizeMb.toLocaleString('en-IN')} MB · {snapshot.trigger === 'manual' ? 'Manual' : 'Scheduled'} backup
                      </p>
                    </div>
                  </div>
                </label>
              )
            })}
          </fieldset>
        )}
      </GlassCard>

      {!isLoading && snapshots.length > 0 && (
        <GlassCard
          title="Confirm Restore"
          description={`Type "${CONFIRM_PHRASE}" below to enable the restore action. This is your last chance to back out.`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="restore-confirm-text" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Type {CONFIRM_PHRASE} to confirm
              </label>
              <input
                id="restore-confirm-text"
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                placeholder={CONFIRM_PHRASE}
                disabled={!selectedId}
                className="w-full max-w-xs rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 font-mono text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
              />
            </div>

            {restoreStatus === 'success' && restoreResult && (
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                Restore completed from snapshot {restoreResult.restoredFrom}.
              </p>
            )}
            {restoreStatus === 'error' && (
              <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
                {restoreError}
              </p>
            )}

            <div>
              <PrimaryButton
                type="button"
                fullWidth={false}
                onClick={handleRestore}
                disabled={!canRestore}
                isLoading={restoreStatus === 'loading'}
                className="bg-red-600 shadow-none hover:bg-red-700"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Restore from this Snapshot
              </PrimaryButton>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  )
}
