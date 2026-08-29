import { useMemo, useState } from 'react'
import { AppFooter } from '../components/layout/app-footer'
import { AppHeader } from '../components/layout/app-header'
import { ConfigureStep } from '../features/data-masking/components/configure-step'
import { SuccessStep } from '../features/data-masking/components/success-step'
import { UploadStep } from '../features/data-masking/components/upload-step'
import { downloadMaskedFile, parseDataFile } from '../features/data-masking/file-utils'
import { analyzeColumns, mappingFromDetections, maskRows } from '../features/data-masking/masking'
import type { AppStep, ColumnDetections, ColumnMapping, DataRow, MaskType } from '../features/data-masking/types'
import { useI18n } from '../i18n/i18n-context'

export default function App() {
  const { t } = useI18n()
  const [step, setStep] = useState<AppStep>('upload')
  const [rows, setRows] = useState<DataRow[]>([])
  const [fileName, setFileName] = useState('')
  const [mapping, setMapping] = useState<ColumnMapping>({})
  const [detections, setDetections] = useState<ColumnDetections>({})
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const columns = useMemo(() => rows[0] ? Object.keys(rows[0]) : [], [rows])

  const reset = () => { setRows([]); setFileName(''); setMapping({}); setDetections({}); setError(''); setStep('upload') }
  const exportMasked = async () => { await downloadMaskedFile(maskRows(rows, columns, mapping, fileName || 'maskara'), fileName); setStep('done') }
  const detectColumns = () => { const next = analyzeColumns(columns, rows); setDetections(next); setMapping(mappingFromDetections(next)) }
  const updateMapping = (column: string, type: MaskType) => setMapping(current => ({ ...current, [column]: type }))

  async function loadFile(file?: File) {
    if (!file) return
    if (!/\.(csv|txt|xlsx|xls)$/i.test(file.name)) { setError(t('unsupported')); return }
    setError(''); setProcessing(true)
    try { const data = await parseDataFile(file); if (!data.length) throw new Error(t('empty')); const next = analyzeColumns(Object.keys(data[0]), data); setRows(data); setFileName(file.name); setDetections(next); setMapping(mappingFromDetections(next)); setStep('configure') }
    catch (cause) { setError(cause instanceof Error ? cause.message : t('readError')) }
    finally { setProcessing(false) }
  }

  return <div className="app-shell"><AppHeader onHome={reset}/><main>{step === 'upload' && <UploadStep processing={processing} error={error} onFile={loadFile}/>} {step === 'configure' && <ConfigureStep rows={rows} fileName={fileName} columns={columns} mapping={mapping} detections={detections} onMapping={updateMapping} onDetect={detectColumns} onBack={reset} onExport={exportMasked}/>} {step === 'done' && <SuccessStep rowCount={rows.length} onReset={reset} onDownload={exportMasked}/>}</main><AppFooter/></div>
}
