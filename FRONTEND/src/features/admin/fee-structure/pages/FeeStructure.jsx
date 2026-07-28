import { useEffect, useMemo, useState } from 'react'
import { Archive, CheckCircle2, LayoutGrid, ListTree, Plus, Wallet2 } from 'lucide-react'
import { useFeeStructureStore } from '../store/feeStructureStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import SummaryCard from '../components/SummaryCard'
import ConfigTable from '../components/ConfigTable'
import StructureFormModal from '../components/StructureFormModal'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { GlassButton } from '../../../../components/common/Button'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { FEE_HEAD_KEYS, FEE_HEAD_LABEL, STRUCTURE_STATUS_LABEL, STRUCTURE_STATUS_VARIANT } from '../utils/feeStructureUtils'

export default function FeeStructure() {
  const status = useFeeStructureStore((state) => state.status)
  const error = useFeeStructureStore((state) => state.error)
  const structures = useFeeStructureStore((state) => state.structures)
  const fetchStructures = useFeeStructureStore((state) => state.fetchStructures)
  const setStatus = useFeeStructureStore((state) => state.setStatus)

  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchStructures()
  }, [fetchStructures])

  const summary = useMemo(() => {
    const totalPlans = structures.length
    const activePlans = structures.filter((row) => row.status === 'active').length
    const classesCovered = new Set(structures.map((row) => row.classRange)).size
    const avgAnnualFee = totalPlans > 0 ? Math.round(structures.reduce((sum, row) => sum + row.totalAnnualFee, 0) / totalPlans) : 0
    return { totalPlans, activePlans, classesCovered, avgAnnualFee }
  }, [structures])

  const columns = [
    { key: 'name', header: 'Structure Name', render: (row) => <span className="font-medium text-slate-800 dark:text-slate-100">{row.name}</span> },
    { key: 'classRange', header: 'Class Range' },
    { key: 'academicYear', header: 'Academic Year' },
    ...FEE_HEAD_KEYS.map((key) => ({ key, header: FEE_HEAD_LABEL[key], render: (row) => formatCurrency(row.amounts[key]) })),
    { key: 'totalAnnualFee', header: 'Total Annual Fee', render: (row) => <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(row.totalAnnualFee)}</span> },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={STRUCTURE_STATUS_VARIANT[row.status]}>{STRUCTURE_STATUS_LABEL[row.status]}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.status === 'draft' && (
            <button
              type="button"
              onClick={() => setStatus(row.id, 'active')}
              aria-label={`Publish ${row.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-emerald-600 dark:text-slate-400 dark:hover:bg-white/10"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          {row.status === 'active' && (
            <button
              type="button"
              onClick={() => setStatus(row.id, 'archived')}
              aria-label={`Archive ${row.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10"
            >
              <Archive className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple
        title="Fee Structure Management"
        extraControls={
          <GlassButton icon={Plus} onClick={() => setIsModalOpen(true)}>
            Add New Structure
          </GlassButton>
        }
      />

      <div aria-live="polite" className="sr-only">
        {structures.length} fee structure templates configured institution-wide.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={ListTree} label="Total Structures" value={summary.totalPlans} status={status} />
        <SummaryCard icon={CheckCircle2} label="Active Structures" value={summary.activePlans} status={status} />
        <SummaryCard icon={LayoutGrid} label="Class Bands Covered" value={summary.classesCovered} status={status} />
        <SummaryCard icon={Wallet2} label="Avg. Annual Fee" value={formatCurrency(summary.avgAnnualFee)} status={status} />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Institution-Wide Fee Structures</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">This is the master policy that accountants use to assign fees to students by class.</p>
        </div>
        {status === 'error' ? (
          <ErrorState message={error} onRetry={fetchStructures} />
        ) : status === 'loading' || status === 'idle' ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : (
          <ConfigTable
            columns={columns}
            rows={structures}
            keyField="id"
            titleKey="name"
            subtitleKey="classRange"
            trailingKey="totalAnnualFee"
            emptyMessage="No fee structures configured yet. Add one to get started."
          />
        )}
      </div>

      {isModalOpen && <StructureFormModal onClose={() => setIsModalOpen(false)} />}
    </div>
  )
}
