import { useState } from 'react'
import { X } from 'lucide-react'
import { PrimaryButton, SecondaryButton } from '../../../../components/common/Button'
import { useFeeCategoriesStore } from '../store/feeCategoriesStore'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function CategoryFormModal({ onClose }) {
  const addCategory = useFeeCategoriesStore((state) => state.addCategory)
  const isSaving = useFeeCategoriesStore((state) => state.isSaving)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [defaultAmount, setDefaultAmount] = useState('')
  const [taxable, setTaxable] = useState(false)
  const [formError, setFormError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    if (!name.trim()) {
      setFormError('Please enter a category name.')
      return
    }
    if (!description.trim()) {
      setFormError('Please add a short description for this category.')
      return
    }

    await addCategory({ name: name.trim(), description: description.trim(), defaultAmount, taxable })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add fee category"
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-clay border border-white/50 bg-white/95 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95"
      >
        <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4 dark:border-white/10">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Add Fee Category</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="thin-scrollbar flex-1 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="category-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Category Name
                </label>
                <input
                  id="category-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Examination"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="category-description" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Description
                </label>
                <textarea
                  id="category-description"
                  rows={2}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What does this fee head cover?"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="category-default-amount" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Default Amount (Rs.)
                </label>
                <input
                  id="category-default-amount"
                  type="number"
                  min="0"
                  value={defaultAmount}
                  onChange={(event) => setDefaultAmount(event.target.value)}
                  placeholder="e.g. 2000"
                  className={inputClass}
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={taxable}
                  onChange={(event) => setTaxable(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus-visible:outline-brand-500 dark:border-white/20"
                />
                This category is taxable
              </label>
            </div>

            {formError && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{formError}</p>}
          </div>

          <div className="flex gap-3 border-t border-slate-200/70 px-6 py-4 dark:border-white/10">
            <SecondaryButton fullWidth={false} type="button" onClick={onClose}>
              Cancel
            </SecondaryButton>
            <PrimaryButton fullWidth={false} type="submit" isLoading={isSaving}>
              Add Category
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  )
}
