import { useRef, useState } from 'react'
import { Download, FileSpreadsheet, LockKeyhole, Sparkles, Upload, X } from 'lucide-react'
import { Alert } from '../../../components/ui/alert'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Eyebrow } from '../../../components/shared/eyebrow'
import { ACCEPTED_FILE_TYPES } from '../constants'

interface UploadStepProps { processing: boolean; error: string; onFile: (file?: File) => void }
export function UploadStep({ processing, error, onFile }: UploadStepProps) {
  const [dragging, setDragging] = useState(false); const inputRef = useRef<HTMLInputElement>(null)
  return <section className="hero"><Eyebrow>PRIVASI DATA, TANPA RIBET</Eyebrow><h1>Samarkan data pribadi.<br/><em>Aman, cepat, lokal.</em></h1><p className="lede">Upload hasil query Anda, biarkan Maskara mengenali data sensitif secara otomatis, lalu download CSV yang sudah aman.</p><Card className={`dropzone ${dragging ? 'dragging' : ''}`} onDragOver={event => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); onFile(event.dataTransfer.files[0]) }}><input ref={inputRef} type="file" accept={ACCEPTED_FILE_TYPES} hidden onChange={event => onFile(event.target.files?.[0])}/><div className="upload-icon"><Upload size={25}/></div><h2>{processing ? 'Membaca file…' : 'Tarik & lepas file di sini'}</h2><p>atau</p><Button disabled={processing} onClick={() => inputRef.current?.click()}><FileSpreadsheet size={17}/> Pilih file</Button><div className="formats"><Badge>CSV</Badge><Badge>TXT</Badge><Badge>XLSX</Badge><Badge>XLS</Badge></div></Card>{error && <Alert className="error"><X size={15}/>{error}</Alert>}<div className="trust-row"><div><LockKeyhole/><span><b>Tidak ada upload server</b><small>Data tidak pernah meninggalkan perangkat</small></span></div><div><Sparkles/><span><b>Deteksi kolom pintar</b><small>Kenali berbagai nama kolom & alias SQL</small></span></div><div><Download/><span><b>CSV siap pakai</b><small>Format universal untuk analisis</small></span></div></div></section>
}
