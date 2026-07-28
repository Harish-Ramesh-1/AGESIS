import { useEffect, useState } from 'react'
import { CheckCircle2, KeyRound } from 'lucide-react'
import { useMyAccountStore } from '../store/myAccountStore'
import Breadcrumb from '../../../../components/common/Breadcrumb'
import GlassCard from '../../../../components/common/GlassCard'
import InputField from '../../../../components/common/Input'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { PrimaryButton } from '../../../../components/common/Button'
import { ADMIN_ROUTES } from '../../../../constants/routes'

const EMPTY_PASSWORD_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' }
const MIN_LENGTH = 8

export default function MyAccount() {
  const status = useMyAccountStore((state) => state.status)
  const error = useMyAccountStore((state) => state.error)
  const profile = useMyAccountStore((state) => state.profile)
  const fetchProfile = useMyAccountStore((state) => state.fetchProfile)
  const passwordStatus = useMyAccountStore((state) => state.passwordStatus)
  const passwordError = useMyAccountStore((state) => state.passwordError)
  const changePassword = useMyAccountStore((state) => state.changePassword)
  const resetPasswordStatus = useMyAccountStore((state) => state.resetPasswordStatus)

  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    fetchProfile()
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
        <Breadcrumb items={[{ label: 'Dashboard', to: ADMIN_ROUTES.dashboard }, { label: 'My Account' }]} />
        <ErrorState message={error} onRetry={fetchProfile} />
      </div>
    )
  }

  const isLoading = status === 'loading' || status === 'idle'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Breadcrumb items={[{ label: 'Dashboard', to: ADMIN_ROUTES.dashboard }, { label: 'My Account' }]} />
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Account</h1>
      </div>

      <GlassCard title="Profile" hover={false}>
        {isLoading ? (
          <Skeleton className="h-16" />
        ) : (
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Name</p>
              <p className="font-medium text-slate-800 dark:text-slate-100">{profile?.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Email</p>
              <p className="font-medium text-slate-800 dark:text-slate-100">{profile?.email}</p>
            </div>
          </div>
        )}
      </GlassCard>

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
              id="admin-current-password"
              label="Current Password"
              type="password"
              autoComplete="current-password"
              value={passwordForm.currentPassword}
              onChange={(event) => handlePasswordChange('currentPassword', event.target.value)}
              required
            />
            <InputField
              id="admin-new-password"
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
              id="admin-confirm-password"
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
    </div>
  )
}
