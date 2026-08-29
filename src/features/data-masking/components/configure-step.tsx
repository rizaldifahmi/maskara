import { ArrowLeft, Download, FileSpreadsheet, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react'
import { Alert } from '../../../components/ui/alert'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Eyebrow } from '../../../components/shared/eyebrow'
import { useI18n } from '../../../i18n/i18n-context'
import { ColumnMappingCard } from './column-mapping-card'
import type { ColumnMapping, DataRow, MaskType } from '../types'

interface Props { rows: DataRow[]; fileName: string; columns: string[]; mapping: ColumnMapping; onMapping: (column: string, type: MaskType) => void; onDetect: () => void; onBack: () => void; onExport: () => void }

export function ConfigureStep({ rows, fileName, columns, mapping, onMapping, onDetect, onBack, onExport }: Props) {
  const activeCount = Object.values(mapping).filter(value => value !== 'none').length
  const displayColumns = [...columns].sort((left, right) => Number(mapping[right] !== 'none') - Number(mapping[left] !== 'none'))
  const { t, language } = useI18n()
  const locale = language === 'id' ? 'id-ID' : 'en-US'

  return <section className="workspace"><Button variant="bare" className="back" onClick={onBack}><ArrowLeft size={16}/> {t('changeFile')}</Button><div className="workspace-head"><div><Eyebrow>{t('config')}</Eyebrow><h1>{t('review')}</h1><p>{t('reviewDesc')}</p></div><div className="file-chip"><FileSpreadsheet/><span><b>{fileName}</b><small>{rows.length.toLocaleString(locale)} {t('rows')} - {columns.length} {t('columns')}</small></span></div></div><Alert className="statline"><div><Sparkles size={16}/><b>{activeCount} {t('sensitive')}</b><span>{t('basedOn')}</span></div><Button variant="bare" onClick={onDetect}><RefreshCw size={14}/> {t('detectAgain')}</Button></Alert><Card className="mapping-card"><div className="mapping-title"><span>{t('source')}</span><span>{t('maskType')}</span><span>{t('example')}</span></div>{displayColumns.map(column => <ColumnMappingCard key={column} column={column} sample={rows[0]} type={mapping[column] || 'none'} seed={fileName} onChange={type => onMapping(column, type)}/>)}</Card><div className="actionbar"><div><ShieldCheck/><span><b>{activeCount} / {columns.length} {t('willMask')}</b><small>{t('consistent')}</small></span></div><Button onClick={onExport} disabled={!activeCount}><Download size={18}/> {t('maskDownload')}</Button></div></section>
}
