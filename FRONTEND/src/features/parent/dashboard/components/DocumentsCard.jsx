import { Download, Eye, FileText } from 'lucide-react'
import { useDashboardStore } from '../../../../store/dashboardStore'
import { GlassButton } from '../../../../components/common/Button'
import Skeleton from '../../../../components/common/Skeleton/Skeleton'
import DashboardCard from './DashboardCard'
import { formatDate } from '../../../../utils/formatDate'
import { downloadTextFile } from '../../../../utils/downloadTextFile'

function buildDocumentContent(doc) {
  return `${doc.label}\nDocument ID: ${doc.id}\nDate: ${formatDate(doc.date)}\nAgesis International School`
}

function DocumentRow({ doc }) {
  const content = buildDocumentContent(doc)

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
          <FileText className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{doc.label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {doc.id} · {formatDate(doc.date)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          aria-label={`Preview ${doc.label}`}
          onClick={() => window.open(`data:text/plain,${encodeURIComponent(content)}`, '_blank', 'noopener,noreferrer')}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 ease-premium hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={`Download ${doc.label}`}
          onClick={() => downloadTextFile(`${doc.id}.txt`, content)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 ease-premium hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default function DocumentsCard() {
  const status = useDashboardStore((state) => state.status)
  const documents = useDashboardStore((state) => state.documents)

  if (status === 'loading' || status === 'idle') {
    return (
      <DashboardCard title="Documents">
        <div className="space-y-3">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      </DashboardCard>
    )
  }

  if (status === 'error' || !documents) {
    return (
      <DashboardCard title="Documents">
        <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load documents.</p>
      </DashboardCard>
    )
  }

  function handleDownloadAll() {
    downloadTextFile(`${documents.latestInvoice.id}.txt`, buildDocumentContent(documents.latestInvoice))
    downloadTextFile(`${documents.latestReceipt.id}.txt`, buildDocumentContent(documents.latestReceipt))
  }

  return (
    <DashboardCard title="Documents" action={<GlassButton onClick={handleDownloadAll}>Download All</GlassButton>}>
      <div className="flex flex-col gap-3">
        <DocumentRow doc={documents.latestInvoice} />
        <DocumentRow doc={documents.latestReceipt} />
      </div>
    </DashboardCard>
  )
}
