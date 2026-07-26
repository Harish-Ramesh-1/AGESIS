import GlassCard from '../../../components/common/GlassCard'

const PREFERENCE_LABELS = {
  paymentNotifications: 'Payment Notifications',
  emailAlerts: 'Email Alerts',
  smsAlerts: 'SMS Alerts',
  pushNotifications: 'Push Notifications',
  schoolAnnouncements: 'School Announcements',
  marketingNotifications: 'Marketing Notifications',
}

function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-premium ${
        checked ? 'bg-brand-600' : 'bg-slate-300 dark:bg-white/15'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-premium ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export default function PreferenceCard({ preferences, onToggle }) {
  return (
    <GlassCard title="Notification Preferences" description="Choose how you'd like to be notified">
      <div className="flex flex-col divide-y divide-slate-200/70 dark:divide-white/10">
        {Object.entries(PREFERENCE_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
            <Switch checked={preferences[key]} onChange={() => onToggle(key)} label={label} />
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
