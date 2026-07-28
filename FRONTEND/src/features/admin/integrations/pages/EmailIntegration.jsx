import { useEffect, useState } from 'react'
import { CheckCircle2, Mail, Send } from 'lucide-react'
import { useIntegrationsStore } from '../store/integrationsStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import GlassCard from '../../../../components/common/GlassCard'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import ProgressBar from '../../../../components/common/ProgressBar'
import InputField from '../../../../components/common/Input'
import { PrimaryButton } from '../../../../components/common/Button'
import { formatDate } from '../../../../utils/formatDate'

export default function EmailIntegration() {
  const status = useIntegrationsStore((state) => state.emailStatus)
  const error = useIntegrationsStore((state) => state.emailError)
  const email = useIntegrationsStore((state) => state.email)
  const emailTestStatus = useIntegrationsStore((state) => state.emailTestStatus)
  const emailTestError = useIntegrationsStore((state) => state.emailTestError)
  const fetchEmail = useIntegrationsStore((state) => state.fetchEmail)
  const sendTestEmail = useIntegrationsStore((state) => state.sendTestEmail)

  const [address, setAddress] = useState('')

  useEffect(() => {
    fetchEmail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    await sendTestEmail(address)
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeaderSimple title="Email Service" />
        <ErrorState message={error} onRetry={fetchEmail} />
      </div>
    )
  }

  const isLoading = status === 'loading' || status === 'idle' || !email
  const quotaPercent = isLoading ? 0 : Math.round((email.dailyQuotaUsed / email.dailyQuotaTotal) * 100)

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Email Service" />

      <div aria-live="polite" className="sr-only">
        {emailTestStatus === 'success' && 'Test email sent successfully.'}
        {emailTestStatus === 'error' && `Failed to send test email. ${emailTestError ?? ''}`}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard title="Provider Configuration" description="Transactional email service used for receipts, invoices and alerts.">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-11" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 rounded-xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{email.provider}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {email.fromName} &lt;{email.fromAddress}&gt;
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-200">
                  <span>Daily Quota Used</span>
                  <span>
                    {email.dailyQuotaUsed.toLocaleString('en-IN')} / {email.dailyQuotaTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <ProgressBar value={quotaPercent} />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Last tested {formatDate(email.lastTestedAt)}.</p>
            </div>
          )}
        </GlassCard>

        <GlassCard title="Send Test Email" description="Verify the connection by sending a sample email to an address.">
          {isLoading ? (
            <Skeleton className="h-32" />
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <InputField
                id="email-test-address"
                label="Email Address"
                type="email"
                placeholder="you@agesis.edu"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                required
              />

              {emailTestStatus === 'success' && (
                <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Test email sent successfully.
                </p>
              )}
              {emailTestStatus === 'error' && (
                <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
                  {emailTestError}
                </p>
              )}

              <div>
                <PrimaryButton type="submit" fullWidth={false} isLoading={emailTestStatus === 'loading'}>
                  <Send className="h-4 w-4" aria-hidden="true" />
                  Test Email
                </PrimaryButton>
              </div>
            </form>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
