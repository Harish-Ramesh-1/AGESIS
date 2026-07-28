import { useEffect } from 'react'
import { Laptop, LogOut, Monitor, MonitorSmartphone, Smartphone, Tablet } from 'lucide-react'
import { useLoginSessionsStore } from '../store/loginSessionsStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import SecurityTable from '../components/SecurityTable'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { formatRelativeTime } from '../../../../utils/formatDate'

const DEVICE_ICON_KEYWORDS = [
  ['MacBook', Laptop],
  ['iPad', Tablet],
  ['iPhone', Smartphone],
  ['Android', Smartphone],
  ['Windows', Monitor],
]

function deviceIconFor(device) {
  const match = DEVICE_ICON_KEYWORDS.find(([keyword]) => device.includes(keyword))
  return match ? match[1] : MonitorSmartphone
}

export default function LoginSessions() {
  const status = useLoginSessionsStore((state) => state.status)
  const error = useLoginSessionsStore((state) => state.error)
  const sessions = useLoginSessionsStore((state) => state.sessions)
  const actionStatus = useLoginSessionsStore((state) => state.actionStatus)
  const actioningId = useLoginSessionsStore((state) => state.actioningId)
  const fetchSessions = useLoginSessionsStore((state) => state.fetchSessions)
  const revoke = useLoginSessionsStore((state) => state.revoke)

  useEffect(() => {
    fetchSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (row) => {
        const Icon = deviceIconFor(row.device)
        return (
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-800 dark:text-slate-100">{row.user}</p>
              <p className="truncate text-xs text-slate-400 dark:text-slate-500">{row.role}</p>
            </div>
          </div>
        )
      },
    },
    { key: 'device', header: 'Device' },
    { key: 'ip', header: 'IP Address' },
    { key: 'location', header: 'Location' },
    { key: 'loginTime', header: 'Login Time', render: (row) => formatRelativeTime(row.loginTime) },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge variant={row.status === 'flagged' ? 'danger' : 'success'}>{row.status === 'flagged' ? 'Flagged' : 'Active'}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button
          type="button"
          aria-label={`Revoke session for ${row.user}`}
          disabled={actionStatus === 'loading' && actioningId === row.id}
          onClick={() => revoke(row.id)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/50 bg-white/50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-clay transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          Revoke Session
        </button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Login Activity &amp; Sessions" />

      <div aria-live="polite" className="sr-only">
        {sessions.length} active sessions across all users.
        {actionStatus === 'success' && ' Session revoked.'}
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
        />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Active Sessions — All Users</h2>

        {status === 'loading' && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={fetchSessions} />}

        {status === 'success' && (
          <SecurityTable
            columns={columns}
            rows={sessions}
            titleKey="user"
            subtitleKey="device"
            trailingKey="status"
            emptyIcon={MonitorSmartphone}
            emptyTitle="No active sessions"
            emptyMessage="Signed-in sessions across the school portal will appear here."
          />
        )}
      </div>
    </div>
  )
}
