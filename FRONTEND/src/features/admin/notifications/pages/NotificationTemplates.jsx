import { useEffect, useMemo, useState } from 'react'
import { Copy, FileText, Mail, MessageSquare, Plus, SquarePen, Smartphone } from 'lucide-react'
import { useTemplatesStore } from '../store/templatesStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import NotificationsNav from '../components/NotificationsNav'
import SummaryCard from '../components/SummaryCard'
import TemplateDialog from '../components/TemplateDialog'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import EmptyState from '../../../../components/common/EmptyState'
import Badge from '../../../../components/common/Badge'
import { PrimaryButton } from '../../../../components/common/Button'
import { formatRelativeTime } from '../../../../utils/formatDate'
import { getChannelMeta } from '../utils/notificationMeta'

export default function NotificationTemplates() {
  const status = useTemplatesStore((state) => state.status)
  const error = useTemplatesStore((state) => state.error)
  const items = useTemplatesStore((state) => state.items)
  const actionStatus = useTemplatesStore((state) => state.actionStatus)
  const fetchTemplates = useTemplatesStore((state) => state.fetchTemplates)
  const createTemplate = useTemplatesStore((state) => state.createTemplate)
  const duplicateTemplate = useTemplatesStore((state) => state.duplicateTemplate)
  const updateTemplate = useTemplatesStore((state) => state.updateTemplate)

  const [dialogMode, setDialogMode] = useState(null) // null | 'create' | template object for edit
  const [duplicatingId, setDuplicatingId] = useState(null)

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const smsCount = useMemo(() => items.filter((item) => item.channel === 'SMS').length, [items])
  const emailCount = useMemo(() => items.filter((item) => item.channel === 'Email').length, [items])
  const pushCount = useMemo(() => items.filter((item) => item.channel === 'Push').length, [items])

  async function handleDuplicate(id) {
    setDuplicatingId(id)
    await duplicateTemplate(id)
    setDuplicatingId(null)
  }

  async function handleDialogSubmit(payload) {
    if (dialogMode && dialogMode !== 'create') {
      const record = await updateTemplate(dialogMode.id, payload)
      return Boolean(record)
    }
    const record = await createTemplate(payload)
    return Boolean(record)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple
        title="Notification Templates"
        extraControls={
          <PrimaryButton fullWidth={false} onClick={() => setDialogMode('create')}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create Template
          </PrimaryButton>
        }
      />
      <NotificationsNav />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <SummaryCard icon={FileText} label="Total Templates" value={items.length} tone="brand" />
        <SummaryCard icon={MessageSquare} label="SMS Templates" value={smsCount} tone="brand" />
        <SummaryCard icon={Mail} label="Email Templates" value={emailCount} tone="brand" />
        <SummaryCard icon={Smartphone} label="Push Templates" value={pushCount} tone="brand" />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Reusable Templates</h2>

        {status === 'loading' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-40" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={fetchTemplates} />}

        {status === 'success' && items.length === 0 && (
          <EmptyState icon={FileText} title="No templates yet" description="Create your first reusable notification template." />
        )}

        {status === 'success' && items.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((template) => {
              const meta = getChannelMeta(template.channel)
              return (
                <div key={template.id} className="flex flex-col gap-3 rounded-xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{template.name}</p>
                      <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Updated {formatRelativeTime(template.updatedAt)}</p>
                    </div>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </div>
                  <p className="line-clamp-3 text-xs text-slate-500 dark:text-slate-400">{template.body}</p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                    <Badge variant="neutral">{template.category}</Badge>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicate(template.id)}
                        aria-label={`Duplicate ${template.name}`}
                        disabled={duplicatingId === template.id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/10"
                      >
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDialogMode(template)}
                        aria-label={`Edit ${template.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
                      >
                        <SquarePen className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {dialogMode && (
        <TemplateDialog
          initialValue={dialogMode === 'create' ? null : dialogMode}
          onSubmit={handleDialogSubmit}
          onClose={() => setDialogMode(null)}
          isSubmitting={actionStatus === 'loading'}
        />
      )}
    </div>
  )
}
