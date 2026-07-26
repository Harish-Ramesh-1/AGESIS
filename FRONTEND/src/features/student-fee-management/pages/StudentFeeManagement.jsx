import { useState } from 'react'
import { Download } from 'lucide-react'
import clsx from 'clsx'
import { useStudentDirectoryStore } from '../store/studentDirectoryStore'
import Breadcrumb from '../../../components/common/Breadcrumb'
import { GlassButton } from '../../../components/common/Button'
import StudentSearchBar from '../components/StudentSearchBar'
import AdvancedFilters from '../components/AdvancedFilters'
import StudentDirectoryTable from '../components/StudentDirectoryTable'
import StudentProfileCard from '../components/StudentProfileCard'
import FeeStructureTable from '../components/FeeStructureTable'
import ScholarshipCard from '../components/ScholarshipCard'
import DiscountCard from '../components/DiscountCard'
import ConcessionTable from '../components/ConcessionTable'
import MiscellaneousChargesCard from '../components/MiscellaneousChargesCard'
import PenaltyWaiverCard from '../components/PenaltyWaiverCard'
import AdjustmentHistoryTable from '../components/AdjustmentHistoryTable'
import QuickActionsGrid from '../components/QuickActionsGrid'
import { ACCOUNTANT_ROUTES } from '../../../constants/routes'
import { downloadTextFile } from '../../../utils/downloadTextFile'
import { FEE_STATUS_LABEL } from '../utils/feeManagementUtils'

const TABS = [
  { key: 'fee-structure', label: 'Fee Structure' },
  { key: 'scholarships', label: 'Scholarships & Discounts' },
  { key: 'concessions', label: 'Concessions' },
  { key: 'misc-charges', label: 'Miscellaneous Charges' },
  { key: 'waive-penalty', label: 'Waive Penalty' },
  { key: 'adjustment-history', label: 'Adjustment History' },
]

const ACADEMIC_YEAR_OPTIONS = ['2025-2026', '2024-2025']

export default function StudentFeeManagement() {
  const students = useStudentDirectoryStore((state) => state.students)
  const selectedStudent = useStudentDirectoryStore((state) => state.selectedStudent)
  const detailStatus = useStudentDirectoryStore((state) => state.detailStatus)
  const [academicYear, setAcademicYear] = useState('2025-2026')
  const [activeTab, setActiveTab] = useState('fee-structure')

  function handleExport() {
    const header = 'Name,Registration No.,Class,Section,Parent,Outstanding,Status'
    const rows = students.map((student) =>
      [student.name, student.registrationNumber, student.className, student.section, student.parentName, student.outstandingAmount, FEE_STATUS_LABEL[student.status]].join(','),
    )
    downloadTextFile('student-directory.csv', [header, ...rows].join('\n'))
  }

  const showWorkspace = detailStatus === 'success' || detailStatus === 'loading'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Breadcrumb
          items={[{ label: 'Dashboard', to: ACCOUNTANT_ROUTES.dashboard }, { label: 'Student Fee Management' }]}
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Student Fee Management</h1>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={academicYear}
              onChange={(event) => setAcademicYear(event.target.value)}
              aria-label="Academic year"
              className="rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
            >
              {ACADEMIC_YEAR_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <GlassButton icon={Download} onClick={handleExport}>
              Export
            </GlassButton>
          </div>
        </div>
      </div>

      <StudentSearchBar />
      <AdvancedFilters />
      <StudentDirectoryTable />

      {showWorkspace && (
        <div className="flex flex-col gap-6">
          <StudentProfileCard />

          {detailStatus === 'success' && selectedStudent && (
            <>
              <div className="thin-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    aria-pressed={activeTab === tab.key}
                    className={clsx(
                      'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ease-premium',
                      activeTab === tab.key
                        ? 'bg-brand-600 text-white shadow-clay-button'
                        : 'border border-white/40 bg-white/40 text-slate-600 hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.07]',
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'fee-structure' && <FeeStructureTable />}
              {activeTab === 'scholarships' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <ScholarshipCard />
                  <DiscountCard />
                </div>
              )}
              {activeTab === 'concessions' && <ConcessionTable />}
              {activeTab === 'misc-charges' && <MiscellaneousChargesCard />}
              {activeTab === 'waive-penalty' && <PenaltyWaiverCard />}
              {activeTab === 'adjustment-history' && <AdjustmentHistoryTable />}

              <QuickActionsGrid />
            </>
          )}
        </div>
      )}
    </div>
  )
}
