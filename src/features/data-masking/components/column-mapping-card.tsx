import { Card } from '../../../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { MASK_COLORS } from '../constants'
import { maskValue } from '../masking'
import type { ColumnDetection, DataRow, MaskType } from '../types'
import { useI18n } from '../../../i18n/i18n-context'

interface Props { column: string; sample: DataRow; type: MaskType; detection?: ColumnDetection; seed: string; onChange: (type: MaskType) => void }
export function ColumnMappingCard({ column, sample, type, detection, seed, onChange }: Props) {
  const { t } = useI18n(); const labels: Record<MaskType, string> = { none:t('none'), name:t('name'), email:t('email'), dob:t('dob'), phone:t('phone'), address:t('address'), id:t('code') }
  return <Card className="mapping-row"><div className="source" data-label={t('source')}><div className="column-heading"><code>{column}</code>{detection && <span className={`confidence ${detection.confidence >= .8 ? 'high' : detection.confidence >= .55 ? 'medium' : 'low'}`}>{Math.round(detection.confidence * 100)}% {t('confidence')}</span>}</div><small>{String(sample[column] ?? '').slice(0, 34) || '-'}</small>{detection && detection.alternatives.length > 0 && <div className="suggestions"><span>{t('suggested')}:</span>{detection.alternatives.map(suggestion => <button type="button" key={suggestion.type} onClick={() => onChange(suggestion.type)}>{labels[suggestion.type]} {Math.round(suggestion.confidence * 100)}%</button>)}</div>}</div><div data-label={t('maskType')}><Select value={type} onValueChange={value => onChange(value as MaskType)}><SelectTrigger aria-label={`${t('maskType')}: ${column}`} className={`select-wrap ${type !== 'none' ? MASK_COLORS[type] : ''}`}><SelectValue/></SelectTrigger><SelectContent>{Object.entries(labels).map(([value, label]) => <SelectItem value={value} key={value}>{label}</SelectItem>)}</SelectContent></Select></div><div data-label={t('example')} className={`preview ${type === 'none' ? 'muted' : ''}`}>{String(maskValue(sample[column], type, seed, column) ?? '') || '-'}</div></Card>
}
