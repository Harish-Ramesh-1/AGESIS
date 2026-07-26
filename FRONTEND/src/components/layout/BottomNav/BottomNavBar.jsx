import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutGrid } from 'lucide-react'
import clsx from 'clsx'
import { NAV_ICONS } from '../Sidebar/navIcons'
import { isGroupActive } from '../navUtils'
import MobileNavSheet from './MobileNavSheet'
import MoreMenuList from './MoreMenuList'
import SidebarItem from '../Sidebar/SidebarItem'

const PRIMARY_TAB_COUNT = 3
const TAB_CLASSES = 'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors duration-200 ease-premium'

function TabContent({ Icon, label, isActive }) {
  return (
    <>
      <Icon
        className={clsx('h-5 w-5', isActive ? 'text-brand-600 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400')}
        aria-hidden="true"
      />
      <span className={isActive ? 'text-brand-600 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400'}>
        {label}
      </span>
    </>
  )
}

export default function BottomNavBar({ navSections }) {
  const location = useLocation()
  const [openSheet, setOpenSheet] = useState(null)

  const primarySections = navSections.slice(0, PRIMARY_TAB_COUNT)
  const overflowSections = navSections.slice(PRIMARY_TAB_COUNT)

  function isSectionActive(section) {
    return section.type === 'group' ? isGroupActive(section, location.pathname) : location.pathname === section.path
  }

  const isMoreActive = overflowSections.some(isSectionActive)
  const activeGroupSection = primarySections.find((section) => section.id === openSheet)

  function closeSheet() {
    setOpenSheet(null)
  }

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 flex items-stretch justify-around overflow-hidden rounded-clay border border-white/50 bg-white/30 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06] md:hidden"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
        />
        {primarySections.map((section) => {
          const Icon = NAV_ICONS[section.icon]

          if (section.type === 'link') {
            return (
              <NavLink key={section.id} to={section.path} end className={TAB_CLASSES}>
                {({ isActive }) => <TabContent Icon={Icon} label={section.label} isActive={isActive} />}
              </NavLink>
            )
          }

          return (
            <button
              key={section.id}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={openSheet === section.id}
              onClick={() => setOpenSheet(section.id)}
              className={TAB_CLASSES}
            >
              <TabContent Icon={Icon} label={section.label} isActive={isSectionActive(section)} />
            </button>
          )
        })}

        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={openSheet === 'more'}
          onClick={() => setOpenSheet('more')}
          className={TAB_CLASSES}
        >
          <TabContent Icon={LayoutGrid} label="More" isActive={isMoreActive} />
        </button>
      </nav>

      <MobileNavSheet
        isOpen={Boolean(activeGroupSection)}
        onClose={closeSheet}
        title={activeGroupSection?.label ?? ''}
      >
        <ul className="flex flex-col gap-1">
          {activeGroupSection?.children.map((child) => (
            <li key={child.id}>
              <SidebarItem
                icon={child.icon}
                label={child.label}
                path={child.path}
                isCollapsed={false}
                onNavigate={closeSheet}
              />
            </li>
          ))}
        </ul>
      </MobileNavSheet>

      <MobileNavSheet isOpen={openSheet === 'more'} onClose={closeSheet} title="More">
        <MoreMenuList sections={overflowSections} onNavigate={closeSheet} />
      </MobileNavSheet>
    </>
  )
}
