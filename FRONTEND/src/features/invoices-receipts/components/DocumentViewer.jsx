import { useState } from 'react'
import { Copy, Download, Mail, Printer, ShieldCheck, Trash2, X } from 'lucide-react'
import { useDocumentViewerStore } from '../store/documentViewerStore'
import { useDocumentArchiveStore } from '../store/documentArchiveStore'
import Badge from '../../../components/common/Badge'
import Skeleton from '../../../components/common/Skeleton'
import Timeline from '../../../components/common/Timeline'
import InputField from '../../../components/common/Input'
import { PrimaryButton, SecondaryButton, GlassButton } from '../../../components/common/Button'
import PDFPreview from './PDFPreview'
import { downloadTextFile } from '../../../utils/downloadTextFile'
import { formatRelativeTime } from '../../../utils/formatDate'
import { DOCUMENT_STATUS_LABEL, DOCUMENT_STATUS_VARIANT } from '../utils/documentsUtils'

export default function DocumentViewer() {
  const status = useDocumentViewerStore((state) => state.status)
  const doc = useDocumentViewerStore((state) => state.document)
  const error = useDocumentViewerStore((state) => state.error)
  const activityStatus = useDocumentViewerStore((state) => state.activityStatus)
  const activity = useDocumentViewerStore((state) => state.activity)
  const isActing = useDocumentViewerStore((state) => state.isActing)
  const shareLink = useDocumentViewerStore((state) => state.shareLink)
  const closeDocument = useDocumentViewerStore((state) => state.closeDocument)
  const emailAction = useDocumentViewerStore((state) => state.email)
  const shareAction = useDocumentViewerStore((state) => state.share)
  const registerDownload = useDocumentViewerStore((state) => state.registerDownload)
  const registerPrint = useDocumentViewerStore((state) => state.registerPrint)
  const deleteDocumentFromArchive = useDocumentArchiveStore((state) => state.deleteDocument)

  const [emailAddress, setEmailAddress] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [copied, setCopied] = useState(false)

  if (status === 'idle') return null

  async function handleDownload() {
    downloadTextFile(`${doc.documentNumber}.txt`, `${doc.documentType === 'invoice' ? 'Invoice' : 'Receipt'} ${doc.documentNumber}\nStudent: ${doc.studentName}`)
    await registerDownload(doc.documentNumber)
  }

  async function handlePrint() {
    window.print()
    await registerPrint(doc.documentNumber)
  }

  async function handleEmail(event) {
    event.preventDefault()
    await emailAction(doc.documentNumber, { email: emailAddress })
    setShowEmailForm(false)
  }

  async function handleShare() {
    await shareAction(doc.documentNumber)
  }

  function handleCopyLink() {
    if (shareLink) navigator.clipboard?.writeText(shareLink)
    setCopied(true)
  }

  async function handleDelete() {
    await deleteDocumentFromArchive(doc.documentNumber)
    closeDocument()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" onClick={closeDocument} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Document viewer"
        className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-clay border border-white/50 bg-white/95 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95"
      >
        <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{status === 'success' ? doc.documentNumber : 'Loading document…'}</p>
            {status === 'success' && (
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={DOCUMENT_STATUS_VARIANT[doc.status]}>{DOCUMENT_STATUS_LABEL[doc.status]}</Badge>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-300">
                  <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                  Retained per school policy
                </span>
              </div>
            )}
          </div>
          <button type="button" onClick={closeDocument} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-white/10">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="thin-scrollbar flex-1 overflow-y-auto p-5">
          {status === 'loading' && <Skeleton className="h-96" />}
          {status === 'error' && <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load document. {error}</p>}

          {status === 'success' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <PDFPreview documentType={doc.documentType} data={doc.source} />
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <p className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-200">Actions</p>
                  <div className="flex flex-wrap gap-2">
                    <PrimaryButton fullWidth={false} onClick={handleDownload}>
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      Download
                    </PrimaryButton>
                    <SecondaryButton fullWidth={false} onClick={handlePrint}>
                      <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                      Print
                    </SecondaryButton>
                    <GlassButton onClick={() => setShowEmailForm((prev) => !prev)}>
                      <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                      Email
                    </GlassButton>
                    {shareLink ? (
                      <GlassButton onClick={handleCopyLink}>
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        {copied ? 'Copied' : 'Copy Link'}
                      </GlassButton>
                    ) : (
                      <GlassButton onClick={handleShare} disabled={isActing}>
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        Share
                      </GlassButton>
                    )}
                    <GlassButton onClick={() => setConfirmingDelete(true)} className="text-red-600 dark:text-red-300">
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Delete
                    </GlassButton>
                  </div>

                  {showEmailForm && (
                    <form onSubmit={handleEmail} className="mt-3 flex flex-col gap-2 rounded-xl border border-white/40 bg-white/40 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                      <InputField label="Email address" type="email" value={emailAddress} onChange={(event) => setEmailAddress(event.target.value)} required />
                      <PrimaryButton type="submit" fullWidth={false} isLoading={isActing}>
                        Send
                      </PrimaryButton>
                    </form>
                  )}

                  {confirmingDelete && (
                    <div className="mt-3 flex flex-col gap-2 rounded-xl border border-red-200/70 bg-red-50/60 p-3 dark:border-red-500/20 dark:bg-red-500/10">
                      <p className="text-xs text-red-700 dark:text-red-300">Permanently delete this document? This cannot be undone.</p>
                      <div className="flex gap-2">
                        <SecondaryButton fullWidth={false} onClick={() => setConfirmingDelete(false)}>
                          Cancel
                        </SecondaryButton>
                        <PrimaryButton fullWidth={false} className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
                          Delete
                        </PrimaryButton>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-200">Document Timeline</p>
                  {activityStatus === 'loading' && <Skeleton className="h-32" />}
                  {activityStatus === 'success' && (
                    <Timeline
                      items={activity.map((entry) => ({
                        id: entry.id,
                        icon: ShieldCheck,
                        tone: 'brand',
                        title: entry.action,
                        meta: `${entry.by} · ${formatRelativeTime(entry.date)}`,
                      }))}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
