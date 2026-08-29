import { Card } from '../../../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { MASK_COLORS, MASK_LABELS } from '../constants'
import { maskValue } from '../masking'
import type { DataRow, MaskType } from '../types'

interface Props { column: string; sample: DataRow; type: MaskType; seed: string; onChange: (type: MaskType) => void }
export function ColumnMappingCard({ column, sample, type, seed, onChange }: Props) {
  return <Card className="mapping-row"><div className="source" data-label="Kolom sumber"><code>{column}</code><small>{String(sample[column] ?? '').slice(0, 34) || '—'}</small></div><div data-label="Tipe masking"><Select value={type} onValueChange={value => onChange(value as MaskType)}><SelectTrigger aria-label={`Tipe masking untuk ${column}`} className={`select-wrap ${type !== 'none' ? MASK_COLORS[type] : ''}`}><SelectValue/></SelectTrigger><SelectContent>{Object.entries(MASK_LABELS).map(([value, label]) => <SelectItem value={value} key={value}>{label}</SelectItem>)}</SelectContent></Select></div><div data-label="Contoh hasil" className={`preview ${type === 'none' ? 'muted' : ''}`}>{String(maskValue(sample[column], type, seed) ?? '') || '—'}</div></Card>
}
