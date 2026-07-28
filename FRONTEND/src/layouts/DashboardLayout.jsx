import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import BottomNavBar from '../components/layout/BottomNav'
import Navbar from '../components/layout/Navbar'
import useLocalStorage from '../hooks/useLocalStorage'
import { PARENT_NAV_SECTIONS, getPageTitle } from '../features/parent/navigation'
import agesisLogo from '../assets/logos/agesis-logo.svg'

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useLocalStorage('agesis-sidebar-collapsed', true)
  const location = useLocation()

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-brand-400/20 blur-[110px] dark:bg-brand-500/15" />
        <div className="absolute -bottom-40 left-1/3 h-[26rem] w-[26rem] rounded-full bg-emerald-300/15 blur-[110px] dark:bg-emerald-500/10" />
        <div className="absolute -right-24 top-1/2 h-[24rem] w-[24rem] rounded-full bg-violet-300/20 blur-[110px] dark:bg-violet-500/10" />
      </div>

      {/* Desktop/tablet: floating sidebar. Mobile: bottom app-style nav below. */}
      <Sidebar
        navSections={PARENT_NAV_SECTIONS}
        schoolName="AGESIS"
        schoolTagline="Agesis International School"
        logoSrc={agesisLogo}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        onCollapseSidebar={() => setIsCollapsed(true)}
      />

      {/*
        Left offset stays fixed at the collapsed-sidebar footprint regardless of
        isCollapsed, so toggling the sidebar resizes the floating panel only —
        the page behind it never reflows. When expanded, the sidebar floats over
        this content instead of pushing it (its glass blur keeps content legible).
      */}
      <div className="relative flex min-h-screen flex-col md:pl-[120px]">
        <main className="flex-1 p-4 pb-24 sm:p-6 md:pb-6 lg:p-8">
          <Navbar title={getPageTitle(location.pathname)} />
          <Outlet />
        </main>
      </div>

      <BottomNavBar navSections={PARENT_NAV_SECTIONS} />
    </div>
  )
}
