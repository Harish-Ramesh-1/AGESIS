import { useEffect, useMemo, useState } from 'react'
import { CalendarClock, Download, ShieldAlert, Users } from 'lucide-react'
import { useAuditLogsStore } from '../store/auditLogsStore'
import { ACTION_TYPES, ACTORS, CRITICAL_ACTION_TYPES } from '../services/auditLogsService'
import { downloadCsv } from '../utils/exportUtils'
import { getActionTypeVariant } from '../utils/logMeta'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { GlassButton, SecondaryButton } from '../../../../components/common/Button'
import { formatDate } from '../../../../utils/formatDate'
import PageHeaderSimple from '../components/PageHeaderSimple'
import SummaryCard from '../components/SummaryCard'
import LogTable from '../components/LogTable'

const selectClass =
  'rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

function formatTimestamp(value) {
  const time = new Date(value).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
  return `${formatDate(value)} · ${time}`
}

const COLUMNS = [
  { key: 'timestamp', header: 'Timestamp', render: (row) => formatTimestamp(row.timestamp) },
  { key: 'actor', header: 'Actor' },
  {
    key: 'actionType',
    header: 'Action Type',
    render: (row) => <Badge variant={getActionTypeVariant(row.actionType)}>{row.actionType}</Badge>,
  },
  { key: 'entity', header: 'Entity Affected' },
  { key: 'details', header: 'Details' },
]

export default function AuditLogs() {
  const status = useAuditLogsStore((state) => state.status)
  const error = useAuditLogsStore((state) => state.error)
  const logs = useAuditLogsStore((state) => state.logs)
  const fetchLogs = useAuditLogsStore((state) => state.fetchLogs)

  const [query, setQuery] = useState('')
  const [actor, setActor] = useState('')
  const [actionType, setActionType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchLogs({ query, actor, actionType, dateFrom, dateTo })
    }, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, actor, actionType, dateFrom, dateTo])

  const todayKey = new Date().toISOString().slice(0, 10)
  const totalEventsToday = useMemo(() => logs.filter((row) => row.timestamp.slice(0, 10) === todayKey).length, [logs, todayKey])
  const criticalActions = useMemo(() => logs.filter((row) => CRITICAL_ACTION_TYPES.has(row.actionType)).length, [logs])
  const activeUsers = useMemo(() => new Set(logs.map((row) => row.actor)).size, [logs])

  function handleReset() {
    setQuery('')
    setActor('')
    setActionType('')
    setDateFrom('')
    setDateTo('')
  }

  function handleExport() {
    downloadCsv(
      'audit-logs.csv',
      ['Log ID', 'Timestamp', 'Actor', 'Action Type', 'Entity Affected', 'Details'],
      logs.map((row) => [row.id, formatTimestamp(row.timestamp), row.actor, row.actionType, row.entity, row.details]),
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple
        title="Audit Logs"
        extraControls={
          <GlassButton icon={Download} onClick={handleExport} disabled={logs.length === 0}>
            Export CSV
          </GlassButton>
        }
      />

      <div aria-live="polite" className="sr-only">
        {logs.length} audit log entries matching current filters.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard icon={CalendarClock} label="Total Events Today" value={totalEventsToday} tone="brand" />
        <SummaryCard icon={ShieldAlert} label="Critical Actions" value={criticalActions} tone="warning" />
        <SummaryCard icon={Users} label="Active Users" value={activeUsers} tone="brand" />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
        />

        <div className="mb-5 flex flex-col gap-3">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by actor, action, entity or details"
            aria-label="Search audit logs"
            className="w-full rounded-clay border border-white/50 bg-white/50 px-4 py-3 text-sm text-slate-800 shadow-clay-inset backdrop-blur-xl transition-colors duration-200 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="log-date-from" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                From
              </label>
              <input id="log-date-from" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className={selectClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="log-date-to" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                To
              </label>
              <input id="log-date-to" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className={selectClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="log-actor" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Actor
              </label>
              <select id="log-actor" value={actor} onChange={(event) => setActor(event.target.value)} className={selectClass}>
                <option value="">All Actors</option>
                {ACTORS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="log-action-type" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Action Type
              </label>
              <select id="log-action-type" value={actionType} onChange={(event) => setActionType(event.target.value)} className={selectClass}>
                <option value="">All Actions</option>
                {ACTION_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <SecondaryButton fullWidth={false} onClick={handleReset}>
              Reset
            </SecondaryButton>
          </div>
        </div>

        {status === 'loading' && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={() => fetchLogs({ query, actor, actionType, dateFrom, dateTo })} />}

        {status === 'success' && (
          <LogTable columns={COLUMNS} rows={logs} titleKey="actionType" subtitleKey="entity" trailingKey="timestamp" emptyMessage="Try adjusting your search or filters." />
        )}
      </div>
    </div>
  )
}
