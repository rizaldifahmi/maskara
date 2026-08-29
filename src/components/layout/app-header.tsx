import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { useTheme, THEME_COLORS, type ThemeColor } from '../../hooks/use-theme'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { ThemeModeToggle } from '../shared/theme-mode-toggle'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { LanguageToggle } from '../shared/language-toggle'
import { useI18n } from '../../i18n/i18n-context'

export function AppHeader({ onHome }: { onHome: () => void }) {
  const { mode, color, setColor, toggleMode } = useTheme()
  const { t } = useI18n()
  return <header className="topbar"><Button variant="bare" className="brand" onClick={onHome} aria-label={t('home')}><span className="brand-mark"><ShieldCheck size={18}/></span><span>maskara</span></Button><div className="header-actions"><Badge className="private-pill"><LockKeyhole size={13}/> {t('local')}</Badge><ThemeModeToggle mode={mode} onToggle={toggleMode}/><Select value={color} onValueChange={value => setColor(value as ThemeColor)}><SelectTrigger aria-label={t('chooseColor')} className="color-mode-trigger"><SelectValue/></SelectTrigger><SelectContent>{THEME_COLORS.map(option => <SelectItem value={option.value} key={option.value}><span className={`color-dot ${option.value}`}/>{option.label}</SelectItem>)}</SelectContent></Select><LanguageToggle/></div></header>
}
