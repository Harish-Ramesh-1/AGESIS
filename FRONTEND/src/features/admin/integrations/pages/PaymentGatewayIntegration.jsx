import { useEffect, useState } from 'react'
import { CheckCircle2, Copy, CreditCard, Eye, EyeOff, Loader2, Percent, RefreshCw, Zap } from 'lucide-react'
import { useIntegrationsStore } from '../store/integrationsStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import GlassCard from '../../../../components/common/GlassCard'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { GlassButton, PrimaryButton, SecondaryButton } from '../../../../components/common/Button'
import { formatDate } from '../../../../utils/formatDate'

export default function PaymentGatewayIntegration() {
  const status = useIntegrationsStore((state) => state.gatewayStatus)
  const error = useIntegrationsStore((state) => state.gatewayError)
  const gateway = useIntegrationsStore((state) => state.gateway)
  const gatewayActionStatus = useIntegrationsStore((state) => state.gatewayActionStatus)
  const gatewayTestStatus = useIntegrationsStore((state) => state.gatewayTestStatus)
  const gatewayTestResult = useIntegrationsStore((state) => state.gatewayTestResult)
  const fetchGateway = useIntegrationsStore((state) => state.fetchGateway)
  const regenerateGatewayKey = useIntegrationsStore((state) => state.regenerateGatewayKey)
  const testGatewayConnection = useIntegrationsStore((state) => state.testGatewayConnection)

  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchGateway()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [copied])

  function handleCopyWebhook() {
    if (gateway?.webhookUrl && navigator?.clipboard) {
      navigator.clipboard.writeText(gateway.webhookUrl).catch(() => {})
    }
    setCopied(true)
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeaderSimple title="Payment Gateway" />
        <ErrorState message={error} onRetry={fetchGateway} />
      </div>
    )
  }

  const isLoading = status === 'loading' || status === 'idle' || !gateway

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Payment Gateway" />

      <div aria-live="polite" className="sr-only">
        {gatewayActionStatus === 'success' && 'API key regenerated.'}
        {gatewayTestStatus === 'success' && 'Connection test completed successfully.'}
        {gatewayTestStatus === 'error' && `Connection test failed. ${gatewayTestResult?.message ?? ''}`}
      </div>

      <GlassCard
        title="Razorpay"
        description="Primary gateway used for online fee collection across the school."
        action={
          !isLoading && (
            <Badge variant={gateway.status === 'connected' ? 'success' : 'danger'}>
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              {gateway.status === 'connected' ? 'Connected' : 'Disconnected'}
            </Badge>
          )
        }
      >
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="gateway-api-key" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  API Key
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="gateway-api-key"
                    readOnly
                    value={revealed ? gateway.apiKeyFull : gateway.apiKeyMasked}
                    className="w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 font-mono text-sm text-slate-900 shadow-clay-inset dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
                  />
                  <GlassButton
                    aria-label={revealed ? 'Hide API key' : 'Reveal API key'}
                    onClick={() => setRevealed((prev) => !prev)}
                    className="shrink-0 px-3"
                  >
                    {revealed ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  </GlassButton>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="gateway-webhook-url" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  Webhook URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="gateway-webhook-url"
                    readOnly
                    value={gateway.webhookUrl}
                    className="w-full truncate rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 font-mono text-sm text-slate-900 shadow-clay-inset dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
                  />
                  <GlassButton aria-label="Copy webhook URL" onClick={handleCopyWebhook} className="shrink-0 px-3">
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  </GlassButton>
                </div>
                {copied && <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Copied to clipboard.</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <Percent className="h-3.5 w-3.5" aria-hidden="true" /> Transaction Fee
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{gateway.transactionFeePercent}%</p>
              </div>
              <div className="rounded-xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Settlement Cycle</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{gateway.settlementCycle}</p>
              </div>
              <div className="rounded-xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Last Tested</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{formatDate(gateway.lastTestedAt)}</p>
              </div>
            </div>

            {gatewayTestStatus === 'success' && gatewayTestResult?.success && (
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                Connection successful — responded in {gatewayTestResult.latencyMs}ms.
              </p>
            )}
            {gatewayTestStatus === 'error' && (
              <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
                {gatewayTestResult?.message}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <PrimaryButton fullWidth={false} onClick={testGatewayConnection} isLoading={gatewayTestStatus === 'loading'}>
                <Zap className="h-4 w-4" aria-hidden="true" />
                Test Connection
              </PrimaryButton>
              <SecondaryButton fullWidth={false} onClick={regenerateGatewayKey} disabled={gatewayActionStatus === 'loading'}>
                {gatewayActionStatus === 'loading' ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                )}
                Regenerate Key
              </SecondaryButton>
              {gatewayActionStatus === 'success' && (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Key regenerated successfully.</span>
              )}
            </div>
          </div>
        )}
      </GlassCard>

      <GlassCard title="About This Integration" description="How Razorpay is used across the platform.">
        <div className="flex items-start gap-3 rounded-xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            <CreditCard className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Razorpay processes all online tuition, transport and hostel fee payments initiated by parents through the Parent
            Portal. Refunds, settlement reports and gateway-side transaction IDs are reconciled automatically against the
            accountant&apos;s payment records every night.
          </p>
        </div>
      </GlassCard>
    </div>
  )
}
