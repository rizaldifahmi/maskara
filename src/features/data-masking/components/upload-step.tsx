import { useRef, useState } from 'react'
import { Download, FileSpreadsheet, LockKeyhole, Sparkles, Upload, X } from 'lucide-react'
import { Alert } from '../../../components/ui/alert'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Eyebrow } from '../../../components/shared/eyebrow'
import { ACCEPTED_FILE_TYPES } from '../constants'
import { useI18n } from '../../../i18n/i18n-context'

interface UploadStepProps { processing: boolean; error: string; onFile: (file?: File) => void }
export function UploadStep({ processing, error, onFile }: UploadStepProps) {
  const [dragging, setDragging] = useState(false); const inputRef = useRef<HTMLInputElement>(null)
  const { t } = useI18n()
  return <section className="hero"><Eyebrow>{t('privacy')}</Eyebrow><h1>{t('headline')}<br/><em>{t('headlineAccent')}</em></h1><p className="lede">{t('intro')}</p><Card className={`dropzone ${dragging ? 'dragging' : ''}`} onDragOver={event => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); onFile(event.dataTransfer.files[0]) }}><input ref={inputRef} type="file" accept={ACCEPTED_FILE_TYPES} hidden onChange={event => onFile(event.target.files?.[0])}/><div className="upload-icon"><Upload size={25}/></div><h2>{processing ? t('reading') : t('drop')}</h2><p>{t('or')}</p><Button disabled={processing} onClick={() => inputRef.current?.click()}><FileSpreadsheet size={17}/> {t('chooseFile')}</Button><div className="formats"><Badge>CSV</Badge><Badge>TXT</Badge><Badge>XLSX</Badge><Badge>XLS</Badge></div></Card>{error && <Alert className="error"><X size={15}/>{error}</Alert>}<div className="trust-row"><div><LockKeyhole/><span><b>{t('noServer')}</b><small>{t('noServerDesc')}</small></span></div><div><Sparkles/><span><b>{t('smart')}</b><small>{t('smartDesc')}</small></span></div><div><Download/><span><b>{t('csvReady')}</b><small>{t('csvReadyDesc')}</small></span></div></div></section>
}
