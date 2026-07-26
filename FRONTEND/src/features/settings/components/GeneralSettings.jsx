import { useState } from 'react'
import { useSettingsStore } from '../../../store/settingsStore'
import { useStudentStore } from '../../../store/studentStore'
import Avatar from '../../../components/common/Avatar'
import InputField from '../../../components/common/Input'
import { PrimaryButton } from '../../../components/common/Button'
import GlassCard from '../../../components/common/GlassCard'
import SectionHeader from './SectionHeader'

const TIMEZONES = ['Asia/Kolkata', 'Asia/Dubai', 'Europe/London', 'America/New_York']
const CONTACT_METHODS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'sms', label: 'SMS' },
]

export default function GeneralSettings() {
  const general = useSettingsStore((state) => state.general)
  const updateGeneral = useSettingsStore((state) => state.updateGeneral)
  const profile = useStudentStore((state) => state.profile)
  const [form, setForm] = useState(general)
  const [isSaved, setIsSaved] = useState(false)

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setIsSaved(false)
  }

  function handleSave(event) {
    event.preventDefault()
    updateGeneral(form)
    setIsSaved(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="General" description="Your personal account details" />

      <GlassCard hover={false}>
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <Avatar initials={profile?.avatarInitials ?? '··'} size="lg" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Profile Picture</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Managed by the school administration.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              label="Parent Name"
              value={form.name}
              onChange={(event) => handleChange('name', event.target.value)}
            />
            <InputField
              type="email"
              label="Email"
              value={form.email}
              onChange={(event) => handleChange('email', event.target.value)}
            />
            <InputField
              type="tel"
              label="Phone Number"
              value={form.phone}
              onChange={(event) => handleChange('phone', event.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Preferred Contact Method</label>
              <select
                value={form.preferredContact}
                onChange={(event) => handleChange('preferredContact', event.target.value)}
                className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
              >
                {CONTACT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Timezone</label>
              <select
                value={form.timezone}
                onChange={(event) => handleChange('timezone', event.target.value)}
                className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
              >
                {TIMEZONES.map((timezone) => (
                  <option key={timezone} value={timezone}>
                    {timezone}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <PrimaryButton type="submit" fullWidth={false}>
              Save Changes
            </PrimaryButton>
            {isSaved && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-300">Saved</span>}
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
