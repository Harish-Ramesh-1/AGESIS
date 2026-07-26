import { Download, Eye, FileText } from 'lucide-react'
import GlassCard from '../../../components/common/GlassCard'
import { downloadTextFile } from '../../../utils/downloadTextFile'
import { formatDate } from '../../../utils/formatDate'

function buildContent(doc) {
  return `${doc.label}\nDate: ${formatDate(doc.date)}\nAgesis International School`
}

export default function DocumentsCard({ documents }) {
  return (
    <GlassCard title="Documents">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between gap-3 rounded-clay border border-white/40 bg-white/30 p-4 transition-all duration-200 ease-premium hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                <FileText className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{doc.label}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(doc.date)}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                aria-label={`View ${doc.label}`}
                onClick={() =>
                  window.open(`data:text/plain,${encodeURIComponent(buildContent(doc))}`, '_blank', 'noopener,noreferrer')
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={`Download ${doc.label}`}
                onClick={() => downloadTextFile(`${doc.label.replace(/\s+/g, '-')}.txt`, buildContent(doc))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
