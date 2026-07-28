import { useEffect } from 'react'
import { Download, Gauge, Target, TrendingUp, Trophy } from 'lucide-react'
import { useCollectionStore } from '../store/collectionStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import ReportsNav from '../components/ReportsNav'
import SectionHeader from '../components/SectionHeader'
import KPIGrid from '../components/KPIGrid'
import CollectionTrendChart from '../components/CollectionTrendChart'
import BarDonutChart from '../components/BarDonutChart'
import PaymentMethodChart from '../components/PaymentMethodChart'
import AnalyticsTable from '../components/AnalyticsTable'
import Skeleton from '../../../../components/common/Skeleton'
import { GlassButton } from '../../../../components/common/Button'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { downloadCsv } from '../utils/exportUtils'

function Heatmap({ heatmap }) {
  if (!heatmap) return <Skeleton className="h-56" />
  const maxValue = Math.max(...heatmap.values.flat())

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-separate border-spacing-1 text-center text-[11px]">
        <thead>
          <tr>
            <th />
            {heatmap.hours.map((hour) => (
              <th key={hour} className="pb-1 font-medium text-slate-400 dark:text-slate-500">
                {hour}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {heatmap.days.map((day, rowIndex) => (
            <tr key={day}>
              <td className="pr-2 text-right font-medium text-slate-400 dark:text-slate-500">{day}</td>
              {heatmap.values[rowIndex].map((value, colIndex) => (
                <td key={colIndex}>
                  <div
                    className="mx-auto flex h-8 w-10 items-center justify-center rounded-lg text-[10px] font-semibold text-white"
                    style={{ backgroundColor: `rgba(61, 82, 196, ${0.12 + (value / maxValue) * 0.78})` }}
                    title={`${day} ${heatmap.hours[colIndex]}: ${value} transactions`}
                  >
                    {value}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CollectionFunnel({ funnel }) {
  if (!funnel || funnel.length === 0) return <Skeleton className="h-56" />
  const maxCount = funnel[0].count

  return (
    <div className="flex flex-col gap-3">
      {funnel.map((stage) => (
        <div key={stage.stage}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700 dark:text-slate-200">{stage.stage}</span>
            <span className="text-slate-500 dark:text-slate-400">{stage.count}</span>
          </div>
          <div
            className="h-8 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 shadow-clay-button transition-[width] duration-700 ease-premium"
            style={{ width: `${(stage.count / maxCount) * 100}%` }}
          />
        </div>
      ))}
    </div>
  )
}

export default function CollectionAnalytics() {
  const status = useCollectionStore((state) => state.status)
  const data = useCollectionStore((state) => state.data)
  const error = useCollectionStore((state) => state.error)
  const fetchCollectionAnalytics = useCollectionStore((state) => state.fetchCollectionAnalytics)

  useEffect(() => {
    fetchCollectionAnalytics()
  }, [fetchCollectionAnalytics])

  function handleExport() {
    if (!data) return
    downloadCsv(
      'collection-analytics.csv',
      ['Class', 'Expected Revenue', 'Collected', 'Pending', 'Collection %'],
      data.table.map((row) => [row.className, row.expectedRevenue, row.collected, row.pending, row.collectionPercent]),
    )
  }

  const cards = [
    { icon: Gauge, label: 'Collection Efficiency', value: data && `${data.summary.collectionEfficiency}%` },
    { icon: TrendingUp, label: 'Recovery Rate', value: data && `${data.summary.recoveryRate}%` },
    { icon: Target, label: 'Target Achievement', value: data && `${data.summary.targetAchievement}%` },
    { icon: Gauge, label: 'Collection Ratio', value: data && data.summary.collectionRatio.toFixed(2) },
  ]

  const columns = [
    { key: 'className', header: 'Class' },
    { key: 'expectedRevenue', header: 'Expected Revenue', render: (row) => formatCurrency(row.expectedRevenue) },
    { key: 'collected', header: 'Collected', render: (row) => formatCurrency(row.collected) },
    { key: 'pending', header: 'Pending', render: (row) => formatCurrency(row.pending) },
    { key: 'collectionPercent', header: 'Collection %', render: (row) => `${row.collectionPercent}%` },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple
        title="Collection Analytics"
        extraControls={
          <GlassButton icon={Download} onClick={handleExport} disabled={!data}>
            Export
          </GlassButton>
        }
      />
      <ReportsNav />

      {status === 'error' && <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load collection analytics. {error}</p>}

      <KPIGrid cards={cards} status={status === 'success' ? 'success' : 'loading'} />

      <CollectionTrendChart trend={data?.trend} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BarDonutChart
          variant="bars"
          title="Collection Efficiency by Class"
          description="Collected as a percentage of expected revenue"
          data={data?.efficiencyByClass}
          nameKey="className"
          valueKey="collectionPercent"
          valueFormatter={(value) => `${value}%`}
        />
        <PaymentMethodChart title="Payment Method Split" description="Institution-wide method distribution" data={data?.paymentMethodSplit} nameKey="method" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
          <SectionHeader title="Revenue Heatmap" description="Transaction volume by day and hour" />
          <Heatmap heatmap={data?.heatmap} />
        </div>
        <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
          <SectionHeader title="Collection Funnel" description="From invoicing through to full collection" />
          <CollectionFunnel funnel={data?.funnel} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <BarDonutChart variant="bars" title="Class-wise Collection" data={data?.classWiseCollection} nameKey="className" valueKey="collected" />
        <BarDonutChart variant="bars" title="Wing Comparison" data={data?.departmentComparison} nameKey="department" valueKey="collected" />
        <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
          <SectionHeader title="Top Performing Classes" />
          {data ? (
            <ul className="flex flex-col gap-2.5">
              {data.topPerformingClasses.map((item, index) => (
                <li key={item.className} className="flex items-center gap-3 rounded-xl border border-white/40 bg-white/40 px-3.5 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-50 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    {index === 0 ? <Trophy className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{item.className}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.collectionPercent}%</span>
                </li>
              ))}
            </ul>
          ) : (
            <Skeleton className="h-40" />
          )}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Analytics Table" />
        <AnalyticsTable columns={columns} rows={data?.table ?? []} keyField="className" titleKey="className" trailingKey="collectionPercent" emptyMessage="No analytics data available." />
      </div>
    </div>
  )
}
