import { useEffect, useMemo, useState } from 'react'
import { Archive, CheckCircle2, LayoutGrid, ListTree, Plus, Wallet2 } from 'lucide-react'
import { useFeeStructureConfigStore } from '../store/feeStructureConfigStore'
import FeeConfigPageHeader from '../components/FeeConfigPageHeader'
import SummaryCard from '../components/SummaryCard'
import ConfigTable from '../components/ConfigTable'
import StructureBuilderModal from '../components/StructureBuilderModal'
import Badge from '../../../components/common/Badge'
import Skeleton from '../../../components/common/Skeleton'
import ErrorState from '../../../components/common/ErrorState'
import { GlassButton } from '../../../components/common/Button'
import { formatCurrency } from '../../../utils/formatCurrency'
import { downloadCsv } from '../utils/exportUtils'
import { STRUCTURE_STATUS_LABEL, STRUCTURE_STATUS_VARIANT } from '../utils/feeConfigUtils'

export default function FeeStructure() {
  const status = useFeeStructureConfigStore((state) => state.status)
  const error = useFeeStructureConfigStore((state) => state.error)
  const structures = useFeeStructureConfigStore((state) => state.structures)
  const fetchStructures = useFeeStructureConfigStore((state) => state.fetchStructures)
  const setStructureStatus = useFeeStructureConfigStore((state) => state.setStructureStatus)

  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchStructures()
  }, [fetchStructures])

  const summary = useMemo(() => {
    const totalTemplates = structures.length
    const activeTemplates = structures.filter((row) => row.status === 'active').length
    const coveredClasses = new Set()
    structures.forEach((row) => {
      for (let cls = row.classStart; cls <= row.classEnd; cls += 1) coveredClasses.add(cls)
    })
    const avgAnnualFee = totalTemplates > 0 ? Math.round(structures.reduce((sum, row) => sum + row.totalAnnualFee, 0) / totalTemplates) : 0
    return { totalTemplates, activeTemplates, classesCovered: coveredClasses.size, avgAnnualFee }
  }, [structures])

  function handleExport() {
    downloadCsv(
      'fee-structure-templates.csv',
      ['Template Name', 'Class Range', 'Academic Year', 'Total Annual Fee', 'Components', 'Status'],
      structures.map((row) => [row.name, row.classRange, row.academicYear, row.totalAnnualFee, row.componentCount, STRUCTURE_STATUS_LABEL[row.status]]),
    )
  }

  const columns = [
    { key: 'name', header: 'Template Name', render: (row) => <span className="font-medium text-slate-800 dark:text-slate-100">{row.name}</span> },
    { key: 'classRange', header: 'Class Range' },
    { key: 'academicYear', header: 'Academic Year' },
    { key: 'totalAnnualFee', header: 'Total Annual Fee', render: (row) => formatCurrency(row.totalAnnualFee) },
    { key: 'componentCount', header: 'Components', render: (row) => `${row.componentCount} items` },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={STRUCTURE_STATUS_VARIANT[row.status]}>{STRUCTURE_STATUS_LABEL[row.status]}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.status === 'draft' && (
            <button
              type="button"
              onClick={() => setStructureStatus(row.id, 'active')}
              aria-label={`Publish ${row.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-emerald-600 dark:text-slate-400 dark:hover:bg-white/10"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          {row.status === 'active' && (
            <button
              type="button"
              onClick={() => setStructureStatus(row.id, 'archived')}
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
      <FeeConfigPageHeader
        pageTitle="Fee Structure"
        onExport={handleExport}
        extraControls={
          <GlassButton icon={Plus} onClick={() => setIsModalOpen(true)}>
            Create Fee Structure
          </GlassButton>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={ListTree} label="Total Templates" value={summary.totalTemplates} status={status} />
        <SummaryCard icon={CheckCircle2} label="Active Templates" value={summary.activeTemplates} status={status} />
        <SummaryCard icon={LayoutGrid} label="Classes Covered" value={summary.classesCovered} status={status} />
        <SummaryCard icon={Wallet2} label="Avg. Annual Fee" value={formatCurrency(summary.avgAnnualFee)} status={status} />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Fee Structure Templates</h2>
        {status === 'error' ? (
          <ErrorState message={error} onRetry={fetchStructures} />
        ) : status === 'loading' || status === 'idle' ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
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
            emptyMessage="No fee structure templates yet. Create one to get started."
          />
        )}
      </div>

      {isModalOpen && <StructureBuilderModal onClose={() => setIsModalOpen(false)} />}
    </div>
  )
}
