import { useEffect, useState } from 'react'
import { Download, FileCheck2, Landmark, RefreshCw, Wallet } from 'lucide-react'
import clsx from 'clsx'
import { useReconciliationStore } from '../store/reconciliationStore'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ProgressRing from '../../../../components/common/ProgressRing'
import { PrimaryButton, GlassButton } from '../../../../components/common/Button'
import PaymentsPageHeader from '../components/PaymentsPageHeader'
import SectionHeader from '../components/SectionHeader'
import ReconciliationTable from '../components/ReconciliationTable'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { downloadTextFile } from '../../../../utils/downloadTextFile'

const TABS = [
  { key: 'matched', label: 'Matched' },
  { key: 'unmatched', label: 'Unmatched' },
  { key: 'duplicates', label: 'Duplicates' },
]

export default function PaymentReconciliation() {
  const status = useReconciliationStore((state) => state.status)
  const data = useReconciliationStore((state) => state.data)
  const error = useReconciliationStore((state) => state.error)
  const isReconciling = useReconciliationStore((state) => state.isReconciling)
  const fetchReconciliation = useReconciliationStore((state) => state.fetchReconciliation)
  const runAutoReconcile = useReconciliationStore((state) => state.runAutoReconcile)
  const resolveMatch = useReconciliationStore((state) => state.resolveMatch)

  const [activeTab, setActiveTab] = useState('matched')

  useEffect(() => {
    fetchReconciliation()
  }, [fetchReconciliation])

  function handleResolve(row) {
    resolveMatch({ id: row.id, record: { transactionId: row.transactionId, studentName: row.studentName, gatewayAmount: row.gatewayAmount, ledgerAmount: row.gatewayAmount, date: row.date } })
  }

  function handleExportReport() {
    if (!data) return
    downloadTextFile(
      'reconciliation-report.csv',
      [
        'Category,Transaction ID,Student,Gateway Amount,Ledger Amount,Date',
        ...data.matched.map((row) => `Matched,${row.transactionId},${row.studentName},${row.gatewayAmount},${row.ledgerAmount},${row.date}`),
        ...data.unmatched.map((row) => `Unmatched,${row.transactionId},${row.studentName},${row.gatewayAmount},${row.ledgerAmount},${row.date}`),
        ...data.duplicates.map((row) => `Duplicate,${row.transactionId},${row.studentName},${row.gatewayAmount},${row.ledgerAmount},${row.date}`),
      ].join('\n'),
    )
  }

  function handleAuditReport() {
    if (!data) return
    downloadTextFile(
      'reconciliation-audit-report.txt',
      [
        'AGESIS Payment Reconciliation — Audit Report',
        `Gateway Total: ${formatCurrency(data.gatewaySummary.total)} (${data.gatewaySummary.transactionCount} transactions)`,
        `School Ledger Total: ${formatCurrency(data.ledgerSummary.total)} (${data.ledgerSummary.transactionCount} transactions)`,
        `Reconciliation Progress: ${data.progressPercent}%`,
        `Settlement Status: ${data.gatewaySummary.settlementStatus}`,
        `Matched: ${data.matched.length} · Unmatched: ${data.unmatched.length} · Duplicates: ${data.duplicates.length}`,
      ].join('\n'),
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PaymentsPageHeader
        pageTitle="Payment Reconciliation"
        extraControls={
          <>
            <GlassButton icon={FileCheck2} onClick={handleAuditReport}>
              Audit Report
            </GlassButton>
            <GlassButton icon={Download} onClick={handleExportReport}>
              Export Report
            </GlassButton>
          </>
        }
      />

      {status === 'error' && <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load reconciliation data. {error}</p>}

      {(status === 'loading' || status === 'idle') && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      )}

      {status === 'success' && data && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                <Landmark className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(data.gatewaySummary.total)}</p>
              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">Gateway Summary</p>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                {data.gatewaySummary.transactionCount} transactions · <Badge variant="success">{data.gatewaySummary.settlementStatus}</Badge>
              </p>
            </div>

            <div className="rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                <Wallet className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(data.ledgerSummary.total)}</p>
              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">School Ledger</p>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{data.ledgerSummary.transactionCount} transactions</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]">
              <ProgressRing percent={data.progressPercent} label="Reconciled" size={104} />
              <PrimaryButton fullWidth={false} isLoading={isReconciling} onClick={runAutoReconcile}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Auto Reconcile
              </PrimaryButton>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
            <SectionHeader title="Reconciliation Detail" />

            <div className="mb-4 flex flex-wrap gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  aria-pressed={activeTab === tab.key}
                  className={clsx(
                    'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ease-premium',
                    activeTab === tab.key
                      ? 'bg-brand-600 text-white shadow-clay-button'
                      : 'border border-white/40 bg-white/40 text-slate-600 hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.07]',
                  )}
                >
                  {tab.label} ({data[tab.key].length})
                </button>
              ))}
            </div>

            <ReconciliationTable
              rows={data[activeTab]}
              variant={activeTab === 'duplicates' ? 'duplicate' : activeTab}
              onResolve={handleResolve}
              emptyMessage={`No ${activeTab} transactions.`}
            />
          </div>
        </>
      )}
    </div>
  )
}
