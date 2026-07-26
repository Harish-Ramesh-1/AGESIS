import { Laptop, Moon, Sun } from 'lucide-react'
import clsx from 'clsx'
import { useThemeStore } from '../../../store/themeStore'
import { useSettingsStore } from '../../../store/settingsStore'
import GlassCard from '../../../components/common/GlassCard'
import SectionHeader from './SectionHeader'

const THEME_OPTIONS = [
  { key: 'system', label: 'System', icon: Laptop },
  { key: 'light', label: 'Light', icon: Sun },
  { key: 'dark', label: 'Dark', icon: Moon },
]

const FONT_SIZES = [
  { key: 'small', label: 'Small' },
  { key: 'medium', label: 'Medium' },
  { key: 'large', label: 'Large' },
]

export default function AppearanceSettings() {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const useSystemTheme = useThemeStore((state) => state.useSystemTheme)
  const appearance = useSettingsStore((state) => state.appearance)
  const setFontSize = useSettingsStore((state) => state.setFontSize)

  function handleThemeSelect(key) {
    if (key === 'system') useSystemTheme()
    else setTheme(key)
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Appearance" description="Customize how AGESIS looks on your device" />

      <GlassCard title="Theme" hover={false}>
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => handleThemeSelect(option.key)}
              aria-pressed={theme === option.key}
              className={clsx(
                'flex flex-col items-center gap-2 rounded-clay border px-3 py-4 text-center transition-all duration-200 ease-premium hover:-translate-y-0.5',
                theme === option.key
                  ? 'border-brand-400/70 bg-white/60 shadow-clay-active dark:border-brand-400/40 dark:bg-white/[0.08]'
                  : 'border-white/40 bg-white/30 shadow-clay dark:border-white/10 dark:bg-white/[0.03]',
              )}
            >
              <option.icon className="h-5 w-5 text-brand-600 dark:text-brand-300" aria-hidden="true" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{option.label}</span>
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard title="Font Size" hover={false}>
        <div className="grid grid-cols-3 gap-3">
          {FONT_SIZES.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setFontSize(option.key)}
              aria-pressed={appearance.fontSize === option.key}
              className={clsx(
                'rounded-clay border px-3 py-3 text-center text-sm font-medium transition-all duration-200 ease-premium hover:-translate-y-0.5',
                appearance.fontSize === option.key
                  ? 'border-brand-400/70 bg-white/60 text-brand-700 shadow-clay-active dark:border-brand-400/40 dark:bg-white/[0.08] dark:text-brand-300'
                  : 'border-white/40 bg-white/30 text-slate-600 shadow-clay dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
