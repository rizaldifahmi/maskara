import { Card } from '../../../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { MASK_COLORS } from '../constants'
import { maskValue } from '../masking'
import type { DataRow, MaskType } from '../types'
import { useI18n } from '../../../i18n/i18n-context'

interface Props { column: string; sample: DataRow; type: MaskType; seed: string; onChange: (type: MaskType) => void }
export function ColumnMappingCard({ column, sample, type, seed, onChange }: Props) {
  const { t } = useI18n(); const labels: Record<MaskType, string> = { none:t('none'), name:t('name'), email:t('email'), dob:t('dob'), phone:t('phone'), address:t('address'), id:t('code') }
  return <Card className="mapping-row"><div className="source" data-label={t('source')}><code>{column}</code><small>{String(sample[column] ?? '').slice(0, 34) || '-'}</small></div><div data-label={t('maskType')}><Select value={type} onValueChange={value => onChange(value as MaskType)}><SelectTrigger aria-label={`${t('maskType')}: ${column}`} className={`select-wrap ${type !== 'none' ? MASK_COLORS[type] : ''}`}><SelectValue/></SelectTrigger><SelectContent>{Object.entries(labels).map(([value, label]) => <SelectItem value={value} key={value}>{label}</SelectItem>)}</SelectContent></Select></div><div data-label={t('example')} className={`preview ${type === 'none' ? 'muted' : ''}`}>{String(maskValue(sample[column], type, seed) ?? '') || '-'}</div></Card>
}
