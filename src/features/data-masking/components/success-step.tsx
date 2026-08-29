import { Check, Download, Upload } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Eyebrow } from '../../../components/shared/eyebrow'
export function SuccessStep({ rowCount, onReset, onDownload }: { rowCount: number; onReset: () => void; onDownload: () => void }) { return <section className="success"><div className="success-icon"><Check size={31}/></div><Eyebrow>SELESAI</Eyebrow><h1>Data sudah aman.</h1><p><b>{rowCount.toLocaleString('id-ID')} baris</b> berhasil diproses dan CSV sudah diunduh ke perangkat Anda.</p><Button onClick={onReset}><Upload size={17}/> Masking file lain</Button><Button variant="ghost" onClick={onDownload}><Download size={17}/> Download ulang</Button></section> }
