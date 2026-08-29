import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { useTheme } from '../../hooks/use-theme'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { ThemeModeToggle } from '../shared/theme-mode-toggle'
import { LanguageToggle } from '../shared/language-toggle'
import { useI18n } from '../../i18n/i18n-context'
import { ColorThemeSelect } from '../shared/color-theme-select'

export function AppHeader({ onHome }: { onHome: () => void }) {
  const { mode, color, setColor, toggleMode } = useTheme()
  const { t } = useI18n()
  return <header className="topbar"><Button variant="bare" className="brand" onClick={onHome} aria-label={t('home')}><span className="brand-mark"><ShieldCheck size={18}/></span><span>maskara</span></Button><div className="header-actions"><Badge className="private-pill"><LockKeyhole size={13}/> {t('local')}</Badge><ThemeModeToggle mode={mode} onToggle={toggleMode}/><ColorThemeSelect value={color} onChange={setColor}/><LanguageToggle/></div></header>
}
