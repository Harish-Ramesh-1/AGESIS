import { useEffect } from 'react'
import { Ban, CheckCircle2, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useSecurityAlertsStore } from '../store/securityAlertsStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import SummaryCard from '../components/SummaryCard'
import SecurityTable from '../components/SecurityTable'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { formatRelativeTime } from '../../../../utils/formatDate'

const SEVERITY_VARIANT = { critical: 'danger', high: 'warning', medium: 'info' }
const SEVERITY_LABEL = { critical: 'Critical', high: 'High', medium: 'Medium' }

function isThisWeek(value) {
  const diffDays = (Date.now() - new Date(value).getTime()) / 86_400_000
  return diffDays <= 7
}

export default function SecurityAlerts() {
  const status = useSecurityAlertsStore((state) => state.status)
  const error = useSecurityAlertsStore((state) => state.error)
  const alerts = useSecurityAlertsStore((state) => state.alerts)
  const actionStatus = useSecurityAlertsStore((state) => state.actionStatus)
  const actioningId = useSecurityAlertsStore((state) => state.actioningId)
  const fetchAlerts = useSecurityAlertsStore((state) => state.fetchAlerts)
  const resolve = useSecurityAlertsStore((state) => state.resolve)
  const blockIp = useSecurityAlertsStore((state) => state.blockIp)

  useEffect(() => {
    fetchAlerts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openAlerts = alerts.filter((row) => row.status === 'open')
  const criticalAlerts = alerts.filter((row) => row.severity === 'critical' && row.status === 'open')
  const resolvedThisWeek = alerts.filter((row) => row.status === 'resolved' && isThisWeek(row.timestamp))

  const columns = [
    { key: 'type', header: 'Event Type' },
    { key: 'user', header: 'User / Account' },
    { key: 'ip', header: 'IP Address' },
    { key: 'location', header: 'Location' },
    { key: 'timestamp', header: 'Detected', render: (row) => formatRelativeTime(row.timestamp) },
    { key: 'severity', header: 'Severity', render: (row) => <Badge variant={SEVERITY_VARIANT[row.severity]}>{SEVERITY_LABEL[row.severity]}</Badge> },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge variant={row.status === 'open' ? 'warning' : 'success'}>{row.status === 'open' ? 'Open' : 'Resolved'}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => {
        if (row.status === 'resolved') {
          return <span className="text-xs text-slate-400 dark:text-slate-500">No action needed</span>
        }
        const isBusy = actionStatus === 'loading' && actioningId === row.id
        return (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label={`Mark ${row.type} alert resolved`}
              disabled={isBusy}
              onClick={() => resolve(row.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-emerald-50 hover:text-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-400 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={`Block IP ${row.ip}`}
              disabled={isBusy}
              onClick={() => blockIp(row.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
            >
              <Ban className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Security Alerts" />

      <div aria-live="polite" className="sr-only">
        {openAlerts.length} open security alerts.
        {actionStatus === 'success' && ' Alert updated.'}
      </div>

      {status === 'loading' && alerts.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard icon={ShieldAlert} label="Open Alerts" value={openAlerts.length} tone="warning" />
          <SummaryCard icon={Ban} label="Critical" value={criticalAlerts.length} tone="danger" />
          <SummaryCard icon={CheckCircle2} label="Resolved This Week" value={resolvedThisWeek.length} tone="success" />
        </div>
      )}

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
        />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Flagged Security Events</h2>

        {status === 'loading' && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={fetchAlerts} />}

        {status === 'success' && (
          <SecurityTable
            columns={columns}
            rows={alerts}
            titleKey="type"
            subtitleKey="user"
            trailingKey="severity"
            emptyIcon={ShieldAlert}
            emptyTitle="No security alerts"
            emptyMessage="Flagged security events will appear here."
          />
        )}
      </div>
    </div>
  )
}
