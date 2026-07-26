import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { isGroupActive } from '../navUtils'
import SidebarItem from '../Sidebar/SidebarItem'
import SidebarGroup from '../Sidebar/SidebarGroup'
import SidebarFooter from '../Sidebar/SidebarFooter'

function noop() {}

export default function MoreMenuList({ sections, onNavigate }) {
  const location = useLocation()
  const [expandedGroups, setExpandedGroups] = useState(() =>
    sections
      .filter((section) => section.type === 'group' && isGroupActive(section, location.pathname))
      .map((section) => section.id),
  )

  function toggleGroup(id) {
    setExpandedGroups((prev) => (prev.includes(id) ? prev.filter((groupId) => groupId !== id) : [...prev, id]))
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-1">
        {sections.map((section) => (
          <li key={section.id}>
            {section.type === 'link' ? (
              <SidebarItem
                icon={section.icon}
                label={section.label}
                path={section.path}
                isCollapsed={false}
                onNavigate={onNavigate}
              />
            ) : (
              <SidebarGroup
                icon={section.icon}
                label={section.label}
                isCollapsed={false}
                isExpanded={expandedGroups.includes(section.id)}
                isActive={isGroupActive(section, location.pathname)}
                onToggle={() => toggleGroup(section.id)}
                onRequestExpandSidebar={noop}
              >
                {section.children.map((child) => (
                  <SidebarItem
                    key={child.id}
                    icon={child.icon}
                    label={child.label}
                    path={child.path}
                    isCollapsed={false}
                    onNavigate={onNavigate}
                    nested
                  />
                ))}
              </SidebarGroup>
            )}
          </li>
        ))}
      </ul>

      <SidebarFooter isCollapsed={false} />
    </div>
  )
}
