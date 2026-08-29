import { Moon, Sun } from 'lucide-react'
import type { ThemeMode } from '../../hooks/use-theme'
import { useI18n } from '../../i18n/i18n-context'

interface ThemeModeToggleProps { mode: ThemeMode; onToggle: () => void }
export function ThemeModeToggle({ mode, onToggle }: ThemeModeToggleProps) {
  const { t } = useI18n(); const label = mode === 'light' ? t('dark') : t('light')
  return <button type="button" className="theme-mode-toggle" onClick={onToggle} aria-label={label} title={label}>{mode === 'light' ? <Sun size={17}/> : <Moon size={17}/>}</button>
}
