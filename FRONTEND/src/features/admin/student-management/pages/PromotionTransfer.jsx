import { useEffect, useMemo, useState } from 'react'
import { ArrowRightLeft, CheckCircle2, Send, Users } from 'lucide-react'
import { usePromotionTransferStore } from '../store/promotionTransferStore'
import { CLASS_NUMBERS } from '../services/studentManagementService'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import EmptyState from '../../../../components/common/EmptyState'
import Badge from '../../../../components/common/Badge'
import { PrimaryButton } from '../../../../components/common/Button'
import { formatDate } from '../../../../utils/formatDate'
import PageHeaderSimple from '../components/PageHeaderSimple'
import ResponsiveTable from '../components/ResponsiveTable'

const selectClass =
  'rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

const NEXT_CLASS_OPTIONS = [...CLASS_NUMBERS, 'Graduated']

const TRANSFER_STATUS_VARIANT = { pending: 'warning', approved: 'info', completed: 'success', rejected: 'danger' }
const TRANSFER_STATUS_LABEL = { pending: 'Pending', approved: 'Approved', completed: 'Completed', rejected: 'Rejected' }

export default function PromotionTransfer() {
  const candidatesStatus = usePromotionTransferStore((state) => state.candidatesStatus)
  const candidatesError = usePromotionTransferStore((state) => state.candidatesError)
  const candidates = usePromotionTransferStore((state) => state.candidates)
  const selectedIds = usePromotionTransferStore((state) => state.selectedIds)
  const promoteStatus = usePromotionTransferStore((state) => state.promoteStatus)
  const fetchCandidates = usePromotionTransferStore((state) => state.fetchCandidates)
  const toggleSelected = usePromotionTransferStore((state) => state.toggleSelected)
  const toggleSelectAll = usePromotionTransferStore((state) => state.toggleSelectAll)
  const promoteSelected = usePromotionTransferStore((state) => state.promoteSelected)

  const transfersStatus = usePromotionTransferStore((state) => state.transfersStatus)
  const transfersError = usePromotionTransferStore((state) => state.transfersError)
  const transferRequests = usePromotionTransferStore((state) => state.transferRequests)
  const fetchTransferRequests = usePromotionTransferStore((state) => state.fetchTransferRequests)

  const [currentClass, setCurrentClass] = useState('1')
  const [nextClass, setNextClass] = useState('2')

  useEffect(() => {
    fetchCandidates(currentClass)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentClass])

  useEffect(() => {
    fetchTransferRequests()
  }, [fetchTransferRequests])

  const allSelected = candidates.length > 0 && candidates.every((c) => selectedIds.has(c.id))

  const transferColumns = useMemo(
    () => [
      { key: 'studentName', header: 'Student' },
      { key: 'fromClass', header: 'From Class' },
      { key: 'requestedSchool', header: 'Requested School' },
      { key: 'date', header: 'Requested On', render: (row) => formatDate(row.date) },
      {
        key: 'status',
        header: 'Status',
        render: (row) => <Badge variant={TRANSFER_STATUS_VARIANT[row.status]}>{TRANSFER_STATUS_LABEL[row.status]}</Badge>,
      },
    ],
    [],
  )

  function handleCurrentClassChange(event) {
    const value = event.target.value
    setCurrentClass(value)
    const next = Number(value) + 1
    setNextClass(next <= 12 ? String(next) : 'Graduated')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Promotion &amp; Transfer" />

      <section className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
        />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Bulk Promotion</h2>

        <div className="mb-5 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="promo-current-class" className="text-xs font-medium text-slate-700 dark:text-slate-200">
              Current Class
            </label>
            <select id="promo-current-class" value={currentClass} onChange={handleCurrentClassChange} className={selectClass}>
              {CLASS_NUMBERS.map((item) => (
                <option key={item} value={item}>
                  Grade {item}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="promo-next-class" className="text-xs font-medium text-slate-700 dark:text-slate-200">
              Promote To
            </label>
            <select id="promo-next-class" value={nextClass} onChange={(event) => setNextClass(event.target.value)} className={selectClass}>
              {NEXT_CLASS_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item === 'Graduated' ? 'Graduated (Alumni)' : `Grade ${item}`}
                </option>
              ))}
            </select>
          </div>
          <PrimaryButton
            fullWidth={false}
            className="px-6"
            disabled={selectedIds.size === 0}
            isLoading={promoteStatus === 'promoting'}
            onClick={promoteSelected}
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Promote Selected ({selectedIds.size})
          </PrimaryButton>
          {promoteStatus === 'promoted' && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400" role="status">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {selectedIds.size} student(s) promoted to {nextClass === 'Graduated' ? 'Alumni' : `Grade ${nextClass}`}
            </span>
          )}
        </div>

        {candidatesStatus === 'loading' && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        )}

        {candidatesStatus === 'error' && <ErrorState message={candidatesError} onRetry={() => fetchCandidates(currentClass)} />}

        {candidatesStatus === 'success' && candidates.length === 0 && (
          <EmptyState icon={Users} title="No active students in this class" description="Choose a different class to promote." />
        )}

        {candidatesStatus === 'success' && candidates.length > 0 && (
          <div className="thin-scrollbar overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200/70 dark:border-white/10">
                  <th className="w-10 px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select all students in this class"
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus-visible:outline-brand-500 dark:border-white/20"
                    />
                  </th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Student</th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Section</th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Roll No.</th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Parent</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-slate-100/80 transition-colors duration-200 ease-premium last:border-0 hover:bg-white/40 dark:border-white/5 dark:hover:bg-white/[0.03]"
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(student.id)}
                        onChange={() => toggleSelected(student.id)}
                        aria-label={`Include ${student.name} in promotion`}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus-visible:outline-brand-500 dark:border-white/20"
                      />
                    </td>
                    <td className="px-3 py-3 font-medium text-slate-800 dark:text-slate-100">{student.name}</td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{student.section}</td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{student.rollNo}</td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{student.parentName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
        />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Transfer Requests</h2>

        {transfersStatus === 'loading' && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        )}

        {transfersStatus === 'error' && <ErrorState message={transfersError} onRetry={fetchTransferRequests} />}

        {transfersStatus === 'success' && (
          <ResponsiveTable
            columns={transferColumns}
            rows={transferRequests}
            titleKey="studentName"
            subtitleKey="requestedSchool"
            trailingKey="status"
            emptyIcon={ArrowRightLeft}
            emptyTitle="No transfer requests"
          />
        )}
      </section>
    </div>
  )
}
