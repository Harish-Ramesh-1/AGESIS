import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  BadgePercent,
  CalendarDays,
  FileClock,
  FileStack,
  Gauge,
  Receipt,
  ShieldOff,
  Wallet2,
} from 'lucide-react'
import { useExportStore } from '../store/exportStore'
import ReportsPageHeader from '../components/ReportsPageHeader'
import SectionHeader from '../components/SectionHeader'
import ExportDialog from '../components/ExportDialog'
import ReportBuilder from '../components/ReportBuilder'
import ScheduleCard from '../components/ScheduleCard'
import Badge from '../../../components/common/Badge'
import Skeleton from '../../../components/common/Skeleton'
import EmptyState from '../../../components/common/EmptyState'
import { formatRelativeTime } from '../../../utils/formatDate'
import { EXPORT_STATUS_LABEL, EXPORT_STATUS_VARIANT, formatFileSize } from '../utils/reportsUtils'

const TEMPLATES = [
  { key: 'Daily Collection', icon: Wallet2 },
  { key: 'Weekly Collection', icon: CalendarDays },
  { key: 'Monthly Revenue', icon: Gauge },
  { key: 'Outstanding Dues', icon: ShieldOff },
  { key: 'Payment Analytics', icon: Receipt },
  { key: 'Collection Analytics', icon: FileStack },
  { key: 'Refund Report', icon: BadgePercent },
  { key: 'Late Fee Report', icon: AlertTriangle },
]

export default function ExportReports() {
  const historyStatus = useExportStore((state) => state.historyStatus)
  const history = useExportStore((state) => state.history)
  const fetchHistory = useExportStore((state) => state.fetchHistory)
  const [activeTemplate, setActiveTemplate] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return (
    <div className="flex flex-col gap-6">
      <ReportsPageHeader pageTitle="Export Reports" />

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Export Templates" description="Quick-export a standard report" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TEMPLATES.map((template) => (
            <button
              key={template.key}
              type="button"
              onClick={() => setActiveTemplate(template.key)}
              className="flex flex-col items-start gap-3 rounded-clay border border-white/40 bg-white/40 p-4 text-left transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-white/60 hover:shadow-clay-active dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.07]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                <template.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{template.key}</p>
            </button>
          ))}
        </div>
      </div>

      <ReportBuilder />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
          <SectionHeader title="Export Queue" description="Recent export requests and download status" />

          {historyStatus === 'loading' && (
            <div className="space-y-2">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          )}

          {historyStatus === 'success' && history.length === 0 && <EmptyState icon={FileClock} title="No exports yet" description="Reports you export will appear here." />}

          {historyStatus === 'success' && history.length > 0 && (
            <ul className="flex flex-col gap-2">
              {history.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{item.reportName}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {item.format} · {formatRelativeTime(item.requestedAt)} · {formatFileSize(item.fileSizeKb)}
                    </p>
                  </div>
                  <Badge variant={EXPORT_STATUS_VARIANT[item.status]}>{EXPORT_STATUS_LABEL[item.status]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <ScheduleCard />
      </div>

      {activeTemplate && <ExportDialog reportName={activeTemplate} onClose={() => setActiveTemplate(null)} />}
    </div>
  )
}
