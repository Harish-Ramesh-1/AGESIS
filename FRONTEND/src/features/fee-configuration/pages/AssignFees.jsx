import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, ClipboardCheck, Layers, Send, Users2 } from 'lucide-react'
import { useFeeAssignmentStore } from '../store/feeAssignmentStore'
import { useFeeStructureConfigStore } from '../store/feeStructureConfigStore'
import FeeConfigPageHeader from '../components/FeeConfigPageHeader'
import SummaryCard from '../components/SummaryCard'
import ConfigTable from '../components/ConfigTable'
import Badge from '../../../components/common/Badge'
import Skeleton from '../../../components/common/Skeleton'
import ErrorState from '../../../components/common/ErrorState'
import { PrimaryButton } from '../../../components/common/Button'
import { formatDate } from '../../../utils/formatDate'
import { downloadCsv } from '../utils/exportUtils'
import { TOTAL_STUDENTS } from '../services/feeConfigService'
import { ASSIGNMENT_STATUS_LABEL, ASSIGNMENT_STATUS_VARIANT, CLASS_OPTIONS, SECTION_OPTIONS } from '../utils/feeConfigUtils'

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function AssignFees() {
  const status = useFeeAssignmentStore((state) => state.status)
  const error = useFeeAssignmentStore((state) => state.error)
  const batches = useFeeAssignmentStore((state) => state.batches)
  const fetchBatches = useFeeAssignmentStore((state) => state.fetchBatches)
  const previewStatus = useFeeAssignmentStore((state) => state.previewStatus)
  const previewCount = useFeeAssignmentStore((state) => state.previewCount)
  const runPreview = useFeeAssignmentStore((state) => state.runPreview)
  const clearPreview = useFeeAssignmentStore((state) => state.clearPreview)
  const isAssigning = useFeeAssignmentStore((state) => state.isAssigning)
  const assign = useFeeAssignmentStore((state) => state.assign)

  const structuresStatus = useFeeStructureConfigStore((state) => state.status)
  const structures = useFeeStructureConfigStore((state) => state.structures)
  const fetchStructures = useFeeStructureConfigStore((state) => state.fetchStructures)

  const [targetMode, setTargetMode] = useState('class')
  const [templateId, setTemplateId] = useState('')
  const [classId, setClassId] = useState('')
  const [section, setSection] = useState('')
  const [manualTarget, setManualTarget] = useState('')
  const [manualCount, setManualCount] = useState('')
  const [assignedMessage, setAssignedMessage] = useState('')

  useEffect(() => {
    fetchBatches()
    fetchStructures()
  }, [fetchBatches, fetchStructures])

  useEffect(() => {
    if (targetMode === 'class' && classId) {
      runPreview({ classId, section })
    } else {
      clearPreview()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetMode, classId, section])

  const activeTemplates = useMemo(() => structures.filter((row) => row.status === 'active'), [structures])

  const effectivePreviewCount = targetMode === 'class' ? previewCount : manualCount ? Number(manualCount) : null

  const summary = useMemo(() => {
    const completed = batches.filter((row) => row.status === 'completed')
    const studentsCovered = completed.reduce((sum, row) => sum + row.studentsAffected, 0)
    const studentsCoveredPercent = Math.min(100, Math.round((studentsCovered / TOTAL_STUDENTS) * 100))
    const pendingAssignments = batches.filter((row) => row.status === 'in-progress').length
    const classesFullyAssigned = completed.filter((row) => row.targetDescription.includes('All Sections')).length
    const lastBatchSize = batches[0]?.studentsAffected ?? 0
    return { studentsCoveredPercent, pendingAssignments, classesFullyAssigned, lastBatchSize }
  }, [batches])

  function handleExport() {
    downloadCsv(
      'fee-assignment-batches.csv',
      ['Batch ID', 'Template', 'Target', 'Students Affected', 'Assigned Date', 'Status'],
      batches.map((row) => [row.id, row.templateName, row.targetDescription, row.studentsAffected, formatDate(row.assignedDate), ASSIGNMENT_STATUS_LABEL[row.status]]),
    )
  }

  async function handleAssign() {
    setAssignedMessage('')
    if (!templateId) return
    const targetDescription =
      targetMode === 'class'
        ? `Class ${classId} - ${section ? `Section ${section}` : 'All Sections'}`
        : manualTarget.trim()
    const studentsAffected = effectivePreviewCount ?? 0
    if (!targetDescription || studentsAffected <= 0) return

    const batch = await assign({ templateId, targetDescription, studentsAffected })
    setAssignedMessage(`Assigned to ${batch.studentsAffected} students · Batch ${batch.id}`)
    setClassId('')
    setSection('')
    setManualTarget('')
    setManualCount('')
  }

  const columns = [
    { key: 'templateName', header: 'Template' },
    { key: 'targetDescription', header: 'Target' },
    { key: 'studentsAffected', header: 'Students Affected' },
    { key: 'assignedDate', header: 'Assigned Date', render: (row) => formatDate(row.assignedDate) },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={ASSIGNMENT_STATUS_VARIANT[row.status]}>{ASSIGNMENT_STATUS_LABEL[row.status]}</Badge> },
  ]

  return (
    <div className="flex flex-col gap-6">
      <FeeConfigPageHeader pageTitle="Assign Fees" onExport={handleExport} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={Users2} label="Students Covered %" value={`${summary.studentsCoveredPercent}%`} status={status} />
        <SummaryCard icon={ClipboardCheck} label="Pending Assignments" value={summary.pendingAssignments} status={status} />
        <SummaryCard icon={Layers} label="Classes Fully Assigned" value={summary.classesFullyAssigned} status={status} />
        <SummaryCard icon={CheckCircle2} label="Last Batch Size" value={summary.lastBatchSize} status={status} />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Bulk Assignment</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="assign-template" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Fee Structure Template
            </label>
            <select id="assign-template" value={templateId} onChange={(event) => setTemplateId(event.target.value)} className={selectClass} disabled={structuresStatus !== 'success'}>
              <option value="">Select a template</option>
              {activeTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.classRange})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="assign-target-mode" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Target Type
            </label>
            <select id="assign-target-mode" value={targetMode} onChange={(event) => setTargetMode(event.target.value)} className={selectClass}>
              <option value="class">Class / Section</option>
              <option value="manual">Manual Target (individual students)</option>
            </select>
          </div>

          {targetMode === 'class' ? (
            <>
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
            </>
          ) : (
            <>
              <div>
                <label htmlFor="assign-manual-target" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Target Description
                </label>
                <input
                  id="assign-manual-target"
                  type="text"
                  value={manualTarget}
                  onChange={(event) => setManualTarget(event.target.value)}
                  placeholder="e.g. Individual students - Roll no. 12, 45, 67"
                  className={selectClass}
                />
              </div>
              <div>
                <label htmlFor="assign-manual-count" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Estimated Student Count
                </label>
                <input
                  id="assign-manual-count"
                  type="number"
                  min="0"
                  value={manualCount}
                  onChange={(event) => setManualCount(event.target.value)}
                  placeholder="e.g. 3"
                  className={selectClass}
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Estimated Affected Students</p>
            {previewStatus === 'loading' ? (
              <Skeleton className="mt-1 h-6 w-16" />
            ) : (
              <p className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-white">{effectivePreviewCount ?? '—'}</p>
            )}
          </div>
          <PrimaryButton fullWidth={false} onClick={handleAssign} isLoading={isAssigning} disabled={!templateId || !effectivePreviewCount}>
            <Send className="h-4 w-4" aria-hidden="true" />
            Assign
          </PrimaryButton>
        </div>

        {assignedMessage && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{assignedMessage}</p>}
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Recent Assignment Batches</h2>
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
            titleKey="templateName"
            subtitleKey="targetDescription"
            trailingKey="studentsAffected"
            emptyMessage="No assignment batches yet."
          />
        )}
      </div>
    </div>
  )
}
