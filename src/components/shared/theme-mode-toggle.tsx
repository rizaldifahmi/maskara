import { Moon, Sun } from 'lucide-react'
import type { ThemeMode } from '../../hooks/use-theme'

interface ThemeModeToggleProps { mode: ThemeMode; onToggle: () => void }
export function ThemeModeToggle({ mode, onToggle }: ThemeModeToggleProps) {
  return <button type="button" className="theme-mode-toggle" onClick={onToggle} aria-label={`Gunakan mode ${mode === 'light' ? 'gelap' : 'terang'}`} title={`Mode ${mode === 'light' ? 'terang' : 'gelap'}`}><span className={mode === 'light' ? 'active' : ''}><Sun size={15}/></span><span className={mode === 'dark' ? 'active' : ''}><Moon size={15}/></span></button>
}
