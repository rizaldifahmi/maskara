import { useEffect, useMemo, useRef, useState } from 'react'
import Papa from 'papaparse'
import { ArrowLeft, Check, Download, FileSpreadsheet, LockKeyhole, Moon, Palette, RefreshCw, ShieldCheck, Sparkles, Sun, Upload, X } from 'lucide-react'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Card } from './components/ui/card'
import { Alert } from './components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'

type Row = Record<string, unknown>
type MaskType = 'none' | 'name' | 'email' | 'dob' | 'phone' | 'address' | 'id'
type Step = 'upload' | 'configure' | 'done'
type ThemeColor = 'zinc' | 'slate' | 'gray' | 'neutral' | 'stone' | 'emerald'
const THEME_COLORS: { value: ThemeColor; label: string }[] = [
  { value: 'zinc', label: 'Zinc' }, { value: 'slate', label: 'Slate' }, { value: 'gray', label: 'Gray' },
  { value: 'neutral', label: 'Neutral' }, { value: 'stone', label: 'Stone' }, { value: 'emerald', label: 'Emerald' },
]

const LABELS: Record<MaskType, string> = { none: 'Jangan masking', name: 'Nama / deskripsi provider', email: 'Email', dob: 'Tanggal lahir', phone: 'Nomor HP', address: 'Alamat', id: 'Kode / ID' }
const COLORS: Record<Exclude<MaskType, 'none'>, string> = { name: 'violet', email: 'blue', dob: 'amber', phone: 'cyan', address: 'rose', id: 'green' }
const PATTERNS: Record<Exclude<MaskType, 'none'>, RegExp> = {
  name: /(^|_)(nama|name|patient_?name|pat_?name|full_?name|firstname|lastname|surname|givenname|othername|papmi_?name[2-8]?|paper_?name[2-8]?|ctpcp_?(desc|surname|firstname|othername)|careprov_?(desc|description|name)|careprovider_?(desc|description|name)|provider_?(desc|description|name)|doctor_?(desc|description|name))(_|$)/i,
  email: /(^|_)(e_?mail|email_?address|papmi_?email|paper_?email|ctpcp_?email|careprov_?email|careprovider_?email|provider_?email|doctor_?email)(_|$)/i,
  dob: /(^|_)(dob|birth|birth_?date|date_?of_?birth|tanggal_?lahir|tgl_?lahir|papmi_?dob|paper_?dob)(_|$)/i,
  phone: /(^|_)(phone|mobile|telephone|telp|no_?hp|nomor_?hp|whatsapp|wa|papmi_?tel|paper_?tel[howm]?|ctpcp_?(telh|telo|mobilephone)|careprov_?(phone|mobile|telephone)|careprovider_?(phone|mobile|telephone))(_|$)/i,
  address: /(^|_)(address|alamat|street|domicile|domisili|papmi_?addr|paper_?(stname|address|address2|city|postcode)|ctpcp_?(stname|address)|careprov_?address|careprovider_?address)(_|$)/i,
  id: /(^|_)(mrn|medical_?record|patient_?id|pat_?id|no_?rm|norm|adm_?no|paadm_?admno|papmi_?(no|ipno|opno|id|rowid)|paper_?(id|rowid)|ctpcp_?(code|rowid)|careprov_?(code|id)|careprovider_?(code|id)|provider_?code|doctor_?code)(_|$)/i,
}

function normalizeHeader(value: string) {
  return value.trim().replace(/[\s.\-/]+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase()
}
function inferType(header: string): MaskType {
  const normalized = normalizeHeader(header.replace(/^["'`]|["'`]$/g, ''))
  for (const [type, pattern] of Object.entries(PATTERNS)) if (pattern.test(normalized)) return type as MaskType
  return 'none'
}
function hash(input: string) {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) { h ^= input.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}
function maskName(raw: string) {
  const parts = raw.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return raw
  const first = `${parts[0][0]}${'*'.repeat(Math.max(0, parts[0].length - 1))}`
  return [first, ...parts.slice(1).map(part => '*'.repeat(part.length))].join(' ')
}
function maskIdentifier(raw: string) {
  if (raw.length <= 3) return `${raw[0] ?? ''}${'*'.repeat(Math.max(0, raw.length - 1))}`
  return `${raw.slice(0, 3)}${'*'.repeat(raw.length - 3)}`
}
function mask(value: unknown, type: MaskType, seed: string): string | number | boolean | null | undefined {
  if (value === null || value === undefined || value === '' || type === 'none') return value as string | number | boolean | null | undefined
  const raw = String(value), h = hash(seed + '|' + raw)
  if (type === 'name') return maskName(raw)
  if (type === 'email') return `user${String(h).padStart(10, '0').slice(0, 8)}@example.test`
  if (type === 'phone') return `08${String(h).padStart(10, '0').slice(0, 10)}`
  if (type === 'address') return `Jl. Data Aman No. ${(h % 199) + 1}, Kota Contoh`
  if (type === 'id') return maskIdentifier(raw)
  if (type === 'dob') {
    const parsed = new Date(raw), year = Number.isNaN(parsed.getTime()) ? 1970 + (h % 35) : parsed.getFullYear()
    return `${year}-${String((h % 12) + 1).padStart(2, '0')}-${String(((h >>> 5) % 28) + 1).padStart(2, '0')}`
  }
  return raw
}

async function parseFile(file: File): Promise<Row[]> {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext === 'xlsx' || ext === 'xls') {
    const XLSX = await import('xlsx')
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: false })
    return XLSX.utils.sheet_to_json<Row>(wb.Sheets[wb.SheetNames[0]], { defval: '' })
  }
  const text = await file.text()
  const result = Papa.parse<Row>(text, { header: true, skipEmptyLines: true, transformHeader: h => h.trim() })
  if (result.errors.length && !result.data.length) throw new Error(result.errors[0].message)
  return result.data
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('maskara-theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [themeColor, setThemeColor] = useState<ThemeColor>(() => (localStorage.getItem('maskara-color') as ThemeColor) || 'zinc')
  const [step, setStep] = useState<Step>('upload')
  const [rows, setRows] = useState<Row[]>([])
  const [fileName, setFileName] = useState('')
  const [mapping, setMapping] = useState<Record<string, MaskType>>({})
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const columns = useMemo(() => rows[0] ? Object.keys(rows[0]) : [], [rows])
  const activeCount = Object.values(mapping).filter(v => v !== 'none').length

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    localStorage.setItem('maskara-theme', theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#08130f' : '#f5f6f2')
  }, [theme])
  useEffect(() => {
    document.documentElement.dataset.palette = themeColor
    localStorage.setItem('maskara-color', themeColor)
  }, [themeColor])

  async function load(file?: File) {
    if (!file) return
    if (!/\.(csv|txt|xlsx|xls)$/i.test(file.name)) { setError('Format belum didukung. Gunakan CSV, TXT, XLSX, atau XLS.'); return }
    setError(''); setProcessing(true)
    try {
      const data = await parseFile(file)
      if (!data.length) throw new Error('File tidak berisi baris data.')
      const headers = Object.keys(data[0])
      setRows(data); setFileName(file.name); setMapping(Object.fromEntries(headers.map(h => [h, inferType(h)]))); setStep('configure')
    } catch (e) { setError(e instanceof Error ? e.message : 'File tidak dapat dibaca.') }
    finally { setProcessing(false) }
  }
  function exportCsv() {
    const seed = fileName || 'maskara'
    const masked = rows.map(row => Object.fromEntries(columns.map(col => [col, mask(row[col], mapping[col], seed)])))
    const csv = Papa.unparse(masked, { quotes: true })
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob), a = document.createElement('a')
    a.href = url; a.download = `${fileName.replace(/\.[^.]+$/, '')}_masked.csv`; a.click(); URL.revokeObjectURL(url); setStep('done')
  }
  function reset() { setRows([]); setFileName(''); setMapping({}); setError(''); setStep('upload') }

  return <div className="app-shell">
    <header className="topbar">
      <Button variant="bare" className="brand" onClick={reset} aria-label="Kembali ke awal"><span className="brand-mark"><ShieldCheck size={19}/></span><span>maskara</span></Button>
      <div className="header-actions"><Badge className="private-pill"><LockKeyhole size={13}/> 100% lokal di browser</Badge><Select value={themeColor} onValueChange={value => setThemeColor(value as ThemeColor)}><SelectTrigger aria-label="Pilih warna tema" className="color-mode-trigger"><Palette size={16}/><SelectValue/></SelectTrigger><SelectContent>{THEME_COLORS.map(color => <SelectItem value={color.value} key={color.value}><span className={`color-dot ${color.value}`}/>{color.label}</SelectItem>)}</SelectContent></Select><Button variant="ghost" size="icon" className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={`Gunakan mode ${theme === 'light' ? 'gelap' : 'terang'}`}>{theme === 'light' ? <Moon size={17}/> : <Sun size={17}/>}</Button></div>
    </header>

    <main>
      {step === 'upload' && <section className="hero">
        <div className="eyebrow"><span></span> PRIVASI DATA, TANPA RIBET</div>
        <h1>Samarkan data pasien.<br/><em>Aman, cepat, lokal.</em></h1>
        <p className="lede">Upload hasil query Anda, biarkan Maskara mengenali data sensitif secara otomatis, lalu download CSV yang sudah aman.</p>
        <Card className={`dropzone ${dragging ? 'dragging' : ''}`} onDragOver={e => {e.preventDefault(); setDragging(true)}} onDragLeave={() => setDragging(false)} onDrop={e => {e.preventDefault(); setDragging(false); load(e.dataTransfer.files[0])}}>
          <input ref={inputRef} type="file" accept=".csv,.txt,.xlsx,.xls" hidden onChange={e => load(e.target.files?.[0])}/>
          <div className="upload-icon"><Upload size={26}/></div>
          <h2>{processing ? 'Membaca file…' : 'Tarik & lepas file di sini'}</h2>
          <p>atau</p>
          <Button disabled={processing} onClick={() => inputRef.current?.click()}><FileSpreadsheet size={18}/> Pilih file</Button>
          <div className="formats"><Badge>CSV</Badge><Badge>TXT</Badge><Badge>XLSX</Badge><Badge>XLS</Badge></div>
        </Card>
        {error && <Alert className="error"><X size={16}/>{error}</Alert>}
        <div className="trust-row"><div><LockKeyhole/><span><b>Tidak ada upload server</b><small>Data tidak pernah meninggalkan perangkat</small></span></div><div><Sparkles/><span><b>Deteksi kolom pintar</b><small>Kenali berbagai nama kolom & alias SQL</small></span></div><div><Download/><span><b>CSV siap pakai</b><small>Format universal untuk analisis</small></span></div></div>
      </section>}

      {step === 'configure' && <section className="workspace">
        <Button variant="bare" className="back" onClick={reset}><ArrowLeft size={16}/> Ganti file</Button>
        <div className="workspace-head"><div><div className="eyebrow"><span></span> KONFIGURASI MASKING</div><h1>Periksa hasil deteksi</h1><p>Kami sudah menebak tipe data dari nama kolom. Anda tetap pegang kendali penuh.</p></div><div className="file-chip"><FileSpreadsheet/><span><b>{fileName}</b><small>{rows.length.toLocaleString('id-ID')} baris · {columns.length} kolom</small></span></div></div>
        <Alert className="statline"><div><Sparkles size={16}/><b>{activeCount} data sensitif terdeteksi</b><span>berdasarkan nama kolom dan alias SQL</span></div><Button variant="bare" onClick={() => setMapping(Object.fromEntries(columns.map(h => [h, inferType(h)])))}><RefreshCw size={14}/> Deteksi ulang</Button></Alert>
        <Card className="mapping-card">
          <div className="mapping-title"><span>Kolom sumber</span><span>Tipe masking</span><span>Contoh hasil</span></div>
          {columns.map(col => { const type = mapping[col] || 'none'; return <div className="mapping-row" key={col}>
            <div className="source"><code>{col}</code><small>{String(rows[0]?.[col] ?? '').slice(0, 34) || '—'}</small></div>
            <Select value={type} onValueChange={value => setMapping({...mapping, [col]: value as MaskType})}><SelectTrigger aria-label={`Tipe masking untuk ${col}`} className={`select-wrap ${type !== 'none' ? COLORS[type] : ''}`}><SelectValue/></SelectTrigger><SelectContent>{Object.entries(LABELS).map(([v,l]) => <SelectItem value={v} key={v}>{l}</SelectItem>)}</SelectContent></Select>
            <div className={`preview ${type === 'none' ? 'muted' : ''}`}>{String(mask(rows[0]?.[col], type, fileName) ?? '') || '—'}</div>
          </div>})}
        </Card>
        <div className="actionbar"><div><ShieldCheck/><span><b>{activeCount} dari {columns.length} kolom akan dimasking</b><small>Nilai yang sama akan selalu mendapat hasil samaran yang sama.</small></span></div><Button onClick={exportCsv} disabled={!activeCount}><Download size={18}/> Masking & download CSV</Button></div>
      </section>}

      {step === 'done' && <section className="success">
        <div className="success-icon"><Check size={32}/></div><div className="eyebrow"><span></span> SELESAI</div><h1>Data sudah aman.</h1><p><b>{rows.length.toLocaleString('id-ID')} baris</b> berhasil diproses dan CSV sudah diunduh ke perangkat Anda.</p><Button onClick={reset}><Upload size={18}/> Masking file lain</Button><Button variant="ghost" onClick={exportCsv}><Download size={17}/> Download ulang</Button>
      </section>}
    </main>
    <footer><span>maskara</span><p>Data pasien tetap menjadi milik Anda.</p><small>Diproses lokal · Tanpa penyimpanan · Tanpa pelacakan</small></footer>
  </div>
}
