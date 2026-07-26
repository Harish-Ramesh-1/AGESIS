import { useThemeStore } from '../store/themeStore'

export default function useTheme() {
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  return { theme, toggleTheme }
}
