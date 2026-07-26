import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, Monitor, X } from 'lucide-react'
import { useAccountantProfileStore } from '../store/profileStore'
import SettingsPageHeader from '../components/SettingsPageHeader'
import GlassCard from '../../../../components/common/GlassCard'
import Avatar from '../../../../components/common/Avatar'
import InputField from '../../../../components/common/Input'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { PrimaryButton } from '../../../../components/common/Button'
import { formatDate, formatRelativeTime } from '../../../../utils/formatDate'

const EMPTY_FORM = { name: '', email: '', phone: '' }

export default function AccountantProfile() {
  const status = useAccountantProfileStore((state) => state.status)
  const error = useAccountantProfileStore((state) => state.error)
  const profile = useAccountantProfileStore((state) => state.profile)
  const activity = useAccountantProfileStore((state) => state.activity)
  const saveStatus = useAccountantProfileStore((state) => state.saveStatus)
  const saveError = useAccountantProfileStore((state) => state.saveError)
  const fetchProfile = useAccountantProfileStore((state) => state.fetchProfile)
  const updateProfile = useAccountantProfileStore((state) => state.updateProfile)
  const resetSaveStatus = useAccountantProfileStore((state) => state.resetSaveStatus)

  const [form, setForm] = useState(EMPTY_FORM)
  const [initialized, setInitialized] = useState(false)
  const [bannerVisible, setBannerVisible] = useState(false)

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (profile && !initialized) {
      setForm({ name: profile.name, email: profile.email, phone: profile.phone })
      setInitialized(true)
    }
  }, [profile, initialized])

  useEffect(() => {
    if (saveStatus === 'success') {
      setBannerVisible(true)
      const timeout = setTimeout(() => {
        setBannerVisible(false)
        resetSaveStatus()
      }, 4000)
      return () => clearTimeout(timeout)
    }
  }, [saveStatus, resetSaveStatus])

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return
    await updateProfile(form)
  }

  function dismissBanner() {
    setBannerVisible(false)
    resetSaveStatus()
  }

  const isSaveDisabled = !form.name.trim() || !form.email.trim() || saveStatus === 'loading'

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <SettingsPageHeader pageTitle="Accountant Profile" />
        <ErrorState message={error} onRetry={fetchProfile} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <SettingsPageHeader pageTitle="Accountant Profile" />

      <div aria-live="polite" className="sr-only">
        {saveStatus === 'success' && 'Profile changes saved successfully.'}
        {saveStatus === 'error' && `Failed to save profile changes. ${saveError ?? ''}`}
      </div>

      {bannerVisible && saveStatus === 'success' && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            Profile changes saved successfully.
          </span>
          <button
            type="button"
            onClick={dismissBanner}
            aria-label="Dismiss success message"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-emerald-600 transition-colors duration-200 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {saveStatus === 'error' && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          Couldn&apos;t save changes. {saveError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {status === 'loading' || status === 'idle' ? (
            <GlassCard title="Personal Information">
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-11" />
                ))}
              </div>
            </GlassCard>
          ) : (
            <GlassCard title="Personal Information" description="Keep your contact details up to date.">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <Avatar initials={profile.avatarInitials} size="lg" />
                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">{profile.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{profile.designation}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField
                    id="profile-name"
                    label="Full Name"
                    value={form.name}
                    onChange={(event) => handleChange('name', event.target.value)}
                    required
                    error={!form.name.trim() ? 'Name is required.' : undefined}
                  />
                  <InputField
                    id="profile-email"
                    label="Email Address"
                    type="email"
                    value={form.email}
                    onChange={(event) => handleChange('email', event.target.value)}
                    required
                    error={!form.email.trim() ? 'Email is required.' : undefined}
                  />
                  <InputField
                    id="profile-phone"
                    label="Phone Number"
                    type="tel"
                    value={form.phone}
                    onChange={(event) => handleChange('phone', event.target.value)}
                  />
                  <InputField id="profile-employee-id" label="Employee ID" value={profile.employeeId} disabled />
                  <InputField id="profile-department" label="Department" value={profile.department} disabled />
                  <InputField id="profile-designation" label="Designation" value={profile.designation} disabled />
                  <InputField id="profile-joining-date" label="Joining Date" value={formatDate(profile.joiningDate)} disabled />
                </div>

                <div>
                  <PrimaryButton type="submit" fullWidth={false} disabled={isSaveDisabled} isLoading={saveStatus === 'loading'}>
                    Save Changes
                  </PrimaryButton>
                </div>
              </form>
            </GlassCard>
          )}
        </div>

        <div>
          {status === 'loading' || status === 'idle' ? (
            <GlassCard title="Account Activity">
              <div className="space-y-3">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            </GlassCard>
          ) : (
            <GlassCard title="Account Activity" description="Read-only summary of your recent access.">
              <dl className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">Last Login</dt>
                    <dd className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-100">{formatRelativeTime(activity.lastLogin)}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                    <Monitor className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">Active Sessions</dt>
                    <dd className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-100">{activity.activeSessionCount}</dd>
                  </div>
                </div>
              </dl>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  )
}
