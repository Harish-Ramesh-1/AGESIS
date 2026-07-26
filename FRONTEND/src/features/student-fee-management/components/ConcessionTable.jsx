import { useEffect, useState } from 'react'
import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react'
import { useConcessionStore } from '../store/concessionStore'
import { useStudentDirectoryStore } from '../store/studentDirectoryStore'
import DataTable from '../../../components/common/DataTable'
import Badge from '../../../components/common/Badge'
import Skeleton from '../../../components/common/Skeleton'
import InputField from '../../../components/common/Input'
import { PrimaryButton, SecondaryButton } from '../../../components/common/Button'
import SectionHeader from './SectionHeader'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatDate } from '../../../utils/formatDate'
import { RECORD_STATUS_VARIANT } from '../utils/feeManagementUtils'

const EMPTY_FORM = { type: 'Fee Concession', amount: '', approvedBy: 'Kavita Sharma', reason: '', effectiveDate: '', expiryDate: '' }

export default function ConcessionTable() {
  const studentId = useStudentDirectoryStore((state) => state.selectedStudentId)
  const status = useConcessionStore((state) => state.status)
  const concessions = useConcessionStore((state) => state.concessions)
  const error = useConcessionStore((state) => state.error)
  const fetchConcessions = useConcessionStore((state) => state.fetchConcessions)
  const addConcession = useConcessionStore((state) => state.addConcession)
  const updateConcession = useConcessionStore((state) => state.updateConcession)
  const removeConcession = useConcessionStore((state) => state.removeConcession)

  const [mode, setMode] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (studentId) fetchConcessions(studentId)
  }, [studentId, fetchConcessions])

  function openAdd() {
    setForm(EMPTY_FORM)
    setMode('add')
  }

  function openEdit(item) {
    setForm({
      type: item.type,
      amount: item.amount,
      approvedBy: item.approvedBy,
      reason: item.reason,
      effectiveDate: item.effectiveDate,
      expiryDate: item.expiryDate,
    })
    setMode(item.id)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const payload = { ...form, amount: Number(form.amount) }
    if (mode === 'add') {
      await addConcession(payload)
    } else {
      updateConcession(mode, payload)
    }
    setMode(null)
  }

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const columns = [
    { key: 'type', header: 'Concession Type' },
    { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'approvedBy', header: 'Approved By' },
    { key: 'reason', header: 'Reason' },
    { key: 'effectiveDate', header: 'Effective Date', render: (row) => formatDate(row.effectiveDate) },
    { key: 'expiryDate', header: 'Expiry Date', render: (row) => formatDate(row.expiryDate) },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge variant={RECORD_STATUS_VARIANT[row.status] ?? 'success'}>{row.status}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => openEdit(row)}
            aria-label={`Edit ${row.type}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => removeConcession(row.id)}
            aria-label={`Delete ${row.type}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ]

  const form_ = (
    <form
      onSubmit={handleSubmit}
      className="mb-4 flex flex-col gap-3 rounded-xl border border-brand-200/60 bg-brand-50/40 p-4 dark:border-brand-500/20 dark:bg-brand-500/[0.06]"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InputField label="Concession Type" value={form.type} onChange={(event) => handleChange('type', event.target.value)} required />
        <InputField label="Amount" type="number" min="0" value={form.amount} onChange={(event) => handleChange('amount', event.target.value)} required />
        <InputField label="Approved By" value={form.approvedBy} onChange={(event) => handleChange('approvedBy', event.target.value)} required />
        <InputField label="Reason" value={form.reason} onChange={(event) => handleChange('reason', event.target.value)} required />
        <InputField
          label="Effective Date"
          type="date"
          value={form.effectiveDate}
          onChange={(event) => handleChange('effectiveDate', event.target.value)}
          required
        />
        <InputField
          label="Expiry Date"
          type="date"
          value={form.expiryDate}
          onChange={(event) => handleChange('expiryDate', event.target.value)}
          required
        />
      </div>
      <div className="flex gap-3">
        <SecondaryButton type="button" fullWidth={false} onClick={() => setMode(null)}>
          Cancel
        </SecondaryButton>
        <PrimaryButton type="submit" fullWidth={false}>
          Save
        </PrimaryButton>
      </div>
    </form>
  )

  return (
    <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <SectionHeader
        title="Fee Concessions"
        description="Temporary reductions approved for this student"
        action={
          !mode && (
            <SecondaryButton fullWidth={false} onClick={openAdd}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add
            </SecondaryButton>
          )
        }
      />

      {status === 'error' && <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load concessions. {error}</p>}
      {(status === 'loading' || status === 'idle') && <Skeleton className="h-24" />}

      {status === 'success' && (
        <>
          {mode === 'add' && form_}

          <div className="hidden md:block">
            <DataTable columns={columns} rows={mode && mode !== 'add' ? concessions.filter((item) => item.id !== mode) : concessions} emptyMessage="No fee concessions recorded." />
          </div>
          {mode && mode !== 'add' && <div className="hidden md:block">{form_}</div>}

          <div className="flex flex-col gap-2 md:hidden">
            {concessions.map((item) =>
              mode === item.id ? (
                <div key={item.id}>{form_}</div>
              ) : (
                <details
                  key={item.id}
                  className="group rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.type}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(item.amount)}</span>
                      <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 ease-premium group-open:rotate-180" aria-hidden="true" />
                    </span>
                  </summary>
                  <div className="mt-3 flex flex-col gap-3 border-t border-slate-200/70 pt-3 text-xs dark:border-white/10">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-slate-400 dark:text-slate-500">Approved By</p>
                        <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{item.approvedBy}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 dark:text-slate-500">Status</p>
                        <Badge variant={RECORD_STATUS_VARIANT[item.status] ?? 'success'} className="mt-0.5">
                          {item.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-slate-400 dark:text-slate-500">Effective</p>
                        <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{formatDate(item.effectiveDate)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 dark:text-slate-500">Expires</p>
                        <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{formatDate(item.expiryDate)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/50 bg-white/60 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeConcession(item.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/70 px-2.5 py-1.5 text-xs font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Delete
                      </button>
                    </div>
                  </div>
                </details>
              ),
            )}
          </div>
        </>
      )}
    </div>
  )
}
