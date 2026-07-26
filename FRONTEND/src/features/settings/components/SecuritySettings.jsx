import { useState } from 'react'
import { Clock, Mail, Phone, ShieldCheck } from 'lucide-react'
import { useSettingsStore } from '../../../store/settingsStore'
import Badge from '../../../components/common/Badge'
import GlassCard from '../../../components/common/GlassCard'
import SectionHeader from './SectionHeader'
import SecurityActionModal from './SecurityActionModal'
import { formatRelativeTime } from '../../../utils/formatDate'

const ACTION_CARDS = [
  {
    key: 'email',
    icon: Mail,
    title: 'Change Email',
    description: 'Requests are reviewed and approved by the school admin.',
    fields: [{ key: 'email', label: 'New Email', type: 'email', placeholder: 'you@example.com' }],
    requestKey: 'emailChangeRequest',
    requestAction: 'requestEmailChange',
    cancelAction: 'cancelEmailChangeRequest',
    currentValueKey: 'registeredEmail',
    currentLabel: 'Registered Email',
  },
  {
    key: 'mobile',
    icon: Phone,
    title: 'Change Mobile Number',
    description: 'Requests are reviewed and approved by the school admin.',
    fields: [{ key: 'mobile', label: 'New Mobile Number', type: 'tel' }],
    requestKey: 'mobileChangeRequest',
    requestAction: 'requestMobileChange',
    cancelAction: 'cancelMobileChangeRequest',
    currentValueKey: 'registeredMobile',
    currentLabel: 'Registered Mobile Number',
  },
]

export default function SecuritySettings() {
  const security = useSettingsStore((state) => state.security)
  const requestEmailChange = useSettingsStore((state) => state.requestEmailChange)
  const requestMobileChange = useSettingsStore((state) => state.requestMobileChange)
  const cancelEmailChangeRequest = useSettingsStore((state) => state.cancelEmailChangeRequest)
  const cancelMobileChangeRequest = useSettingsStore((state) => state.cancelMobileChangeRequest)
  const [activeModal, setActiveModal] = useState(null)

  const actions = { requestEmailChange, requestMobileChange, cancelEmailChangeRequest, cancelMobileChangeRequest }
  const activeCard = ACTION_CARDS.find((card) => card.key === activeModal)

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Security" description="Manage your login credentials" />

      <GlassCard hover={false}>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">OTP-Based Login</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your account does not use a password. You sign in with a one-time code sent to your registered email
              or mobile number.
            </p>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ACTION_CARDS.map((card) => {
          const pendingRequest = security[card.requestKey]
          return (
            <GlassCard key={card.key} hover={false}>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                  <card.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400 dark:text-slate-500">{card.currentLabel}</p>
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                    {security[card.currentValueKey]}
                  </p>
                </div>
              </div>

              {pendingRequest ? (
                <div className="mt-4 flex flex-col gap-2 rounded-xl border border-amber-200/70 bg-amber-50/60 px-3.5 py-3 dark:border-amber-500/20 dark:bg-amber-500/[0.08]">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" aria-hidden="true" />
                    <Badge variant="warning">Pending Admin Approval</Badge>
                  </div>
                  <p className="truncate text-xs text-amber-800 dark:text-amber-200">
                    Requested: {pendingRequest.value}
                  </p>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-300/70">
                    Submitted {formatRelativeTime(pendingRequest.submittedAt)}
                  </p>
                  <button
                    type="button"
                    onClick={() => actions[card.cancelAction]()}
                    className="self-start text-xs font-medium text-slate-500 underline-offset-2 hover:underline dark:text-slate-400"
                  >
                    Cancel Request
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveModal(card.key)}
                  className="mt-4 rounded-lg border border-white/40 bg-white/40 px-3.5 py-2 text-xs font-medium text-slate-700 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.07]"
                >
                  Request Change
                </button>
              )}
            </GlassCard>
          )
        })}
      </div>

      {activeCard && (
        <SecurityActionModal
          title={activeCard.title}
          fields={activeCard.fields}
          successMessage="Your request has been submitted for admin approval."
          onSubmit={(values) => actions[activeCard.requestAction](Object.values(values)[0])}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  )
}
