import { useEffect, useState } from 'react'
import { CheckCircle2, KeyRound, ShieldEllipsis, Timer } from 'lucide-react'
import { useSecurityPoliciesStore } from '../store/securityPoliciesStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import ToggleSwitch from '../components/ToggleSwitch'
import GlassCard from '../../../../components/common/GlassCard'
import InputField from '../../../../components/common/Input'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { PrimaryButton } from '../../../../components/common/Button'

const SESSION_TIMEOUT_OPTIONS = [15, 30, 45, 60, 120]

export default function SecurityPolicies() {
  const status = useSecurityPoliciesStore((state) => state.status)
  const error = useSecurityPoliciesStore((state) => state.error)
  const policies = useSecurityPoliciesStore((state) => state.policies)
  const saveStatus = useSecurityPoliciesStore((state) => state.saveStatus)
  const saveError = useSecurityPoliciesStore((state) => state.saveError)
  const fetchPolicies = useSecurityPoliciesStore((state) => state.fetchPolicies)
  const savePolicies = useSecurityPoliciesStore((state) => state.savePolicies)
  const resetSaveStatus = useSecurityPoliciesStore((state) => state.resetSaveStatus)

  const [form, setForm] = useState(null)

  useEffect(() => {
    fetchPolicies()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (policies && !form) setForm(policies)
  }, [policies, form])

  useEffect(() => {
    if (saveStatus === 'success') {
      const timeout = setTimeout(() => resetSaveStatus(), 4000)
      return () => clearTimeout(timeout)
    }
  }, [saveStatus, resetSaveStatus])

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave(event) {
    event.preventDefault()
    if (!form) return
    await savePolicies(form)
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeaderSimple title="Security Policies" />
        <ErrorState message={error} onRetry={fetchPolicies} />
      </div>
    )
  }

  const isLoading = status === 'loading' || status === 'idle' || !form

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Security Policies" />

      <div aria-live="polite" className="sr-only">
        {saveStatus === 'success' && 'Security policies saved successfully.'}
        {saveStatus === 'error' && `Failed to save security policies. ${saveError ?? ''}`}
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <GlassCard title="Authentication" description="Controls for how users prove their identity when signing in.">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, index) => (
                  <Skeleton key={index} className="h-16" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4 rounded-xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                      <KeyRound className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Enforce Two-Factor Authentication</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Require all admin and accountant accounts to use 2FA when signing in.
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={form.enforce2FA}
                    onChange={(next) => handleChange('enforce2FA', next)}
                    label="Toggle enforce two-factor authentication"
                  />
                </div>

                <div className="flex items-start justify-between gap-4 rounded-xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                      <ShieldEllipsis className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Require Password Complexity</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Passwords must include at least one symbol and one number.</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={form.requireSymbolInPassword}
                    onChange={(next) => handleChange('requireSymbolInPassword', next)}
                    label="Toggle require password complexity"
                  />
                </div>

                <InputField
                  id="policy-min-password-length"
                  label="Minimum Password Length"
                  type="number"
                  min={6}
                  max={32}
                  value={form.minPasswordLength}
                  onChange={(event) => handleChange('minPasswordLength', Number(event.target.value))}
                  helperText="Recommended: at least 8 characters."
                />
              </div>
            )}
          </GlassCard>

          <GlassCard title="Session &amp; Lockout" description="Controls for how long sessions stay valid and when accounts get locked.">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-11" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="policy-session-timeout" className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                    <Timer className="h-3.5 w-3.5" aria-hidden="true" />
                    Session Timeout Duration
                  </label>
                  <select
                    id="policy-session-timeout"
                    value={form.sessionTimeoutMinutes}
                    onChange={(event) => handleChange('sessionTimeoutMinutes', Number(event.target.value))}
                    className="rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
                  >
                    {SESSION_TIMEOUT_OPTIONS.map((minutes) => (
                      <option key={minutes} value={minutes}>
                        {minutes} minutes
                      </option>
                    ))}
                  </select>
                </div>

                <InputField
                  id="policy-max-failed-attempts"
                  label="Max Failed Login Attempts Before Lockout"
                  type="number"
                  min={3}
                  max={10}
                  value={form.maxFailedLoginAttempts}
                  onChange={(event) => handleChange('maxFailedLoginAttempts', Number(event.target.value))}
                />

                <InputField
                  id="policy-otp-expiry"
                  label="OTP Expiry (minutes)"
                  type="number"
                  min={2}
                  max={30}
                  value={form.otpExpiryMinutes}
                  onChange={(event) => handleChange('otpExpiryMinutes', Number(event.target.value))}
                />
              </div>
            )}
          </GlassCard>
        </div>

        {saveStatus === 'success' && (
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            Security policies saved successfully.
          </p>
        )}
        {saveStatus === 'error' && (
          <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
            {saveError}
          </p>
        )}

        <div>
          <PrimaryButton type="submit" fullWidth={false} disabled={isLoading} isLoading={saveStatus === 'loading'}>
            Save Changes
          </PrimaryButton>
        </div>
      </form>
    </div>
  )
}
