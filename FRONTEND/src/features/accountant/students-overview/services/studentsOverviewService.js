import { apiGet } from '../../../../services/apiClient'

export async function fetchStudentsOverview() {
  const [studentsRes, duesAnalyticsRes] = await Promise.all([
    apiGet('/students'),
    apiGet('/dues/analytics').catch(() => ({ data: null })),
  ])

  const students = studentsRes.data ?? []
  const duesAnalytics = duesAnalyticsRes.data

  const totalStudents = students.length
  const activeEnrollments = students.filter((student) => student.status === 'active' || !student.status).length

  // "New admissions this term" — approximated as admissions in the last 90 days, since the
  // backend doesn't expose an explicit term/semester boundary.
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000
  const newAdmissionsThisTerm = students.filter((student) => student.admitted_at && new Date(student.admitted_at).getTime() >= ninetyDaysAgo).length

  // Fee compliance rate is derived from the school-wide dues analytics (share of dues that are
  // neither pending nor overdue) — the backend has no per-class compliance metric, so the same
  // portal-wide rate is applied to every class/section row below.
  let feeComplianceRate = 100
  if (duesAnalytics && Number(duesAnalytics.totalDues) > 0) {
    const outstandingShare = (Number(duesAnalytics.overdueCount) + Number(duesAnalytics.pendingCount)) / Number(duesAnalytics.totalDues)
    feeComplianceRate = Math.max(0, Math.min(100, Math.round((1 - outstandingShare) * 100)))
  }

  const classMap = new Map()
  students.forEach((student) => {
    const className = student.class_name ?? 'Unassigned'
    const section = student.section ?? '-'
    const key = `${className}-${section}`
    if (!classMap.has(key)) classMap.set(key, { id: `class-${key}`, className, section, enrolled: 0 })
    classMap.get(key).enrolled += 1
  })
  const classesTable = [...classMap.values()]
    .sort((a, b) => a.className.localeCompare(b.className, undefined, { numeric: true }) || a.section.localeCompare(b.section))
    .map((row) => ({ ...row, feeCompliancePct: feeComplianceRate }))

  const breakdownMap = new Map()
  students.forEach((student) => {
    const className = student.class_name ?? 'Unassigned'
    breakdownMap.set(className, (breakdownMap.get(className) ?? 0) + 1)
  })
  const classBreakdown = [...breakdownMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
    .map(([className, enrolled]) => ({ className, enrolled }))
  const maxEnrolled = Math.max(1, ...classBreakdown.map((row) => row.enrolled))

  const feeStatusDistribution = duesAnalytics
    ? [
        { status: 'Overdue', count: Number(duesAnalytics.overdueCount) || 0 },
        { status: 'Pending', count: Number(duesAnalytics.pendingCount) || 0 },
        { status: 'Fully Paid', count: Math.max(0, totalStudents - (Number(duesAnalytics.overdueCount) || 0) - (Number(duesAnalytics.pendingCount) || 0)) },
      ]
    : []

  return {
    kpis: { totalStudents, activeEnrollments, newAdmissionsThisTerm, feeComplianceRate },
    classBreakdown: classBreakdown.map((row) => ({ ...row, pct: Math.round((row.enrolled / maxEnrolled) * 100) })),
    feeStatusDistribution,
    classesTable,
  }
}
