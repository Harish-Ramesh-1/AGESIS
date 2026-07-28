import { useEffect, useState } from 'react'
import { CalendarRange, Plus } from 'lucide-react'
import { useAcademicYearsStore } from '../store/academicYearsStore'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import Badge from '../../../../components/common/Badge'
import InputField from '../../../../components/common/Input'
import { GlassButton, PrimaryButton, SecondaryButton } from '../../../../components/common/Button'
import { formatDate } from '../../../../utils/formatDate'
import PageHeaderSimple from '../components/PageHeaderSimple'
import ResponsiveTable from '../components/ResponsiveTable'

const STATUS_VARIANT = { active: 'success', upcoming: 'info', archived: 'neutral' }
const STATUS_LABEL = { active: 'Active', upcoming: 'Upcoming', archived: 'Archived' }

const EMPTY_FORM = { label: '', startDate: '', endDate: '' }

const COLUMNS = [
  { key: 'label', header: 'Academic Year' },
  { key: 'terms', header: 'Terms', render: (row) => row.terms.join(', ') },
  { key: 'startDate', header: 'Start Date', render: (row) => formatDate(row.startDate) },
  { key: 'endDate', header: 'End Date', render: (row) => formatDate(row.endDate) },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <Badge variant={STATUS_VARIANT[row.status]}>{STATUS_LABEL[row.status]}</Badge>,
  },
]

export default function AcademicYears() {
  const status = useAcademicYearsStore((state) => state.status)
  const error = useAcademicYearsStore((state) => state.error)
  const years = useAcademicYearsStore((state) => state.years)
  const fetchYears = useAcademicYearsStore((state) => state.fetchYears)
  const addYear = useAcademicYearsStore((state) => state.addYear)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    fetchYears()
  }, [fetchYears])

  const rows = years.map((year) => ({ ...year, termsLabel: year.terms.join(', ') }))

  function handleChange(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  async function handleCreate(event) {
    event.preventDefault()
    if (!form.label) return
    await addYear(form)
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple
        title="Academic Years & Terms"
        extraControls={
          <GlassButton icon={Plus} onClick={() => setShowForm((prev) => !prev)} aria-expanded={showForm}>
            Add Academic Year
          </GlassButton>
        }
      />

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6"
        >
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">New Academic Year</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <InputField label="Label (e.g. 2028-29)" value={form.label} onChange={handleChange('label')} required />
            <InputField label="Start Date" type="date" value={form.startDate} onChange={handleChange('startDate')} />
            <InputField label="End Date" type="date" value={form.endDate} onChange={handleChange('endDate')} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <PrimaryButton type="submit" fullWidth={false} className="px-6">
              Create Academic Year
            </PrimaryButton>
            <SecondaryButton type="button" fullWidth={false} onClick={() => setShowForm(false)}>
              Cancel
            </SecondaryButton>
          </div>
        </form>
      )}

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
        />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Academic Years</h2>

        {status === 'loading' && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={fetchYears} />}

        {status === 'success' && (
          <ResponsiveTable
            columns={COLUMNS}
            rows={rows}
            titleKey="label"
            subtitleKey="termsLabel"
            trailingKey="status"
            emptyIcon={CalendarRange}
            emptyTitle="No academic years configured"
          />
        )}
      </div>
    </div>
  )
}
