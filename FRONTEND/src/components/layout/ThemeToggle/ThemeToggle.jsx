import { Moon, Sun } from 'lucide-react'
import useTheme from '../../../hooks/useTheme'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/25 text-slate-600 shadow-clay backdrop-blur-xl transition-all duration-300 ease-premium hover:border-white/60 hover:bg-white/45 hover:text-brand-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-brand-300"
    >
      <Sun
        className={`absolute h-4 w-4 transition-all duration-300 ease-premium ${
          isDark ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
        }`}
        aria-hidden="true"
      />
      <Moon
        className={`absolute h-4 w-4 transition-all duration-300 ease-premium ${
          isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-90 opacity-0'
        }`}
        aria-hidden="true"
      />
    </button>
  )
}
