import { useEffect } from 'react'
import { Download, FileText, Printer } from 'lucide-react'
import { useDocumentStore } from '../../../store/documentStore'
import GlassCard from '../../../components/common/GlassCard'
import Skeleton from '../../../components/common/Skeleton'
import ErrorState from '../../../components/common/ErrorState'
import { GlassButton } from '../../../components/common/Button'
import { formatDate } from '../../../utils/formatDate'
import { downloadTextFile } from '../../../utils/downloadTextFile'

function buildContent(doc) {
  return `${doc.label}\nDocument ID: ${doc.id}\nDate: ${formatDate(doc.date)}\nAgesis International School`
}

export default function DocumentCard() {
  const status = useDocumentStore((state) => state.status)
  const documents = useDocumentStore((state) => state.documents)
  const fetchDocuments = useDocumentStore((state) => state.fetchDocuments)

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  if (status === 'loading' || status === 'idle') {
    return (
      <GlassCard title="Documents">
        <Skeleton className="h-16" />
      </GlassCard>
    )
  }

  if (status === 'error' || !documents) {
    return (
      <GlassCard title="Documents">
        <ErrorState message="Couldn't load documents." onRetry={fetchDocuments} />
      </GlassCard>
    )
  }

  function handlePrint(doc) {
    const printWindow = window.open('', '_blank', 'noopener,noreferrer')
    if (!printWindow) return
    printWindow.document.write(`<pre style="font-family: sans-serif; padding: 24px;">${buildContent(doc)}</pre>`)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const actions = [
    documents.statement && {
      label: 'Download Statement',
      icon: Download,
      onClick: () => downloadTextFile(`${documents.statement.id}.txt`, buildContent(documents.statement)),
    },
    documents.invoice && {
      label: 'Download Invoice',
      icon: FileText,
      onClick: () => downloadTextFile(`${documents.invoice.id}.txt`, buildContent(documents.invoice)),
    },
    documents.receipt && {
      label: 'Download Receipt',
      icon: Download,
      onClick: () => downloadTextFile(`${documents.receipt.id}.txt`, buildContent(documents.receipt)),
    },
    documents.statement && { label: 'Print Statement', icon: Printer, onClick: () => handlePrint(documents.statement) },
  ].filter(Boolean)

  return (
    <GlassCard title="Documents" description="Download or print your fee documents">
      {actions.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {actions.map((action) => (
            <GlassButton
              key={action.label}
              icon={action.icon}
              onClick={action.onClick}
              className="w-full justify-center py-3"
            >
              {action.label}
            </GlassButton>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">No documents generated yet.</p>
      )}
    </GlassCard>
  )
}
