import { Download } from 'lucide-react'
import { usePaymentsStore } from '../../../../store/paymentsStore'
import DataTable from '../../../../components/common/DataTable/DataTable'
import Badge from '../../../../components/common/Badge/Badge'
import Skeleton from '../../../../components/common/Skeleton/Skeleton'
import DashboardCard from './DashboardCard'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { formatDate } from '../../../../utils/formatDate'
import { downloadTextFile } from '../../../../utils/downloadTextFile'

const STATUS_VARIANT = { success: 'success', failed: 'danger' }

export default function TransactionTable() {
  const status = usePaymentsStore((state) => state.status)
  const data = usePaymentsStore((state) => state.data)

  if (status === 'loading' || status === 'idle') {
    return (
      <DashboardCard title="Recent Transactions">
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10" />
          ))}
        </div>
      </DashboardCard>
    )
  }

  if (status === 'error' || !data) {
    return (
      <DashboardCard title="Recent Transactions">
        <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load transactions.</p>
      </DashboardCard>
    )
  }

  const columns = [
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    { key: 'id', header: 'Transaction ID' },
    { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'method', header: 'Method' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status]}>{row.status === 'success' ? 'Success' : 'Failed'}</Badge>
      ),
    },
    {
      key: 'receipt',
      header: 'Receipt',
      render: (row) => (
        <button
          type="button"
          aria-label={`Download receipt for ${row.id}`}
          onClick={() =>
            downloadTextFile(
              `${row.id}.txt`,
              `Receipt\n${row.id}\nDate: ${formatDate(row.date)}\nAmount: ${formatCurrency(row.amount)}\nMethod: ${row.method}\nStatus: ${row.status}`,
            )
          }
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 ease-premium hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
        </button>
      ),
    },
  ]

  return (
    <DashboardCard title="Recent Transactions" description="Your latest 5 payment records">
      <DataTable columns={columns} rows={data.transactions.slice(0, 5)} emptyMessage="No transactions yet." />
    </DashboardCard>
  )
}
