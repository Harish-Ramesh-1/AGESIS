import { useState } from 'react'
import { CheckCircle2, ChevronDown, Pencil, ShieldCheck, ShieldOff } from 'lucide-react'
import { usePendingDueStore } from '../store/pendingDueStore'
import { usePenaltyStore } from '../store/penaltyStore'
import DataTable from '../../../components/common/DataTable'
import Badge from '../../../components/common/Badge'
import Skeleton from '../../../components/common/Skeleton'
import EmptyState from '../../../components/common/EmptyState'
import InputField from '../../../components/common/Input'
import { PrimaryButton, SecondaryButton } from '../../../components/common/Button'
import { formatCurrency } from '../../../utils/formatCurrency'
import { PENALTY_STATUS_LABEL, PENALTY_STATUS_VARIANT } from '../utils/pendingDuesUtils'

export default function PenaltyTable() {
  const status = usePendingDueStore((state) => state.overdueStatus)
  const overdueList = usePendingDueStore((state) => state.overdueList)
  const applyPenalty = usePenaltyStore((state) => state.applyPenalty)
  const waivePenalty = usePenaltyStore((state) => state.waivePenalty)
  const approveWaiver = usePenaltyStore((state) => state.approveWaiver)
  const actioningId = usePenaltyStore((state) => state.actioningId)

  const [editingId, setEditingId] = useState(null)
  const [editAmount, setEditAmount] = useState('')
  const [waivingId, setWaivingId] = useState(null)
  const [waiveReason, setWaiveReason] = useState('')

  if (status === 'error') return null

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-10" />
        ))}
      </div>
    )
  }

  const rows = overdueList.filter((row) => row.lateFee > 0 || row.penaltyStatus !== 'none')

  if (rows.length === 0) {
    return <EmptyState icon={ShieldCheck} title="No penalties to manage" description="Overdue accounts with late fees will appear here." />
  }

  function startEdit(row) {
    setEditingId(row.id)
    setEditAmount(String(row.lateFee))
  }

  async function saveEdit(row) {
    await applyPenalty(row.id, { penalty: Number(editAmount), remarks: 'Manually edited' })
    setEditingId(null)
  }

  async function confirmWaive(row, mode) {
    await waivePenalty(row.id, { mode, amount: mode === 'partial' ? Number(editAmount) : undefined, reason: waiveReason })
    setWaivingId(null)
    setWaiveReason('')
  }

  function RowActions({ row }) {
    const isBusy = actioningId === row.id
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => startEdit(row)}
          aria-label={`Edit penalty for ${row.studentName}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setWaivingId(row.id)}
          disabled={isBusy || row.lateFee === 0}
          aria-label={`Waive penalty for ${row.studentName}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-amber-600 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <ShieldOff className="h-4 w-4" aria-hidden="true" />
        </button>
        {row.waiverStatus === 'partially-waived' && (
          <button
            type="button"
            onClick={() => approveWaiver(row.id)}
            disabled={isBusy}
            aria-label={`Approve waiver for ${row.studentName}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition-colors duration-200 hover:bg-emerald-50 disabled:opacity-40 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    )
  }

  const columns = [
    { key: 'studentName', header: 'Student' },
    { key: 'outstandingAmount', header: 'Outstanding', render: (row) => formatCurrency(row.outstandingAmount) },
    { key: 'daysOverdue', header: 'Days Overdue' },
    { key: 'lateFee', header: 'Late Fee', render: (row) => formatCurrency(row.lateFee) },
    { key: 'penaltyStatus', header: 'Penalty Status', render: (row) => <Badge variant={PENALTY_STATUS_VARIANT[row.penaltyStatus]}>{PENALTY_STATUS_LABEL[row.penaltyStatus]}</Badge> },
    { key: 'waiverStatus', header: 'Waiver Status', render: (row) => (row.waiverStatus === 'none' ? '—' : row.waiverStatus.replace('-', ' ')) },
    { key: 'approvedBy', header: 'Approved By', render: (row) => row.approvedBy ?? '—' },
    { key: 'actions', header: 'Actions', render: (row) => <RowActions row={row} /> },
  ]

  return (
    <div>
      <div className="hidden md:block">
        <DataTable columns={columns} rows={rows} emptyMessage="No penalties to manage." />
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {rows.map((row) => (
          <details key={row.id} className="group rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{row.studentName}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{row.daysOverdue} days overdue</p>
              </div>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(row.lateFee)}</span>
                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 ease-premium group-open:rotate-180" aria-hidden="true" />
              </span>
            </summary>
            <div className="mt-3 flex flex-col gap-3 border-t border-slate-200/70 pt-3 dark:border-white/10">
              <Badge variant={PENALTY_STATUS_VARIANT[row.penaltyStatus]}>{PENALTY_STATUS_LABEL[row.penaltyStatus]}</Badge>
              <RowActions row={row} />
            </div>
          </details>
        ))}
      </div>

      {editingId && (
        <EditDialog
          row={rows.find((row) => row.id === editingId)}
          amount={editAmount}
          onChangeAmount={setEditAmount}
          onCancel={() => setEditingId(null)}
          onSave={() => saveEdit(rows.find((row) => row.id === editingId))}
        />
      )}

      {waivingId && (
        <WaiveDialog
          row={rows.find((row) => row.id === waivingId)}
          reason={waiveReason}
          onChangeReason={setWaiveReason}
          onCancel={() => setWaivingId(null)}
          onConfirm={(mode) => confirmWaive(rows.find((row) => row.id === waivingId), mode)}
        />
      )}
    </div>
  )
}

function EditDialog({ row, amount, onChangeAmount, onCancel, onSave }) {
  if (!row) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" onClick={onCancel} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-sm rounded-clay border border-white/50 bg-white/95 p-6 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Edit Penalty · {row.studentName}</h2>
        <div className="mt-4">
          <InputField label="Penalty Amount" type="number" min="0" value={amount} onChange={(event) => onChangeAmount(event.target.value)} />
        </div>
        <div className="mt-5 flex gap-3">
          <SecondaryButton fullWidth={false} onClick={onCancel}>
            Cancel
          </SecondaryButton>
          <PrimaryButton fullWidth={false} onClick={onSave}>
            Save
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}

function WaiveDialog({ row, reason, onChangeReason, onCancel, onConfirm }) {
  if (!row) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" onClick={onCancel} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-sm rounded-clay border border-white/50 bg-white/95 p-6 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Waive Penalty · {row.studentName}</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Current late fee: {formatCurrency(row.lateFee)}</p>
        <div className="mt-4">
          <InputField label="Reason" value={reason} onChange={(event) => onChangeReason(event.target.value)} required />
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <SecondaryButton fullWidth={false} onClick={onCancel}>
            Cancel
          </SecondaryButton>
          <SecondaryButton fullWidth={false} onClick={() => onConfirm('partial')} disabled={!reason}>
            Partial Waiver
          </SecondaryButton>
          <PrimaryButton fullWidth={false} onClick={() => onConfirm('full')} disabled={!reason}>
            Waive Full Penalty
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
