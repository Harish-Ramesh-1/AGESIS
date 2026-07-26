import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react'
import ProgressBar from '../../../components/common/ProgressBar'
import { PrimaryButton } from '../../../components/common/Button'
import SectionHeader from './SectionHeader'

export default function ProgressTracker({ isGenerating, progress, results, total, onRetryFailed }) {
  const successCount = results.filter((item) => item.success).length
  const failedCount = results.filter((item) => !item.success).length
  const estimatedSeconds = isGenerating ? Math.max(0, Math.round(((100 - progress) / 100) * (total * 0.25))) : 0

  return (
    <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
      <SectionHeader title="Generation Progress" description={isGenerating ? `Estimated time remaining: ${estimatedSeconds}s` : results.length > 0 ? 'Last run summary' : 'No generation run yet'} />

      {(isGenerating || results.length > 0) && (
        <>
          <ProgressBar value={progress} className="h-2.5" />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{progress}% complete</p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/60 px-3 py-3 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{successCount}</p>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/70">Success</p>
            </div>
            <div className="rounded-xl border border-red-200/70 bg-red-50/60 px-3 py-3 text-center dark:border-red-500/20 dark:bg-red-500/10">
              <p className="text-lg font-bold text-red-700 dark:text-red-300">{failedCount}</p>
              <p className="text-[11px] text-red-700/80 dark:text-red-300/70">Failed</p>
            </div>
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-3 text-center dark:border-white/10 dark:bg-white/[0.03]">
              <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{Math.max(0, total - results.length)}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Skipped</p>
            </div>
          </div>

          {results.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-200">Generation Logs</p>
              <ul className="thin-scrollbar flex max-h-48 flex-col gap-1.5 overflow-y-auto">
                {results.map((item) => (
                  <li key={item.candidateId} className="flex items-center gap-2 rounded-lg bg-white/40 px-3 py-2 text-xs dark:bg-white/[0.03]">
                    {item.success ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
                    )}
                    <span className="text-slate-700 dark:text-slate-200">{item.studentName}</span>
                    <span className="text-slate-400 dark:text-slate-500">{item.success ? `→ ${item.invoiceId}` : '→ Generation failed'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!isGenerating && failedCount > 0 && (
            <PrimaryButton className="mt-4" fullWidth={false} onClick={onRetryFailed}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Retry Failed ({failedCount})
            </PrimaryButton>
          )}
        </>
      )}
    </div>
  )
}
