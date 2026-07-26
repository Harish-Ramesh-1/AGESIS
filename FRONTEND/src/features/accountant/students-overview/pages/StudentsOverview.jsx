import { lazy, Suspense, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BadgeCheck, GraduationCap, School, UserPlus, Users } from 'lucide-react'
import { useStudentsOverviewStore } from '../store/studentsOverviewStore'
import Skeleton from '../../../../components/common/Skeleton'
import EmptyState from '../../../../components/common/EmptyState'
import ErrorState from '../../../../components/common/ErrorState'
import Badge from '../../../../components/common/Badge'
import { GlassButton } from '../../../../components/common/Button'
import { ACCOUNTANT_ROUTES } from '../../../../constants/routes'
import PageHeaderSimple from '../components/PageHeaderSimple'
import KpiCard from '../components/KpiCard'
import ClassEnrollmentBars from '../components/ClassEnrollmentBars'
import ClassesTable from '../components/ClassesTable'

const PieChart = lazy(() => import('../../../../components/charts/PieChart'))

function complianceVariant(pct) {
  if (pct >= 90) return 'success'
  if (pct >= 75) return 'warning'
  return 'danger'
}

const COLUMNS = [
  { key: 'className', header: 'Class', render: (row) => `Class ${row.className}` },
  { key: 'section', header: 'Section' },
  { key: 'enrolled', header: 'Enrolled' },
  {
    key: 'feeCompliancePct',
    header: 'Fee Compliance',
    render: (row) => <Badge variant={complianceVariant(row.feeCompliancePct)}>{row.feeCompliancePct}%</Badge>,
  },
]

export default function StudentsOverview() {
  const navigate = useNavigate()
  const status = useStudentsOverviewStore((state) => state.status)
  const error = useStudentsOverviewStore((state) => state.error)
  const overview = useStudentsOverviewStore((state) => state.overview)
  const fetchOverview = useStudentsOverviewStore((state) => state.fetchOverview)

  useEffect(() => {
    fetchOverview()
  }, [fetchOverview])

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple
        title="Students"
        extraControls={
          <GlassButton icon={Users} onClick={() => navigate(ACCOUNTANT_ROUTES.studentDirectory)}>
            Open Student Directory
          </GlassButton>
        }
      />

      {status === 'loading' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
      )}

      {status === 'error' && <ErrorState message={error} onRetry={fetchOverview} />}

      {status === 'success' && !overview && (
        <EmptyState icon={GraduationCap} title="No student data available" description="School-wide enrollment data could not be loaded." />
      )}

      {status === 'success' && overview && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard icon={Users} label="Total Students" value={overview.kpis.totalStudents} meta="Across all classes" />
            <KpiCard icon={BadgeCheck} label="Active Enrollments" value={overview.kpis.activeEnrollments} meta="Currently enrolled" />
            <KpiCard icon={UserPlus} label="New Admissions This Term" value={overview.kpis.newAdmissionsThisTerm} meta="Since term start" />
            <KpiCard icon={School} label="Fee Compliance Rate" value={`${overview.kpis.feeComplianceRate}%`} meta="Weighted across classes" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6 lg:col-span-3">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
              />
              <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Class-wise Enrollment</h2>
              <ClassEnrollmentBars data={overview.classBreakdown} />
            </div>

            <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6 lg:col-span-2">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
              />
              <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Fee Status Distribution</h2>
              <Suspense fallback={<Skeleton className="h-56" />}>
                <PieChart data={overview.feeStatusDistribution} dataKey="count" nameKey="status" height={240} />
              </Suspense>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
            />
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Classes &amp; Sections</h2>
            <ClassesTable columns={COLUMNS} rows={overview.classesTable} titleKey="className" subtitleKey="section" trailingKey="enrolled" />
          </div>
        </>
      )}
    </div>
  )
}
