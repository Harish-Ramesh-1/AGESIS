const DELAY_MS = 600

function delay(ms = DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const SECTIONS = ['A', 'B', 'C']

// Deterministic pseudo-random enrollment/compliance figures per class-section,
// hand-tuned to look realistic (lower classes larger, senior classes smaller with more scholarships).
const CLASS_BASE_ENROLLMENT = { 1: 46, 2: 45, 3: 44, 4: 43, 5: 42, 6: 41, 7: 40, 8: 39, 9: 38, 10: 37, 11: 30, 12: 28 }
const CLASS_BASE_COMPLIANCE = { 1: 96, 2: 95, 3: 94, 4: 93, 5: 92, 6: 90, 7: 89, 8: 88, 9: 86, 10: 84, 11: 90, 12: 91 }
const SECTION_OFFSET = { A: 2, B: 0, C: -3 }
const SECTION_COMPLIANCE_OFFSET = { A: 3, B: 0, C: -4 }

function buildClasses() {
  const classes = []
  for (let classNum = 1; classNum <= 12; classNum += 1) {
    for (const section of SECTIONS) {
      const enrolled = CLASS_BASE_ENROLLMENT[classNum] + SECTION_OFFSET[section]
      const feeCompliancePct = Math.min(100, Math.max(60, CLASS_BASE_COMPLIANCE[classNum] + SECTION_COMPLIANCE_OFFSET[section]))
      classes.push({
        id: `class-${classNum}-${section}`,
        className: String(classNum),
        section,
        enrolled,
        feeCompliancePct,
      })
    }
  }
  return classes
}

const CLASSES = buildClasses()

function buildOverview() {
  const totalStudents = CLASSES.reduce((sum, row) => sum + row.enrolled, 0)
  const activeEnrollments = totalStudents - 12
  const newAdmissionsThisTerm = 57
  const weightedCompliance = CLASSES.reduce((sum, row) => sum + row.enrolled * row.feeCompliancePct, 0)
  const feeComplianceRate = Math.round(weightedCompliance / totalStudents)

  const classBreakdown = Array.from({ length: 12 }, (_, index) => {
    const classNum = String(index + 1)
    const rows = CLASSES.filter((row) => row.className === classNum)
    const enrolled = rows.reduce((sum, row) => sum + row.enrolled, 0)
    return { className: classNum, enrolled }
  })
  const maxEnrolled = Math.max(...classBreakdown.map((row) => row.enrolled))

  const feeStatusDistribution = [
    { status: 'Paid in Full', count: Math.round(totalStudents * 0.58) },
    { status: 'Partially Paid', count: Math.round(totalStudents * 0.24) },
    { status: 'Overdue', count: Math.round(totalStudents * 0.12) },
    { status: 'Not Started', count: Math.round(totalStudents * 0.06) },
  ]

  return {
    kpis: { totalStudents, activeEnrollments, newAdmissionsThisTerm, feeComplianceRate },
    classBreakdown: classBreakdown.map((row) => ({ ...row, pct: Math.round((row.enrolled / maxEnrolled) * 100) })),
    feeStatusDistribution,
    classesTable: CLASSES,
  }
}

export async function fetchStudentsOverview() {
  await delay()
  return buildOverview()
}
