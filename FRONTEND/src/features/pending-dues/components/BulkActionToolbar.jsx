import { BellRing, Download, FileText } from 'lucide-react'

export default function BulkActionToolbar({ count, onSendReminder, onExport, onGenerateStatements }) {
  if (count === 0) return null

  return (
    <div className="sticky bottom-4 z-30 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-clay border border-brand-200/60 bg-brand-50/90 px-4 py-3 shadow-glass backdrop-blur-2xl dark:border-brand-500/20 dark:bg-brand-500/15">
      <p className="text-sm font-medium text-brand-800 dark:text-brand-200">{count} student{count > 1 ? 's' : ''} selected</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSendReminder}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/50 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
        >
          <BellRing className="h-3.5 w-3.5" aria-hidden="true" />
          Send Reminder
        </button>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/50 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Export
        </button>
        <button
          type="button"
          onClick={onGenerateStatements}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/50 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
        >
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          Generate Statements
        </button>
      </div>
    </div>
  )
}
