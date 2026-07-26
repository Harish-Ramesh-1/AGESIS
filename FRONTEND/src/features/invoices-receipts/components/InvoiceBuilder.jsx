import { useMemo, useState } from 'react'
import { FileCheck2, Plus, Save, Trash2 } from 'lucide-react'
import { useInvoiceGeneratorStore } from '../store/invoiceGeneratorStore'
import InputField from '../../../components/common/Input'
import { PrimaryButton, SecondaryButton } from '../../../components/common/Button'
import SectionHeader from './SectionHeader'
import InvoicePreview from './InvoicePreview'
import { formatCurrency } from '../../../utils/formatCurrency'

const today = new Date().toISOString().slice(0, 10)

function defaultDueDate() {
  const date = new Date()
  date.setDate(date.getDate() + 14)
  return date.toISOString().slice(0, 10)
}

let rowCounter = 0
function withRowId(item) {
  rowCounter += 1
  return { ...item, rowId: `row-${rowCounter}` }
}

export default function InvoiceBuilder({ student }) {
  const submitInvoice = useInvoiceGeneratorStore((state) => state.submitInvoice)
  const isSubmitting = useInvoiceGeneratorStore((state) => state.isSubmitting)
  const lastInvoice = useInvoiceGeneratorStore((state) => state.lastInvoice)

  const [invoiceDate, setInvoiceDate] = useState(today)
  const [dueDate, setDueDate] = useState(defaultDueDate())
  const [feeComponents, setFeeComponents] = useState(() => student.feeComponents.map((item) => withRowId(item)))
  const [discount, setDiscount] = useState('0')
  const [scholarship, setScholarship] = useState('0')
  const [lateFee, setLateFee] = useState('0')
  const [tax, setTax] = useState('0')
  const [notes, setNotes] = useState('')

  function updateComponent(rowId, patch) {
    setFeeComponents((prev) => prev.map((item) => (item.rowId === rowId ? { ...item, ...patch } : item)))
  }

  function addComponent() {
    setFeeComponents((prev) => [...prev, withRowId({ label: '', amount: 0 })])
  }

  function removeComponent(rowId) {
    setFeeComponents((prev) => prev.filter((item) => item.rowId !== rowId))
  }

  const cleanComponents = feeComponents.filter((item) => item.label.trim() && item.amount > 0).map(({ label, amount }) => ({ label: label.trim(), amount }))

  const draftInvoice = useMemo(
    () => ({
      studentName: student.name,
      registrationNumber: student.registrationNumber,
      className: student.className || student.section ? `${student.className}-${student.section}` : '—',
      academicYear: student.academicYear,
      invoiceDate,
      dueDate,
      feeComponents: cleanComponents.length > 0 ? cleanComponents : [{ label: 'Fee Payment', amount: 0 }],
      discount: Number(discount || 0),
      scholarship: Number(scholarship || 0),
      lateFee: Number(lateFee || 0),
      tax: Number(tax || 0),
      notes,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [student, invoiceDate, dueDate, feeComponents, discount, scholarship, lateFee, tax, notes],
  )

  const total = cleanComponents.reduce((sum, item) => sum + item.amount, 0) - draftInvoice.discount - draftInvoice.scholarship + draftInvoice.lateFee + draftInvoice.tax
  const canGenerate = cleanComponents.length > 0

  async function handleGenerate(isDraft) {
    if (!canGenerate) return
    await submitInvoice({ ...draftInvoice, studentId: student.id, totalAmount: total, isDraft })
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Invoice Builder" description={`Invoice number is generated automatically · Academic Year ${student.academicYear}`} />

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 p-4 dark:border-amber-500/20 dark:bg-amber-500/[0.08]">
            <p className="text-xs text-amber-700 dark:text-amber-300">Pending Fee for This Student</p>
            <p className="mt-0.5 text-xl font-bold text-amber-800 dark:text-amber-200">{formatCurrency(student.pendingAmount || 0)}</p>
            {student.pendingAmount > 0 && student.feeComponents.length > 0 ? (
              <ul className="mt-2 flex flex-col gap-1 border-t border-amber-200/60 pt-2 text-xs dark:border-amber-500/20">
                {student.feeComponents.map((item) => (
                  <li key={item.label} className="flex items-center justify-between text-amber-800 dark:text-amber-200">
                    <span>{item.label}</span>
                    <span className="font-medium">{formatCurrency(item.amount)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-300/70">
                No pending balance on record — use the fee components below to bill this invoice.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Invoice Date" type="date" value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} />
            <InputField label="Due Date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200">Fee Components</p>
              <button type="button" onClick={addComponent} className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add Component
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {feeComponents.map((item) => (
                <div key={item.rowId} className="flex items-center gap-2 rounded-xl border border-white/40 bg-white/40 px-3.5 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(event) => updateComponent(item.rowId, { label: event.target.value })}
                    placeholder="Fee component name"
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1.5 text-sm text-slate-900 shadow-clay-inset focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
                  />
                  <input
                    type="number"
                    min="0"
                    value={item.amount}
                    onChange={(event) => updateComponent(item.rowId, { amount: Number(event.target.value) })}
                    className="w-28 rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1.5 text-right text-sm text-slate-900 shadow-clay-inset focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => removeComponent(item.rowId)}
                    disabled={feeComponents.length === 1}
                    aria-label="Remove fee component"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
            {!canGenerate && <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">Add at least one fee component with a name and an amount greater than zero.</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Discount" type="number" min="0" value={discount} onChange={(event) => setDiscount(event.target.value)} />
            <InputField label="Scholarship" type="number" min="0" value={scholarship} onChange={(event) => setScholarship(event.target.value)} />
            <InputField label="Late Fee" type="number" min="0" value={lateFee} onChange={(event) => setLateFee(event.target.value)} />
            <InputField label="Tax" type="number" min="0" value={tax} onChange={(event) => setTax(event.target.value)} />
          </div>

          <InputField label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional notes printed on the invoice" />

          <div className="rounded-xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Total Payable</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(total)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <SecondaryButton fullWidth={false} onClick={() => handleGenerate(true)} isLoading={isSubmitting} disabled={!canGenerate}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Save Draft
            </SecondaryButton>
            <PrimaryButton fullWidth={false} onClick={() => handleGenerate(false)} isLoading={isSubmitting} disabled={!canGenerate}>
              <FileCheck2 className="h-4 w-4" aria-hidden="true" />
              Generate Invoice
            </PrimaryButton>
          </div>
        </div>
      </div>

      <div>
        <SectionHeader title="Invoice Preview" description="Live preview of the document" />
        <InvoicePreview invoice={lastInvoice ?? draftInvoice} showActions={Boolean(lastInvoice)} />
      </div>
    </div>
  )
}
