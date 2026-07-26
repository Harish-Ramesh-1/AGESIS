import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import SettingsSidebar, { SECTIONS } from '../components/SettingsSidebar'
import GeneralSettings from '../components/GeneralSettings'
import AppearanceSettings from '../components/AppearanceSettings'
import SecuritySettings from '../components/SecuritySettings'
import AboutCard from '../components/AboutCard'
import DangerZone from '../components/DangerZone'

const PANELS = {
  general: GeneralSettings,
  appearance: AppearanceSettings,
  security: SecuritySettings,
  about: AboutCard,
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general')

  function renderPanel(key) {
    const Panel = PANELS[key]
    return Panel ? <Panel /> : null
  }

  return (
    <div>
      <PageHeader title="Settings" />

      {/* Desktop/tablet: sidebar + single active panel */}
      <div className="hidden gap-8 md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr]">
        <SettingsSidebar active={activeSection} onChange={setActiveSection} />
        <div className="flex flex-col gap-8">
          {renderPanel(activeSection)}
          <DangerZone />
        </div>
      </div>

      {/* Mobile: every section as an accordion */}
      <div className="flex flex-col gap-3 md:hidden">
        {SECTIONS.map((section) => (
          <details
            key={section.key}
            className="group rounded-clay border border-white/40 bg-white/30 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-1 text-sm font-semibold text-slate-900 focus-visible:outline-none dark:text-white">
              {section.label}
              <ChevronDown
                className="h-4 w-4 text-slate-400 transition-transform duration-200 ease-premium group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="mt-4">{renderPanel(section.key)}</div>
          </details>
        ))}
        <DangerZone />
      </div>
    </div>
  )
}
