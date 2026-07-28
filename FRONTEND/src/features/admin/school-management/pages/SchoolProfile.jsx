import { useEffect, useState } from 'react'
import { CheckCircle2, ImagePlus, Landmark } from 'lucide-react'
import { useSchoolProfileStore } from '../store/schoolProfileStore'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import InputField from '../../../../components/common/Input'
import { PrimaryButton } from '../../../../components/common/Button'
import PageHeaderSimple from '../components/PageHeaderSimple'

const EMPTY_FORM = {
  name: '',
  address: '',
  phone: '',
  email: '',
  affiliationBoard: '',
  affiliationNumber: '',
  principalName: '',
  establishedYear: '',
}

export default function SchoolProfile() {
  const status = useSchoolProfileStore((state) => state.status)
  const error = useSchoolProfileStore((state) => state.error)
  const profile = useSchoolProfileStore((state) => state.profile)
  const saveStatus = useSchoolProfileStore((state) => state.saveStatus)
  const fetchProfile = useSchoolProfileStore((state) => state.fetchProfile)
  const saveProfile = useSchoolProfileStore((state) => state.saveProfile)
  const resetSaveStatus = useSchoolProfileStore((state) => state.resetSaveStatus)

  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (profile) setForm(profile)
  }, [profile])

  useEffect(() => {
    if (saveStatus !== 'saved') return undefined
    const timeout = setTimeout(resetSaveStatus, 3000)
    return () => clearTimeout(timeout)
  }, [saveStatus, resetSaveStatus])

  function handleChange(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    saveProfile(form)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="School Profile" />

      <div aria-live="polite" className="sr-only">
        {saveStatus === 'saved' ? 'School profile saved successfully.' : ''}
      </div>

      {status === 'loading' && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-72" />
        </div>
      )}

      {status === 'error' && <ErrorState message={error} onRetry={fetchProfile} />}

      {status === 'success' && profile && (
        <form
          onSubmit={handleSubmit}
          className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
          />

          <div className="mb-6 flex flex-wrap items-center gap-4">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-dashed border-brand-300 bg-brand-50/60 text-brand-600 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
              <span className="text-2xl font-bold">{profile.logoInitials}</span>
            </span>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">School Logo</p>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 self-start rounded-lg border border-white/50 bg-white/60 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/90 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200"
              >
                <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
                Upload New Logo
              </button>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">PNG or SVG, up to 2MB. (Mock — upload is not wired up.)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField label="School Name" icon={Landmark} value={form.name} onChange={handleChange('name')} />
            <InputField label="Principal Name" value={form.principalName} onChange={handleChange('principalName')} />
            <InputField label="Contact Phone" type="tel" value={form.phone} onChange={handleChange('phone')} />
            <InputField label="Contact Email" type="email" value={form.email} onChange={handleChange('email')} />
            <InputField label="Affiliation / Board" value={form.affiliationBoard} onChange={handleChange('affiliationBoard')} />
            <InputField label="Affiliation Number" value={form.affiliationNumber} onChange={handleChange('affiliationNumber')} />
            <InputField label="Established Year" type="number" value={form.establishedYear} onChange={handleChange('establishedYear')} />
            <div className="sm:col-span-2">
              <InputField label="Address" value={form.address} onChange={handleChange('address')} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-200/70 pt-5 dark:border-white/10">
            <PrimaryButton type="submit" isLoading={saveStatus === 'saving'} fullWidth={false} className="px-6">
              Save Changes
            </PrimaryButton>
            {saveStatus === 'saved' && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Changes saved
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
