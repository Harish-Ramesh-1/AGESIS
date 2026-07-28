import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, ClipboardCheck, Layers, Send, Users2 } from 'lucide-react'
import { useAssignFeesStore } from '../store/assignFeesStore'
import { useFeeStructureStore } from '../store/feeStructureStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import SummaryCard from '../components/SummaryCard'
import ConfigTable from '../components/ConfigTable'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { PrimaryButton } from '../../../../components/common/Button'
import { formatDate } from '../../../../utils/formatDate'
import { TOTAL_STUDENTS } from '../services/feeStructureService'
import { ACADEMIC_YEAR_OPTIONS, ASSIGNMENT_STATUS_LABEL, ASSIGNMENT_STATUS_VARIANT, CLASS_OPTIONS, SECTION_OPTIONS } from '../utils/feeStructureUtils'

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function AssignFees() {
  const status = useAssignFeesStore((state) => state.status)
  const error = useAssignFeesStore((state) => state.error)
  const batches = useAssignFeesStore((state) => state.batches)
  const fetchBatches = useAssignFeesStore((state) => state.fetchBatches)
  const previewStatus = useAssignFeesStore((state) => state.previewStatus)
  const previewCount = useAssignFeesStore((state) => state.previewCount)
  const runPreview = useAssignFeesStore((state) => state.runPreview)
  const clearPreview = useAssignFeesStore((state) => state.clearPreview)
  const isAssigning = useAssignFeesStore((state) => state.isAssigning)
  const assign = useAssignFeesStore((state) => state.assign)

  const structuresStatus = useFeeStructureStore((state) => state.status)
  const structures = useFeeStructureStore((state) => state.structures)
  const fetchStructures = useFeeStructureStore((state) => state.fetchStructures)

  const [structureId, setStructureId] = useState('')
  const [academicYear, setAcademicYear] = useState(ACADEMIC_YEAR_OPTIONS[0])
  const [classId, setClassId] = useState('')
  const [section, setSection] = useState('')
  const [assignedMessage, setAssignedMessage] = useState('')

  useEffect(() => {
    fetchBatches()
    fetchStructures()
  }, [fetchBatches, fetchStructures])

  useEffect(() => {
    if (classId) {
      runPreview({ classId, section })
    } else {
      clearPreview()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, section])

  const activeStructures = useMemo(() => structures.filter((row) => row.status === 'active'), [structures])

  const summary = useMemo(() => {
    const completed = batches.filter((row) => row.status === 'completed')
    const studentsCovered = completed.reduce((sum, row) => sum + row.studentsAffected, 0)
    const studentsCoveredPercent = Math.min(100, Math.round((studentsCovered / TOTAL_STUDENTS) * 100))
    const pendingAssignments = batches.filter((row) => row.status === 'in-progress').length
    const classesFullyAssigned = completed.filter((row) => row.targetDescription.includes('All Sections')).length
    const lastBatchSize = batches[0]?.studentsAffected ?? 0
    return { studentsCoveredPercent, pendingAssignments, classesFullyAssigned, lastBatchSize }
  }, [batches])

  async function handleAssign() {
    setAssignedMessage('')
    if (!structureId || !classId || !previewCount) return
    const targetDescription = `Class ${classId} - ${section ? `Section ${section}` : 'All Sections'}`

    const batch = await assign({ structureId, targetDescription, academicYear, studentsAffected: previewCount })
    setAssignedMessage(`Assigned to ${batch.studentsAffected} students · Batch ${batch.id}`)
    setClassId('')
    setSection('')
  }

  const columns = [
    { key: 'structureName', header: 'Fee Structure' },
    { key: 'targetDescription', header: 'Target' },
    { key: 'academicYear', header: 'Academic Year' },
    { key: 'studentsAffected', header: 'Students Affected' },
    { key: 'assignedDate', header: 'Assigned Date', render: (row) => formatDate(row.assignedDate) },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={ASSIGNMENT_STATUS_VARIANT[row.status]}>{ASSIGNMENT_STATUS_LABEL[row.status]}</Badge> },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Assign Fees" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={Users2} label="Students Covered" value={`${summary.studentsCoveredPercent}%`} status={status} />
        <SummaryCard icon={ClipboardCheck} label="Pending Assignments" value={summary.pendingAssignments} status={status} />
        <SummaryCard icon={Layers} label="Classes Fully Assigned" value={summary.classesFullyAssigned} status={status} />
        <SummaryCard icon={CheckCircle2} label="Last Batch Size" value={summary.lastBatchSize} status={status} />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Bulk Assignment</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="assign-structure" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Fee Structure
            </label>
            <select id="assign-structure" value={structureId} onChange={(event) => setStructureId(event.target.value)} className={selectClass} disabled={structuresStatus !== 'success'}>
              <option value="">Select a fee structure</option>
              {activeStructures.map((structure) => (
                <option key={structure.id} value={structure.id}>
                  {structure.name} ({structure.classRange})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="assign-year" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Academic Year
            </label>
            <select id="assign-year" value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} className={selectClass}>
              {ACADEMIC_YEAR_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="assign-class" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Class
            </label>
            <select id="assign-class" value={classId} onChange={(event) => setClassId(event.target.value)} className={selectClass}>
              <option value="">Select a class</option>
              {CLASS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  Class {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="assign-section" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Section
            </label>
            <select id="assign-section" value={section} onChange={(event) => setSection(event.target.value)} className={selectClass}>
              <option value="">All Sections</option>
              {SECTION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  Section {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Students Affected (Preview)</p>
            {previewStatus === 'loading' ? (
              <Skeleton className="mt-1 h-6 w-16" />
            ) : (
              <p className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-white">{previewCount ?? '—'}</p>
            )}
          </div>
          <PrimaryButton fullWidth={false} onClick={handleAssign} isLoading={isAssigning} disabled={!structureId || !classId || !previewCount}>
            <Send className="h-4 w-4" aria-hidden="true" />
            Assign to Selected Class
          </PrimaryButton>
        </div>

        {assignedMessage && (
          <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            {assignedMessage}
          </p>
        )}
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Bulk Assignment History</h2>
        {status === 'error' ? (
          <ErrorState message={error} onRetry={fetchBatches} />
        ) : status === 'loading' || status === 'idle' ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : (
          <ConfigTable
            columns={columns}
            rows={batches}
            keyField="id"
            titleKey="structureName"
            subtitleKey="targetDescription"
            trailingKey="studentsAffected"
            emptyMessage="No assignment batches yet."
          />
        )}
      </div>
    </div>
  )
}
