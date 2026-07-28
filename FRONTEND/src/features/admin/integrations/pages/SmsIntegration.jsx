import { useEffect, useState } from 'react'
import { CheckCircle2, MessageSquareText, Send } from 'lucide-react'
import { useIntegrationsStore } from '../store/integrationsStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import GlassCard from '../../../../components/common/GlassCard'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import ProgressBar from '../../../../components/common/ProgressBar'
import InputField from '../../../../components/common/Input'
import { PrimaryButton } from '../../../../components/common/Button'
import { formatDate } from '../../../../utils/formatDate'

export default function SmsIntegration() {
  const status = useIntegrationsStore((state) => state.smsStatus)
  const error = useIntegrationsStore((state) => state.smsError)
  const sms = useIntegrationsStore((state) => state.sms)
  const smsTestStatus = useIntegrationsStore((state) => state.smsTestStatus)
  const smsTestError = useIntegrationsStore((state) => state.smsTestError)
  const fetchSms = useIntegrationsStore((state) => state.fetchSms)
  const sendTestSms = useIntegrationsStore((state) => state.sendTestSms)

  const [phone, setPhone] = useState('')

  useEffect(() => {
    fetchSms()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    await sendTestSms(phone)
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeaderSimple title="SMS Gateway" />
        <ErrorState message={error} onRetry={fetchSms} />
      </div>
    )
  }

  const isLoading = status === 'loading' || status === 'idle' || !sms
  const creditsPercent = isLoading ? 0 : Math.round((sms.creditsRemaining / sms.creditsTotal) * 100)

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="SMS Gateway" />

      <div aria-live="polite" className="sr-only">
        {smsTestStatus === 'success' && 'Test SMS sent successfully.'}
        {smsTestStatus === 'error' && `Failed to send test SMS. ${smsTestError ?? ''}`}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard title="Provider Configuration" description="Transactional SMS provider used for reminders and alerts.">
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
                  <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{sms.provider}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Sender ID: {sms.senderId}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="sms-api-key" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  API Key
                </label>
                <input
                  id="sms-api-key"
                  readOnly
                  value={sms.apiKeyMasked}
                  className="w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 font-mono text-sm text-slate-900 shadow-clay-inset dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-200">
                  <span>SMS Credits Remaining</span>
                  <span>
                    {sms.creditsRemaining.toLocaleString('en-IN')} / {sms.creditsTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <ProgressBar value={creditsPercent} />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Last tested {formatDate(sms.lastTestedAt)}.</p>
            </div>
          )}
        </GlassCard>

        <GlassCard title="Send Test SMS" description="Verify the connection by sending a sample message to a phone number.">
          {isLoading ? (
            <Skeleton className="h-32" />
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <InputField
                id="sms-test-phone"
                label="Phone Number"
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                helperText="Enter a 10-digit Indian mobile number."
                required
              />

              {smsTestStatus === 'success' && (
                <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Test SMS sent successfully.
                </p>
              )}
              {smsTestStatus === 'error' && (
                <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
                  {smsTestError}
                </p>
              )}

              <div>
                <PrimaryButton type="submit" fullWidth={false} isLoading={smsTestStatus === 'loading'}>
                  <Send className="h-4 w-4" aria-hidden="true" />
                  Test SMS
                </PrimaryButton>
              </div>
            </form>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
