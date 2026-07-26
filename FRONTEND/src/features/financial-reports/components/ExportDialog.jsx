import { useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import clsx from 'clsx'
import { useExportStore } from '../store/exportStore'
import { PrimaryButton, SecondaryButton } from '../../../components/common/Button'
import { downloadCsv, downloadPdf, printContent } from '../utils/exportUtils'

const FORMATS = ['PDF', 'Excel', 'CSV', 'Print Ready']

export default function ExportDialog({ reportName, onClose }) {
  const requestExport = useExportStore((state) => state.requestExport)
  const isExporting = useExportStore((state) => state.isExporting)
  const [format, setFormat] = useState('PDF')
  const [isDone, setIsDone] = useState(false)

  async function handleExport() {
    await requestExport({ reportName, format })

    const generatedLine = `Generated ${new Date().toLocaleString()} · AGESIS International School`
    if (format === 'CSV' || format === 'Excel') {
      downloadCsv(`${reportName.replace(/\s+/g, '-').toLowerCase()}.csv`, ['Report', 'Generated At'], [[reportName, new Date().toISOString()]])
    } else if (format === 'PDF') {
      await downloadPdf(`${reportName.replace(/\s+/g, '-').toLowerCase()}.pdf`, reportName, [generatedLine])
    } else {
      printContent(reportName, [generatedLine])
    }
    setIsDone(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Export ${reportName}`}
        className="relative z-10 w-full max-w-sm rounded-clay border border-white/50 bg-white/95 p-6 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        {isDone ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{reportName} exported successfully</p>
            <SecondaryButton onClick={onClose} fullWidth={false}>
              Close
            </SecondaryButton>
          </div>
        ) : (
          <>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Export {reportName}</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Choose a format to generate this report.</p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {FORMATS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFormat(item)}
                  aria-pressed={format === item}
                  className={clsx(
                    'rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-premium',
                    format === item
                      ? 'border-brand-400/70 bg-white/60 text-brand-700 shadow-clay-active dark:border-brand-400/40 dark:bg-white/[0.08] dark:text-brand-300'
                      : 'border-white/40 bg-white/30 text-slate-600 shadow-clay dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300',
                  )}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <SecondaryButton fullWidth={false} onClick={onClose} disabled={isExporting}>
                Cancel
              </SecondaryButton>
              <PrimaryButton fullWidth={false} onClick={handleExport} isLoading={isExporting}>
                Export
              </PrimaryButton>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
