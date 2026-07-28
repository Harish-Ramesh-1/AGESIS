import { useEffect } from 'react'
import { LayoutGrid, Plus, School, Users } from 'lucide-react'
import { useClassesSectionsStore } from '../store/classesSectionsStore'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { GlassButton } from '../../../../components/common/Button'
import PageHeaderSimple from '../components/PageHeaderSimple'
import SummaryCard from '../components/SummaryCard'
import ResponsiveTable from '../components/ResponsiveTable'

const COLUMNS = [
  { key: 'className', header: 'Class', render: (row) => `Grade ${row.className}` },
  { key: 'section', header: 'Section' },
  { key: 'classTeacher', header: 'Class Teacher' },
  { key: 'studentCount', header: 'Students' },
]

export default function ClassesSections() {
  const status = useClassesSectionsStore((state) => state.status)
  const error = useClassesSectionsStore((state) => state.error)
  const rows = useClassesSectionsStore((state) => state.rows)
  const summary = useClassesSectionsStore((state) => state.summary)
  const fetchClassesSections = useClassesSectionsStore((state) => state.fetchClassesSections)

  useEffect(() => {
    fetchClassesSections()
  }, [fetchClassesSections])

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple
        title="Classes & Sections"
        extraControls={
          <>
            <GlassButton icon={Plus}>Add Class</GlassButton>
            <GlassButton icon={Plus}>Add Section</GlassButton>
          </>
        }
      />

      {status === 'loading' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
      )}

      {status === 'error' && <ErrorState message={error} onRetry={fetchClassesSections} />}

      {status === 'success' && summary && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard icon={School} label="Total Classes" value={summary.totalClasses} meta="Grade 1 through Grade 12" />
            <SummaryCard icon={LayoutGrid} label="Total Sections" value={summary.totalSections} meta="Across all classes" />
            <SummaryCard icon={Users} label="Avg. Class Size" value={summary.avgClassSize} meta="Students per section" />
          </div>

          <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
            />
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">All Classes &amp; Sections</h2>
            <ResponsiveTable
              columns={COLUMNS}
              rows={rows}
              titleKey="className"
              subtitleKey="classTeacher"
              trailingKey="studentCount"
              emptyIcon={LayoutGrid}
              emptyTitle="No classes configured"
            />
          </div>
        </>
      )}
    </div>
  )
}
