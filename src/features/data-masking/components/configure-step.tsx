import { ArrowLeft, Download, FileSpreadsheet, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react'
import { Alert } from '../../../components/ui/alert'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Eyebrow } from '../../../components/shared/eyebrow'
import { ColumnMappingCard } from './column-mapping-card'
import type { ColumnMapping, DataRow, MaskType } from '../types'

interface Props { rows: DataRow[]; fileName: string; columns: string[]; mapping: ColumnMapping; onMapping: (column: string, type: MaskType) => void; onDetect: () => void; onBack: () => void; onExport: () => void }
export function ConfigureStep({ rows, fileName, columns, mapping, onMapping, onDetect, onBack, onExport }: Props) {
  const activeCount = Object.values(mapping).filter(value => value !== 'none').length
  return <section className="workspace"><Button variant="bare" className="back" onClick={onBack}><ArrowLeft size={16}/> Ganti file</Button><div className="workspace-head"><div><Eyebrow>KONFIGURASI MASKING</Eyebrow><h1>Periksa hasil deteksi</h1><p>Kami sudah menebak tipe data. Anda tetap memegang kendali penuh.</p></div><div className="file-chip"><FileSpreadsheet/><span><b>{fileName}</b><small>{rows.length.toLocaleString('id-ID')} baris · {columns.length} kolom</small></span></div></div><Alert className="statline"><div><Sparkles size={16}/><b>{activeCount} data sensitif terdeteksi</b><span>berdasarkan nama kolom dan alias SQL</span></div><Button variant="bare" onClick={onDetect}><RefreshCw size={14}/> Deteksi ulang</Button></Alert><Card className="mapping-card"><div className="mapping-title"><span>Kolom sumber</span><span>Tipe masking</span><span>Contoh hasil</span></div>{columns.map(column => <ColumnMappingCard key={column} column={column} sample={rows[0]} type={mapping[column] || 'none'} seed={fileName} onChange={type => onMapping(column, type)}/>)}</Card><div className="actionbar"><div><ShieldCheck/><span><b>{activeCount} dari {columns.length} kolom akan dimasking</b><small>Nilai yang sama akan selalu mendapat hasil samaran yang sama.</small></span></div><Button onClick={onExport} disabled={!activeCount}><Download size={18}/> Masking & download CSV</Button></div></section>
}
