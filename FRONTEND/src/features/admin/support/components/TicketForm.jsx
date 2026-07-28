import { useState } from 'react'
import { Send } from 'lucide-react'
import InputField from '../../../../components/common/Input'
import { PrimaryButton } from '../../../../components/common/Button'
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '../services/supportService'

const selectClass =
  'rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

const EMPTY_FORM = { subject: '', category: TICKET_CATEGORIES[0], description: '', priority: 'Medium' }

export default function TicketForm({ onSubmit, isSubmitting }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [validationError, setValidationError] = useState('')

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.subject.trim() || !form.description.trim()) {
      setValidationError('Subject and description are required.')
      return
    }
    setValidationError('')
    const success = await onSubmit(form)
    if (success) setForm(EMPTY_FORM)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <InputField
        label="Subject"
        value={form.subject}
        onChange={(event) => updateField('subject', event.target.value)}
        placeholder="Briefly describe the issue"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="ticket-category" className="text-xs font-medium text-slate-700 dark:text-slate-200">
            Category
          </label>
          <select id="ticket-category" value={form.category} onChange={(event) => updateField('category', event.target.value)} className={selectClass}>
            {TICKET_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="ticket-priority" className="text-xs font-medium text-slate-700 dark:text-slate-200">
            Priority
          </label>
          <select id="ticket-priority" value={form.priority} onChange={(event) => updateField('priority', event.target.value)} className={selectClass}>
            {TICKET_PRIORITIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="ticket-description" className="text-xs font-medium text-slate-700 dark:text-slate-200">
          Description
        </label>
        <textarea
          id="ticket-description"
          rows={4}
          value={form.description}
          onChange={(event) => updateField('description', event.target.value)}
          placeholder="Add any relevant details — school/campus, affected module, screenshots you can attach separately, etc."
          className="w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </div>

      {validationError && (
        <p role="alert" className="text-xs font-medium text-red-500">
          {validationError}
        </p>
      )}

      <PrimaryButton type="submit" fullWidth={false} isLoading={isSubmitting}>
        <Send className="h-4 w-4" aria-hidden="true" />
        Raise Ticket
      </PrimaryButton>
    </form>
  )
}
