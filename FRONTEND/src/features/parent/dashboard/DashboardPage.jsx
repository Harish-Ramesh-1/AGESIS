import HeroCard from './components/HeroCard'
import FeeSummaryGrid from './components/FeeSummaryGrid'
import PaymentProgress from './components/PaymentProgress'
import UpcomingDueCard from './components/UpcomingDueCard'
import QuickActions from './components/QuickActions'
import TransactionTable from './components/TransactionTable'
import NotificationPanel from './components/NotificationPanel'
import FeeBreakdownCard from './components/FeeBreakdownCard'
import MonthlyAnalyticsCard from './components/MonthlyAnalyticsCard'
import RewardsCard from './components/RewardsCard'
import DocumentsCard from './components/DocumentsCard'
import AnnouncementTimeline from './components/AnnouncementTimeline'
import SupportCard from './components/SupportCard'

const FULL = 'col-span-4 md:col-span-8 lg:col-span-12'
const HALF = 'col-span-4 md:col-span-4 lg:col-span-6'

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-4 gap-5 md:grid-cols-8 lg:grid-cols-12 lg:gap-6">
      <div className={FULL}>
        <HeroCard />
      </div>

      <div className={FULL}>
        <FeeSummaryGrid />
      </div>

      <div className="col-span-4 md:col-span-4 lg:col-span-7">
        <PaymentProgress />
      </div>
      <div className="col-span-4 md:col-span-4 lg:col-span-5">
        <UpcomingDueCard />
      </div>

      <div className={FULL}>
        <QuickActions />
      </div>

      <div className="col-span-4 md:col-span-8 lg:col-span-8">
        <TransactionTable />
      </div>
      <div className="col-span-4 md:col-span-8 lg:col-span-4">
        <NotificationPanel />
      </div>

      <div className={HALF}>
        <FeeBreakdownCard />
      </div>
      <div className={HALF}>
        <MonthlyAnalyticsCard />
      </div>

      <div className={HALF}>
        <RewardsCard />
      </div>
      <div className={HALF}>
        <DocumentsCard />
      </div>

      <div className="col-span-4 md:col-span-8 lg:col-span-7">
        <AnnouncementTimeline />
      </div>
      <div className="col-span-4 md:col-span-8 lg:col-span-5">
        <SupportCard />
      </div>
    </div>
  )
}
