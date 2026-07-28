import { useState } from 'react'
import { X } from 'lucide-react'
import { PrimaryButton, SecondaryButton } from '../../../../components/common/Button'
import InputField from '../../../../components/common/Input'
import { CHANNEL_OPTIONS, TEMPLATE_CATEGORIES } from '../services/notificationsService'

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function TemplateDialog({ initialValue, onSubmit, onClose, isSubmitting }) {
  const isEdit = Boolean(initialValue)
  const [form, setForm] = useState(
    initialValue ?? { name: '', channel: CHANNEL_OPTIONS[0], category: TEMPLATE_CATEGORIES[0], body: '' },
  )
  const [validationError, setValidationError] = useState('')

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.name.trim() || !form.body.trim()) {
      setValidationError('Template name and body are required.')
      return
    }
    setValidationError('')
    const success = await onSubmit(form)
    if (success) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit template' : 'Create template'}
        className="relative z-10 w-full max-w-lg rounded-clay border border-white/50 bg-white/95 p-6 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <h2 className="text-base font-semibold text-slate-900 dark:text-white">{isEdit ? 'Edit Template' : 'Create Template'}</h2>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <InputField label="Template Name" value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="e.g. Fee Reminder — Overdue" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="template-channel" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Channel
              </label>
              <select id="template-channel" value={form.channel} onChange={(event) => updateField('channel', event.target.value)} className={selectClass}>
                {CHANNEL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="template-category" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Category
              </label>
              <select id="template-category" value={form.category} onChange={(event) => updateField('category', event.target.value)} className={selectClass}>
                {TEMPLATE_CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="template-body" className="text-xs font-medium text-slate-700 dark:text-slate-200">
              Body
            </label>
            <textarea
              id="template-body"
              rows={4}
              value={form.body}
              onChange={(event) => updateField('body', event.target.value)}
              placeholder="Use {{studentName}}, {{amount}}, {{date}} etc. as placeholders"
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          {validationError && (
            <p role="alert" className="text-xs font-medium text-red-500">
              {validationError}
            </p>
          )}

          <div className="flex gap-3">
            <SecondaryButton fullWidth={false} onClick={onClose} disabled={isSubmitting}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" fullWidth={false} isLoading={isSubmitting}>
              {isEdit ? 'Save Changes' : 'Create Template'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  )
}
