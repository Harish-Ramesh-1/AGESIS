import { useEffect, useState } from 'react'
import { Pencil, Percent, Plus, Trash2 } from 'lucide-react'
import { useScholarshipStore } from '../store/scholarshipStore'
import { useStudentDirectoryStore } from '../store/studentDirectoryStore'
import Badge from '../../../components/common/Badge'
import Skeleton from '../../../components/common/Skeleton'
import { SecondaryButton } from '../../../components/common/Button'
import SectionHeader from './SectionHeader'
import { ScholarshipForm } from './ScholarshipCard'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatDate } from '../../../utils/formatDate'
import { RECORD_STATUS_VARIANT } from '../utils/feeManagementUtils'

const DISCOUNT_TYPES = ['Sibling Discount', 'Employee Discount', 'Special Discount']

const EMPTY_FORM = { name: DISCOUNT_TYPES[0], amount: '', percentage: '', reason: '', startDate: '', endDate: '' }

export default function DiscountCard() {
  const studentId = useStudentDirectoryStore((state) => state.selectedStudentId)
  const status = useScholarshipStore((state) => state.status)
  const discounts = useScholarshipStore((state) => state.discounts)
  const error = useScholarshipStore((state) => state.error)
  const fetchAll = useScholarshipStore((state) => state.fetchAll)
  const addDiscount = useScholarshipStore((state) => state.addDiscount)
  const updateDiscount = useScholarshipStore((state) => state.updateDiscount)
  const removeDiscount = useScholarshipStore((state) => state.removeDiscount)

  const [mode, setMode] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (studentId) fetchAll(studentId)
  }, [studentId, fetchAll])

  function openAdd() {
    setForm(EMPTY_FORM)
    setMode('add')
  }

  function openEdit(item) {
    setForm({
      name: item.name,
      amount: item.amount,
      percentage: item.percentage,
      reason: item.reason,
      startDate: item.startDate,
      endDate: item.endDate,
    })
    setMode(item.id)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const payload = { ...form, amount: Number(form.amount), percentage: Number(form.percentage) }
    if (mode === 'add') {
      await addDiscount(payload)
    } else {
      updateDiscount(mode, payload)
    }
    setMode(null)
  }

  return (
    <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <SectionHeader
        title="Discounts"
        description="Sibling, employee and special discounts"
        action={
          !mode && (
            <SecondaryButton fullWidth={false} onClick={openAdd}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add
            </SecondaryButton>
          )
        }
      />

      {status === 'error' && <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load discounts. {error}</p>}
      {(status === 'loading' || status === 'idle') && <Skeleton className="h-24" />}

      {status === 'success' && (
        <div className="flex flex-col gap-3">
          {mode === 'add' && (
            <ScholarshipForm form={form} setForm={setForm} onSubmit={handleSubmit} onCancel={() => setMode(null)} types={DISCOUNT_TYPES} />
          )}

          {discounts.length === 0 && mode !== 'add' && (
            <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">No discounts applied yet.</p>
          )}

          {discounts.map((item) =>
            mode === item.id ? (
              <ScholarshipForm
                key={item.id}
                form={form}
                setForm={setForm}
                onSubmit={handleSubmit}
                onCancel={() => setMode(null)}
                types={DISCOUNT_TYPES}
              />
            ) : (
              <div
                key={item.id}
                className="rounded-xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <Percent className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.reason}</p>
                    </div>
                  </div>
                  <Badge variant={RECORD_STATUS_VARIANT[item.status] ?? 'success'}>{item.status}</Badge>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                  <div>
                    <p className="text-slate-400 dark:text-slate-500">Amount</p>
                    <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{formatCurrency(item.amount)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 dark:text-slate-500">Percentage</p>
                    <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{item.percentage}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400 dark:text-slate-500">Start Date</p>
                    <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{formatDate(item.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 dark:text-slate-500">End Date</p>
                    <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{formatDate(item.endDate)}</p>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/50 bg-white/60 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/80 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeDiscount(item.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/70 px-2.5 py-1.5 text-xs font-medium text-red-700 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  )
}
