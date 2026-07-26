import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import clsx from 'clsx'
import useLocalStorage from '../../../hooks/useLocalStorage'
import { isGroupActive } from '../navUtils'
import SidebarHeader from './SidebarHeader'
import SidebarItem from './SidebarItem'
import SidebarGroup from './SidebarGroup'
import SidebarFooter from './SidebarFooter'

export default function Sidebar({
  navSections,
  schoolName,
  schoolTagline,
  logoSrc,
  isCollapsed,
  onToggleCollapse,
  onCollapseSidebar,
  ariaLabel = 'Parent portal navigation',
}) {
  const location = useLocation()
  const [expandedGroups, setExpandedGroups] = useLocalStorage('agesis-sidebar-expanded-groups', [])
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    navSections.forEach((section) => {
      if (section.type === 'group' && isGroupActive(section, location.pathname)) {
        setExpandedGroups((prev) => (prev.includes(section.id) ? prev : [...prev, section.id]))
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  const effectiveCollapsed = isCollapsed && !isHovering

  function toggleGroup(id) {
    setExpandedGroups((prev) => (prev.includes(id) ? prev.filter((groupId) => groupId !== id) : [...prev, id]))
  }

  function handleRequestExpandSidebar() {
    if (isCollapsed) onToggleCollapse()
  }

  function handleItemSelect() {
    setIsHovering(false)
    onCollapseSidebar()
  }

  return (
    <aside
      aria-label={ariaLabel}
      onMouseEnter={() => isCollapsed && setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={clsx(
        'fixed left-4 top-4 z-50 hidden max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-clay border border-white/50 bg-white/30 shadow-glass backdrop-blur-2xl transition-[width] duration-300 ease-premium dark:border-white/10 dark:bg-white/[0.06] md:flex',
        effectiveCollapsed ? 'w-[88px]' : 'w-[280px]',
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
      />
      <SidebarHeader
        logoSrc={logoSrc}
        schoolName={schoolName}
        schoolTagline={schoolTagline}
        isCollapsed={effectiveCollapsed}
      />

      <nav className="thin-scrollbar overflow-y-auto px-3 py-3">
        <ul className="flex flex-col gap-1">
          {navSections.map((section) => (
            <li key={section.id}>
              {section.type === 'link' ? (
                <SidebarItem
                  icon={section.icon}
                  label={section.label}
                  path={section.path}
                  isCollapsed={effectiveCollapsed}
                  onNavigate={handleItemSelect}
                />
              ) : (
                <SidebarGroup
                  icon={section.icon}
                  label={section.label}
                  isCollapsed={effectiveCollapsed}
                  isExpanded={expandedGroups.includes(section.id)}
                  isActive={isGroupActive(section, location.pathname)}
                  onToggle={() => toggleGroup(section.id)}
                  onRequestExpandSidebar={handleRequestExpandSidebar}
                >
                  {section.children.map((child) => (
                    <SidebarItem
                      key={child.id}
                      icon={child.icon}
                      label={child.label}
                      path={child.path}
                      isCollapsed={effectiveCollapsed}
                      onNavigate={handleItemSelect}
                      nested
                    />
                  ))}
                </SidebarGroup>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <SidebarFooter isCollapsed={effectiveCollapsed} />
    </aside>
  )
}
