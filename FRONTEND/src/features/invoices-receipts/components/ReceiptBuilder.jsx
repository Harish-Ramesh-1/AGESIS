import { useMemo, useState } from 'react'
import { FileCheck2, Plus, Trash2 } from 'lucide-react'
import { useReceiptGeneratorStore } from '../store/receiptGeneratorStore'
import InputField from '../../../components/common/Input'
import { PrimaryButton } from '../../../components/common/Button'
import SectionHeader from './SectionHeader'
import ReceiptPreview from './ReceiptPreview'
import { ACCOUNTANT_NAME } from '../services/documentsService'
import { formatCurrency } from '../../../utils/formatCurrency'

const PAYMENT_METHODS = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cheque', 'Demand Draft', 'Wallet']

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

const today = new Date().toISOString().slice(0, 10)

let rowCounter = 0
function withRowId(item) {
  rowCounter += 1
  return { ...item, rowId: `receipt-row-${rowCounter}` }
}

export default function ReceiptBuilder({ student }) {
  const submitReceipt = useReceiptGeneratorStore((state) => state.submitReceipt)
  const isSubmitting = useReceiptGeneratorStore((state) => state.isSubmitting)
  const lastReceipt = useReceiptGeneratorStore((state) => state.lastReceipt)

  const [paymentDate, setPaymentDate] = useState(today)
  const [transactionId, setTransactionId] = useState(`TXN-${Math.floor(60000 + Math.random() * 900)}`)
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0])
  const [feeComponents, setFeeComponents] = useState(() => student.feeComponents.map((item) => withRowId(item)))
  const [paidAmount, setPaidAmount] = useState(
    student.pendingAmount ? String(student.pendingAmount) : student.feeComponents.reduce((sum, item) => sum + item.amount, 0) ? String(student.feeComponents.reduce((sum, item) => sum + item.amount, 0)) : '',
  )
  const [balanceAmount, setBalanceAmount] = useState('0')
  const [remarks, setRemarks] = useState('')

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
  const canGenerate = Number(paidAmount || 0) > 0

  const draftReceipt = useMemo(
    () => ({
      studentName: student.name,
      registrationNumber: student.registrationNumber,
      transactionId,
      paymentDate,
      paymentMethod,
      feeComponents: cleanComponents,
      paidAmount: Number(paidAmount || 0),
      balanceAmount: Number(balanceAmount || 0),
      remarks,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [student, transactionId, paymentDate, paymentMethod, feeComponents, paidAmount, balanceAmount, remarks],
  )

  async function handleGenerate() {
    if (!canGenerate) return
    await submitReceipt({ ...draftReceipt, studentId: student.id })
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Receipt Generator" description="Receipt number is generated automatically" />

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
              <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-300/70">No pending balance on record for this student.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Receipt Date" type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} />
            <InputField label="Transaction Reference" value={transactionId} onChange={(event) => setTransactionId(event.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Collected By</label>
              <input value={ACCOUNTANT_NAME} disabled className={selectClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Payment Method</label>
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className={selectClass}>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200">Fee Components (optional breakdown)</p>
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
                    aria-label="Remove fee component"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
              {feeComponents.length === 0 && <p className="text-xs text-slate-400 dark:text-slate-500">No line-item breakdown added — the receipt will just show the paid amount below.</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Amount Paid" type="number" min="0" value={paidAmount} onChange={(event) => setPaidAmount(event.target.value)} placeholder="Exact amount received" required />
            <InputField label="Balance Amount" type="number" min="0" value={balanceAmount} onChange={(event) => setBalanceAmount(event.target.value)} placeholder="0 if fully paid" />
          </div>
          {!canGenerate && <p className="text-xs text-amber-600 dark:text-amber-400">Enter the exact amount paid to continue.</p>}

          <InputField label="Remarks" value={remarks} onChange={(event) => setRemarks(event.target.value)} placeholder="Optional notes for this receipt" />

          <PrimaryButton fullWidth={false} onClick={handleGenerate} isLoading={isSubmitting} disabled={!canGenerate}>
            <FileCheck2 className="h-4 w-4" aria-hidden="true" />
            Generate Receipt
          </PrimaryButton>
        </div>
      </div>

      <div>
        <SectionHeader title="Receipt Preview" description="Live preview of the document" />
        <ReceiptPreview
          receipt={lastReceipt ?? draftReceipt}
          studentMeta={student.className || student.section ? `Class ${student.className}-${student.section}` : undefined}
          showActions={Boolean(lastReceipt)}
        />
      </div>
    </div>
  )
}
