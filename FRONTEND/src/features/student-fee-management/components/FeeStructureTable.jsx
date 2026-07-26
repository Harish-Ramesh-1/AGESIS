import { useEffect, useState } from 'react'
import { ChevronDown, ClipboardPlus, Pencil } from 'lucide-react'
import { useFeeStructureStore } from '../store/feeStructureStore'
import { useStudentDirectoryStore } from '../store/studentDirectoryStore'
import DataTable from '../../../components/common/DataTable'
import Badge from '../../../components/common/Badge'
import Skeleton from '../../../components/common/Skeleton'
import { PrimaryButton, SecondaryButton } from '../../../components/common/Button'
import SectionHeader from './SectionHeader'
import FeeEditor from './FeeEditor'
import AssignFeeModal from './AssignFeeModal'
import { formatCurrency } from '../../../utils/formatCurrency'
import { FEE_STATUS_LABEL, FEE_STATUS_VARIANT } from '../utils/feeManagementUtils'

export default function FeeStructureTable() {
  const studentId = useStudentDirectoryStore((state) => state.selectedStudentId)
  const status = useFeeStructureStore((state) => state.status)
  const feeComponents = useFeeStructureStore((state) => state.feeComponents)
  const error = useFeeStructureStore((state) => state.error)
  const fetchFeeStructure = useFeeStructureStore((state) => state.fetchFeeStructure)
  const [isEditing, setIsEditing] = useState(false)
  const [isAssignOpen, setIsAssignOpen] = useState(false)

  useEffect(() => {
    if (studentId) fetchFeeStructure(studentId)
  }, [studentId, fetchFeeStructure])

  const columns = [
    { key: 'component', header: 'Fee Component' },
    { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'discount', header: 'Discount', render: (row) => (row.discount ? formatCurrency(row.discount) : '—') },
    { key: 'scholarship', header: 'Scholarship', render: (row) => (row.scholarship ? formatCurrency(row.scholarship) : '—') },
    { key: 'concession', header: 'Concession', render: (row) => (row.concession ? formatCurrency(row.concession) : '—') },
    { key: 'lateFee', header: 'Late Fee', render: (row) => (row.lateFee ? formatCurrency(row.lateFee) : '—') },
    { key: 'netAmount', header: 'Net Amount', render: (row) => <span className="font-semibold">{formatCurrency(row.netAmount)}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge variant={FEE_STATUS_VARIANT[row.status]}>{FEE_STATUS_LABEL[row.status]}</Badge>,
    },
  ]

  const headerAction = !isEditing && (
    <div className="flex flex-wrap gap-2">
      <SecondaryButton fullWidth={false} onClick={() => setIsEditing(true)}>
        <Pencil className="h-4 w-4" aria-hidden="true" />
        Edit Components
      </SecondaryButton>
      <PrimaryButton fullWidth={false} onClick={() => setIsAssignOpen(true)}>
        <ClipboardPlus className="h-4 w-4" aria-hidden="true" />
        Assign Fee Structure
      </PrimaryButton>
    </div>
  )

  return (
    <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <SectionHeader title="Fee Structure" description="All fee components assigned for this academic year" action={headerAction} />

      {status === 'error' && <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load fee structure. {error}</p>}

      {(status === 'loading' || status === 'idle') && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10" />
          ))}
        </div>
      )}

      {status === 'success' && isEditing && (
        <FeeEditor feeComponents={feeComponents} onDone={() => setIsEditing(false)} />
      )}

      {status === 'success' && !isEditing && (
        <>
          <div className="hidden md:block">
            <DataTable columns={columns} rows={feeComponents} emptyMessage="No fee components assigned yet." />
          </div>

          <div className="flex flex-col gap-2 md:hidden">
            {feeComponents.map((row) => (
              <details
                key={row.id}
                className="group rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{row.component}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(row.netAmount)}</span>
                    <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 ease-premium group-open:rotate-180" aria-hidden="true" />
                  </span>
                </summary>
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-200/70 pt-3 text-xs dark:border-white/10">
                  <div>
                    <p className="text-slate-400 dark:text-slate-500">Amount</p>
                    <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{formatCurrency(row.amount)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 dark:text-slate-500">Discount</p>
                    <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{row.discount ? formatCurrency(row.discount) : '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 dark:text-slate-500">Scholarship</p>
                    <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{row.scholarship ? formatCurrency(row.scholarship) : '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 dark:text-slate-500">Concession</p>
                    <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{row.concession ? formatCurrency(row.concession) : '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 dark:text-slate-500">Late Fee</p>
                    <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{row.lateFee ? formatCurrency(row.lateFee) : '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 dark:text-slate-500">Status</p>
                    <Badge variant={FEE_STATUS_VARIANT[row.status]} className="mt-0.5">
                      {FEE_STATUS_LABEL[row.status]}
                    </Badge>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </>
      )}

      {isAssignOpen && <AssignFeeModal onClose={() => setIsAssignOpen(false)} />}
    </div>
  )
}
