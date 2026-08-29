import { LockKeyhole, Palette, ShieldCheck } from 'lucide-react'
import { useTheme, THEME_COLORS, type ThemeColor } from '../../hooks/use-theme'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { ThemeModeToggle } from '../shared/theme-mode-toggle'

export function AppHeader({ onHome }: { onHome: () => void }) {
  const { mode, color, setColor, toggleMode } = useTheme()
  return <header className="topbar"><Button variant="bare" className="brand" onClick={onHome} aria-label="Kembali ke awal"><span className="brand-mark"><ShieldCheck size={18}/></span><span>maskara</span></Button><div className="header-actions"><Badge className="private-pill"><LockKeyhole size={13}/> 100% lokal di browser</Badge><Select value={color} onValueChange={value => setColor(value as ThemeColor)}><SelectTrigger aria-label="Pilih warna tema" className="color-mode-trigger"><Palette size={16}/><SelectValue/></SelectTrigger><SelectContent side="left" align="center" sideOffset={8}>{THEME_COLORS.map(option => <SelectItem value={option.value} key={option.value}><span className={`color-dot ${option.value}`}/>{option.label}</SelectItem>)}</SelectContent></Select><ThemeModeToggle mode={mode} onToggle={toggleMode}/></div></header>
}
