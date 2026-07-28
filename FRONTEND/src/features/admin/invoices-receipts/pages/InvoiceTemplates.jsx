import { useEffect, useState } from 'react'
import { Copy, LayoutTemplate, Plus, Star } from 'lucide-react'
import { useTemplatesStore } from '../store/templatesStore'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import EmptyState from '../../../../components/common/EmptyState'
import InputField from '../../../../components/common/Input'
import { PrimaryButton, SecondaryButton, GlassButton } from '../../../../components/common/Button'
import { formatDate } from '../../../../utils/formatDate'
import PageHeaderSimple from '../components/PageHeaderSimple'
import SectionHeader from '../components/SectionHeader'

export default function InvoiceTemplates() {
  const status = useTemplatesStore((state) => state.status)
  const error = useTemplatesStore((state) => state.error)
  const templates = useTemplatesStore((state) => state.templates)
  const actioningId = useTemplatesStore((state) => state.actioningId)
  const fetchTemplates = useTemplatesStore((state) => state.fetchTemplates)
  const makeDefault = useTemplatesStore((state) => state.makeDefault)
  const duplicate = useTemplatesStore((state) => state.duplicate)
  const create = useTemplatesStore((state) => state.create)

  const [isCreating, setIsCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('invoice')

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  async function handleCreate(event) {
    event.preventDefault()
    if (!name.trim()) return
    await create({ name: name.trim(), description: description.trim(), type })
    setName('')
    setDescription('')
    setType('invoice')
    setIsCreating(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple
        title="Invoice Templates"
        extraControls={
          <PrimaryButton fullWidth={false} onClick={() => setIsCreating((prev) => !prev)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create Template
          </PrimaryButton>
        }
      />

      <div aria-live="polite" className="sr-only">
        {status === 'success' && `${templates.length} templates available.`}
      </div>

      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
          <SectionHeader title="New Template" description="Define a name and description for the new design" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField label="Template Name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Festive Invoice" required />
            <div className="flex flex-col gap-1">
              <label htmlFor="template-type" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Document Type
              </label>
              <select
                id="template-type"
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
              >
                <option value="invoice">Invoice</option>
                <option value="receipt">Receipt</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <InputField label="Description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short description of this template" />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <PrimaryButton type="submit" fullWidth={false}>
              Save Template
            </PrimaryButton>
            <SecondaryButton fullWidth={false} onClick={() => setIsCreating(false)}>
              Cancel
            </SecondaryButton>
          </div>
        </form>
      )}

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Template Gallery" description="Invoice and receipt designs available across the institution" />

        {status === 'loading' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-48" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={fetchTemplates} />}

        {status === 'success' && templates.length === 0 && (
          <EmptyState icon={LayoutTemplate} title="No templates yet" description="Create your first invoice or receipt template." />
        )}

        {status === 'success' && templates.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => {
              const isBusy = actioningId === template.id
              return (
                <div
                  key={template.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-white/40 bg-white/40 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:shadow-clay-active dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <div className="flex h-28 items-center justify-center bg-gradient-to-br from-brand-100/70 to-brand-50/40 text-brand-400 dark:from-brand-500/10 dark:to-brand-500/5 dark:text-brand-300">
                    <LayoutTemplate className="h-10 w-10" aria-hidden="true" />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{template.name}</p>
                      {template.isDefault && (
                        <Badge variant="success" className="shrink-0">
                          <Star className="h-3 w-3" aria-hidden="true" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{template.description}</p>
                    <p className="mt-auto text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {template.type === 'invoice' ? 'Invoice' : 'Receipt'} · Modified {formatDate(template.lastModified)}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <GlassButton
                        onClick={() => makeDefault(template.id)}
                        disabled={template.isDefault || isBusy}
                        aria-label={`Set ${template.name} as default`}
                        className="flex-1"
                      >
                        <Star className="h-3.5 w-3.5" aria-hidden="true" />
                        Set as Default
                      </GlassButton>
                      <GlassButton onClick={() => duplicate(template.id)} disabled={isBusy} aria-label={`Duplicate ${template.name}`}>
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      </GlassButton>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
