import { useEffect, useState } from 'react'
import { CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react'
import { useAccountantSecurityStore } from '../store/securityStore'
import SettingsPageHeader from '../components/SettingsPageHeader'
import ToggleSwitch from '../components/ToggleSwitch'
import ActiveSessionsList from '../components/ActiveSessionsList'
import LoginHistoryTable from '../components/LoginHistoryTable'
import GlassCard from '../../../../components/common/GlassCard'
import InputField from '../../../../components/common/Input'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { PrimaryButton, SecondaryButton } from '../../../../components/common/Button'

const EMPTY_PASSWORD_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' }
const MIN_LENGTH = 8

export default function Security() {
  const status = useAccountantSecurityStore((state) => state.status)
  const error = useAccountantSecurityStore((state) => state.error)
  const twoFactorEnabled = useAccountantSecurityStore((state) => state.twoFactorEnabled)
  const twoFactorStatus = useAccountantSecurityStore((state) => state.twoFactorStatus)
  const sessions = useAccountantSecurityStore((state) => state.sessions)
  const loginHistory = useAccountantSecurityStore((state) => state.loginHistory)
  const passwordStatus = useAccountantSecurityStore((state) => state.passwordStatus)
  const passwordError = useAccountantSecurityStore((state) => state.passwordError)
  const sessionActionStatus = useAccountantSecurityStore((state) => state.sessionActionStatus)
  const sessionActionError = useAccountantSecurityStore((state) => state.sessionActionError)
  const fetchSecurity = useAccountantSecurityStore((state) => state.fetchSecurity)
  const changePassword = useAccountantSecurityStore((state) => state.changePassword)
  const resetPasswordStatus = useAccountantSecurityStore((state) => state.resetPasswordStatus)
  const toggleTwoFactor = useAccountantSecurityStore((state) => state.toggleTwoFactor)
  const signOutSession = useAccountantSecurityStore((state) => state.signOutSession)
  const signOutOtherSessions = useAccountantSecurityStore((state) => state.signOutOtherSessions)

  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    fetchSecurity()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (passwordStatus === 'success') {
      setPasswordForm(EMPTY_PASSWORD_FORM)
      setTouched(false)
      const timeout = setTimeout(() => resetPasswordStatus(), 4000)
      return () => clearTimeout(timeout)
    }
  }, [passwordStatus, resetPasswordStatus])

  function handlePasswordChange(field, value) {
    setPasswordForm((prev) => ({ ...prev, [field]: value }))
  }

  const validationErrors = {}
  if (touched) {
    if (passwordForm.newPassword.length > 0 && passwordForm.newPassword.length < MIN_LENGTH) {
      validationErrors.newPassword = `New password must be at least ${MIN_LENGTH} characters.`
    }
    if (passwordForm.newPassword && passwordForm.currentPassword && passwordForm.newPassword === passwordForm.currentPassword) {
      validationErrors.newPassword = 'New password must be different from your current password.'
    }
    if (passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match.'
    }
  }

  const isFormComplete = passwordForm.currentPassword && passwordForm.newPassword && passwordForm.confirmPassword
  const isFormValid =
    isFormComplete &&
    passwordForm.newPassword.length >= MIN_LENGTH &&
    passwordForm.newPassword !== passwordForm.currentPassword &&
    passwordForm.newPassword === passwordForm.confirmPassword

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    setTouched(true)
    if (!isFormValid) return
    await changePassword(passwordForm)
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <SettingsPageHeader pageTitle="Security" />
        <ErrorState message={error} onRetry={fetchSecurity} />
      </div>
    )
  }

  const isLoading = status === 'loading' || status === 'idle'

  return (
    <div className="flex flex-col gap-6">
      <SettingsPageHeader pageTitle="Security" />

      <div aria-live="polite" className="sr-only">
        {passwordStatus === 'success' && 'Password changed successfully.'}
        {passwordStatus === 'error' && `Failed to change password. ${passwordError ?? ''}`}
        {sessionActionStatus === 'success' && 'Session list updated.'}
        {sessionActionStatus === 'error' && `Failed to update sessions. ${sessionActionError ?? ''}`}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard title="Change Password" description="Use a strong password you don't reuse elsewhere.">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-11" />
              ))}
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <InputField
                id="security-current-password"
                label="Current Password"
                type="password"
                autoComplete="current-password"
                value={passwordForm.currentPassword}
                onChange={(event) => handlePasswordChange('currentPassword', event.target.value)}
                required
              />
              <InputField
                id="security-new-password"
                label="New Password"
                type="password"
                autoComplete="new-password"
                value={passwordForm.newPassword}
                onChange={(event) => handlePasswordChange('newPassword', event.target.value)}
                required
                error={validationErrors.newPassword}
                helperText={!validationErrors.newPassword ? `Minimum ${MIN_LENGTH} characters.` : undefined}
              />
              <InputField
                id="security-confirm-password"
                label="Confirm New Password"
                type="password"
                autoComplete="new-password"
                value={passwordForm.confirmPassword}
                onChange={(event) => handlePasswordChange('confirmPassword', event.target.value)}
                required
                error={validationErrors.confirmPassword}
              />

              {passwordStatus === 'success' && (
                <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Password changed successfully.
                </p>
              )}
              {passwordStatus === 'error' && (
                <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
                  {passwordError}
                </p>
              )}

              <div>
                <PrimaryButton type="submit" fullWidth={false} isLoading={passwordStatus === 'loading'}>
                  <KeyRound className="h-4 w-4" aria-hidden="true" />
                  Change Password
                </PrimaryButton>
              </div>
            </form>
          )}
        </GlassCard>

        <GlassCard title="Two-Factor Authentication" description="Add an extra layer of protection to your account.">
          {isLoading ? (
            <Skeleton className="h-16" />
          ) : (
            <div className="flex items-start justify-between gap-4 rounded-xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {twoFactorEnabled ? 'Two-factor authentication is on' : 'Two-factor authentication is off'}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    When enabled, you&apos;ll be asked for a one-time code in addition to your password when signing in.
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={twoFactorEnabled}
                onChange={(next) => toggleTwoFactor(next)}
                disabled={twoFactorStatus === 'loading'}
                label="Toggle two-factor authentication"
              />
            </div>
          )}
        </GlassCard>
      </div>

      <GlassCard
        title="Active Sessions"
        description="Devices currently signed in to your account."
        action={
          sessions.filter((session) => !session.current).length > 0 && (
            <SecondaryButton fullWidth={false} onClick={signOutOtherSessions} disabled={sessionActionStatus === 'loading'}>
              Sign out all other sessions
            </SecondaryButton>
          )
        }
      >
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-14" />
            ))}
          </div>
        ) : (
          <ActiveSessionsList sessions={sessions} onSignOut={signOutSession} isBusy={sessionActionStatus === 'loading'} />
        )}
      </GlassCard>

      <GlassCard title="Login History" description="Recent sign-in attempts on your account.">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10" />
            ))}
          </div>
        ) : (
          <LoginHistoryTable rows={loginHistory} />
        )}
      </GlassCard>
    </div>
  )
}
