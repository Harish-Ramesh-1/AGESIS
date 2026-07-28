import { useEffect, useMemo, useState } from 'react'
import { Percent, Plus, Tags, ToggleLeft, ToggleRight, Wallet2 } from 'lucide-react'
import { useFeeCategoriesStore } from '../store/feeCategoriesStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import SummaryCard from '../components/SummaryCard'
import ConfigTable from '../components/ConfigTable'
import CategoryFormModal from '../components/CategoryFormModal'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { GlassButton } from '../../../../components/common/Button'
import { formatCurrency } from '../../../../utils/formatCurrency'

export default function FeeCategories() {
  const status = useFeeCategoriesStore((state) => state.status)
  const error = useFeeCategoriesStore((state) => state.error)
  const categories = useFeeCategoriesStore((state) => state.categories)
  const fetchCategories = useFeeCategoriesStore((state) => state.fetchCategories)
  const actioningId = useFeeCategoriesStore((state) => state.actioningId)
  const toggleTaxable = useFeeCategoriesStore((state) => state.toggleTaxable)

  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const summary = useMemo(() => {
    const totalCategories = categories.length
    const taxableCategories = categories.filter((row) => row.taxable).length
    const avgDefaultAmount = totalCategories > 0 ? Math.round(categories.reduce((sum, row) => sum + row.defaultAmount, 0) / totalCategories) : 0
    return { totalCategories, taxableCategories, avgDefaultAmount }
  }, [categories])

  const columns = [
    { key: 'name', header: 'Category Name', render: (row) => <span className="font-medium text-slate-800 dark:text-slate-100">{row.name}</span> },
    { key: 'description', header: 'Description' },
    { key: 'defaultAmount', header: 'Default Amount', render: (row) => formatCurrency(row.defaultAmount) },
    {
      key: 'taxable',
      header: 'Taxable',
      render: (row) => <Badge variant={row.taxable ? 'info' : 'neutral'}>{row.taxable ? 'Taxable' : 'Not Taxable'}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button
          type="button"
          onClick={() => toggleTaxable(row.id)}
          disabled={actioningId === row.id}
          aria-label={row.taxable ? `Mark ${row.name} as not taxable` : `Mark ${row.name} as taxable`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-white/10"
        >
          {row.taxable ? <ToggleRight className="h-5 w-5 text-brand-600 dark:text-brand-300" aria-hidden="true" /> : <ToggleLeft className="h-5 w-5" aria-hidden="true" />}
        </button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple
        title="Fee Categories"
        extraControls={
          <GlassButton icon={Plus} onClick={() => setIsModalOpen(true)}>
            Add Category
          </GlassButton>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard icon={Tags} label="Total Categories" value={summary.totalCategories} status={status} />
        <SummaryCard icon={Percent} label="Taxable Categories" value={summary.taxableCategories} status={status} />
        <SummaryCard icon={Wallet2} label="Avg. Default Amount" value={formatCurrency(summary.avgDefaultAmount)} status={status} />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Master Fee Category List</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            The institution-wide list of fee heads available when building fee structures and receipts.
          </p>
        </div>
        {status === 'error' ? (
          <ErrorState message={error} onRetry={fetchCategories} />
        ) : status === 'loading' || status === 'idle' ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : (
          <ConfigTable
            columns={columns}
            rows={categories}
            keyField="id"
            titleKey="name"
            subtitleKey="description"
            trailingKey="defaultAmount"
            emptyMessage="No fee categories configured yet."
          />
        )}
      </div>

      {isModalOpen && <CategoryFormModal onClose={() => setIsModalOpen(false)} />}
    </div>
  )
}
