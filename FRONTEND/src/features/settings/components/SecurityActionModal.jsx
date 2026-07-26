import { useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { PrimaryButton, SecondaryButton } from '../../../components/common/Button'
import InputField from '../../../components/common/Input'

export default function SecurityActionModal({ title, fields, successMessage, onClose, onSubmit }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((field) => [field.key, ''])))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 700))
    onSubmit?.(values)
    setIsSubmitting(false)
    setIsDone(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
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
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {successMessage ?? `${title} updated successfully`}
            </p>
            <SecondaryButton onClick={onClose} fullWidth={false}>
              Close
            </SecondaryButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
            <div className="mt-4 flex flex-col gap-3">
              {fields.map((field) => (
                <InputField
                  key={field.key}
                  type={field.type ?? 'text'}
                  label={field.label}
                  placeholder={field.placeholder}
                  value={values[field.key]}
                  onChange={(event) => setValues((prev) => ({ ...prev, [field.key]: event.target.value }))}
                  required
                />
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <SecondaryButton type="button" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" isLoading={isSubmitting}>
                Confirm
              </PrimaryButton>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
