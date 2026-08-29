import { THEME_COLORS, type ThemeColor } from '../../hooks/use-theme'
import { useI18n } from '../../i18n/i18n-context'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface ColorThemeSelectProps { value: ThemeColor; onChange: (color: ThemeColor) => void }
export function ColorThemeSelect({ value, onChange }: ColorThemeSelectProps) {
  const { t } = useI18n(); const current = THEME_COLORS.find(option => option.value === value) ?? THEME_COLORS[0]
  return <Select value={value} onValueChange={next => onChange(next as ThemeColor)}><SelectTrigger aria-label={t('chooseColor')} className="color-mode-trigger"><SelectValue><span className="color-current"><span className={`color-swatch ${current.value}`}/><span>{current.label}</span></span></SelectValue></SelectTrigger><SelectContent align="end" className="color-select-content">{THEME_COLORS.map(option => <SelectItem value={option.value} key={option.value} className="color-select-item"><span className={`color-swatch ${option.value}`}/><span>{option.label}</span></SelectItem>)}</SelectContent></Select>
}
