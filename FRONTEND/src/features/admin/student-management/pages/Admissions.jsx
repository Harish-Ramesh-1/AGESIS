import { useEffect, useState } from 'react'
import { Check, ClipboardPlus, Eye, X } from 'lucide-react'
import { useAdmissionsStore } from '../store/admissionsStore'
import { CLASS_NUMBERS } from '../services/studentManagementService'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import Badge from '../../../../components/common/Badge'
import InputField from '../../../../components/common/Input'
import { GlassButton, PrimaryButton, SecondaryButton } from '../../../../components/common/Button'
import { formatDate } from '../../../../utils/formatDate'
import PageHeaderSimple from '../components/PageHeaderSimple'
import ResponsiveTable from '../components/ResponsiveTable'

const STATUS_VARIANT = { submitted: 'info', 'under-review': 'warning', approved: 'success', rejected: 'danger' }
const STATUS_LABEL = { submitted: 'Submitted', 'under-review': 'Under Review', approved: 'Approved', rejected: 'Rejected' }

const selectClass =
  'rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

const EMPTY_FORM = { applicantName: '', applyingForClass: '1', parentContact: '' }

export default function Admissions() {
  const status = useAdmissionsStore((state) => state.status)
  const error = useAdmissionsStore((state) => state.error)
  const applications = useAdmissionsStore((state) => state.applications)
  const fetchApplications = useAdmissionsStore((state) => state.fetchApplications)
  const addApplication = useAdmissionsStore((state) => state.addApplication)
  const setStatus = useAdmissionsStore((state) => state.setStatus)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  function handleChange(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.applicantName) return
    await addApplication(form)
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  const rows = applications.map((application) => ({
    ...application,
    applyingForClassLabel: `Grade ${application.applyingForClass}`,
  }))

  const columns = [
    { key: 'applicantName', header: 'Applicant' },
    { key: 'applyingForClass', header: 'Applying For', render: (row) => `Grade ${row.applyingForClass}` },
    { key: 'submittedDate', header: 'Submitted On', render: (row) => formatDate(row.submittedDate) },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={STATUS_VARIANT[row.status]}>{STATUS_LABEL[row.status]}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatus(row.id, 'under-review')}
            aria-label={`Mark ${row.applicantName}'s application as under review`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-slate-400 dark:hover:bg-white/10"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setStatus(row.id, 'approved')}
            aria-label={`Approve ${row.applicantName}'s application`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-slate-400 dark:hover:bg-white/10"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setStatus(row.id, 'rejected')}
            aria-label={`Reject ${row.applicantName}'s application`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-slate-400 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple
        title="Admissions"
        extraControls={
          <GlassButton icon={ClipboardPlus} onClick={() => setShowForm((prev) => !prev)} aria-expanded={showForm}>
            New Admission
          </GlassButton>
        }
      />

      <div aria-live="polite" className="sr-only">
        {applications.length} admission applications in the pipeline.
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6"
        >
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">New Admission Application</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <InputField label="Applicant Name" value={form.applicantName} onChange={handleChange('applicantName')} required />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="adm-applying-class" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Applying For Class
              </label>
              <select id="adm-applying-class" value={form.applyingForClass} onChange={handleChange('applyingForClass')} className={selectClass}>
                {CLASS_NUMBERS.map((item) => (
                  <option key={item} value={item}>
                    Grade {item}
                  </option>
                ))}
              </select>
            </div>
            <InputField label="Parent Contact Number" type="tel" value={form.parentContact} onChange={handleChange('parentContact')} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <PrimaryButton type="submit" fullWidth={false} className="px-6">
              Submit Application
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
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Admission Pipeline</h2>

        {status === 'loading' && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={fetchApplications} />}

        {status === 'success' && (
          <ResponsiveTable
            columns={columns}
            rows={rows}
            titleKey="applicantName"
            subtitleKey="applyingForClassLabel"
            trailingKey="status"
            emptyIcon={ClipboardPlus}
            emptyTitle="No admission applications"
          />
        )}
      </div>
    </div>
  )
}
