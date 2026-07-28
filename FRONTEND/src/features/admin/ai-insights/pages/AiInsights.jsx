import { useEffect, useState } from 'react'
import { BellRing, CheckCircle2, Clock, Mail, Radar, Send, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react'
import { useAiInsightsStore } from '../store/aiInsightsStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import GlassCard from '../../../../components/common/GlassCard'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import InputField from '../../../../components/common/Input'
import { PrimaryButton } from '../../../../components/common/Button'

const ICON_MAP = {
  ShieldAlert,
  BellRing,
  TrendingUp,
  Radar,
  Clock,
}

export default function AiInsights() {
  const status = useAiInsightsStore((state) => state.status)
  const error = useAiInsightsStore((state) => state.error)
  const upcomingWidgets = useAiInsightsStore((state) => state.upcomingWidgets)
  const teaserInsights = useAiInsightsStore((state) => state.teaserInsights)
  const fetchPreview = useAiInsightsStore((state) => state.fetchPreview)
  const subscribeStatus = useAiInsightsStore((state) => state.subscribeStatus)
  const subscribeError = useAiInsightsStore((state) => state.subscribeError)
  const subscribe = useAiInsightsStore((state) => state.subscribe)
  const resetSubscribeStatus = useAiInsightsStore((state) => state.resetSubscribeStatus)

  const [notifyEmail, setNotifyEmail] = useState('')

  useEffect(() => {
    fetchPreview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (subscribeStatus === 'success') {
      setNotifyEmail('')
      const timeout = setTimeout(() => resetSubscribeStatus(), 4000)
      return () => clearTimeout(timeout)
    }
  }, [subscribeStatus, resetSubscribeStatus])

  async function handleNotifySubmit(event) {
    event.preventDefault()
    await subscribe(notifyEmail)
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeaderSimple title="AI Insights" />
        <ErrorState message={error} onRetry={fetchPreview} />
      </div>
    )
  }

  const isLoading = status === 'loading' || status === 'idle'

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="AI Insights" />

      <div aria-live="polite" className="sr-only">
        {subscribeStatus === 'success' && 'You will be notified when AI Insights become available.'}
        {subscribeStatus === 'error' && `Could not subscribe. ${subscribeError ?? ''}`}
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-gradient-to-br from-brand-50/80 via-white/40 to-white/20 p-6 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:from-brand-500/10 dark:via-white/[0.04] dark:to-white/[0.02] sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
        />
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-clay-button">
            <Sparkles className="h-7 w-7" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">AI-Powered Insights are on the way</h2>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              We&apos;re building predictive fee-default risk scoring, smart reminder timing, revenue forecasting and anomaly
              detection directly into the Admin Portal — so you can act before problems reach your desk, not after.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">What&apos;s coming</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-40" />)
            : upcomingWidgets.map((widget) => {
                const Icon = ICON_MAP[widget.icon] ?? Sparkles
                return (
                  <GlassCard key={widget.id} hover={false} className="relative">
                    <span className="absolute right-4 top-4">
                      <Badge variant="info">Coming Soon</Badge>
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{widget.title}</p>
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{widget.description}</p>
                  </GlassCard>
                )
              })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Available today (early preview)</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {isLoading
            ? Array.from({ length: 2 }).map((_, index) => <Skeleton key={index} className="h-28" />)
            : teaserInsights.map((insight) => {
                const Icon = ICON_MAP[insight.icon] ?? Sparkles
                return (
                  <div
                    key={insight.id}
                    className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-clay-active dark:border-white/10 dark:bg-white/[0.05] sm:p-6"
                  >
                    <div className="flex items-start justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <Badge variant="success">Live Preview</Badge>
                    </div>
                    <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{insight.value}</p>
                    <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">{insight.label}</p>
                    <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">{insight.meta}</p>
                  </div>
                )
              })}
        </div>
      </div>

      <GlassCard title="Get notified" description="We'll let you know as soon as AI Insights roll out to your school.">
        <form onSubmit={handleNotifySubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <InputField
              id="ai-insights-notify-email"
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="you@agesis.edu"
              value={notifyEmail}
              onChange={(event) => setNotifyEmail(event.target.value)}
            />
          </div>
          <PrimaryButton type="submit" fullWidth={false} isLoading={subscribeStatus === 'loading'}>
            <Send className="h-4 w-4" aria-hidden="true" />
            Notify Me When Available
          </PrimaryButton>
        </form>
        {subscribeStatus === 'success' && (
          <p className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            Thanks — we&apos;ll email you when AI Insights are available.
          </p>
        )}
        {subscribeStatus === 'error' && (
          <p role="alert" className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
            {subscribeError}
          </p>
        )}
      </GlassCard>
    </div>
  )
}
