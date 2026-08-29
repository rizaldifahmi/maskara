import { Moon, Sun } from 'lucide-react'
import type { ThemeMode } from '../../hooks/use-theme'

interface ThemeModeToggleProps { mode: ThemeMode; onToggle: () => void }
export function ThemeModeToggle({ mode, onToggle }: ThemeModeToggleProps) {
  return <button type="button" className="theme-mode-toggle" onClick={onToggle} aria-label={`Gunakan mode ${mode === 'light' ? 'gelap' : 'terang'}`} title={`Mode ${mode === 'light' ? 'terang' : 'gelap'}`}>{mode === 'light' ? <Sun size={17}/> : <Moon size={17}/>}</button>
}
