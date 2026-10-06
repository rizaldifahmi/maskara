import Papa from 'papaparse'
import { maskValue } from './masking'
import type { ColumnMapping, DataRow, HtmlSensitiveField, ParsedDataFile } from './types'

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp'])

export function isImageFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return IMAGE_EXTENSIONS.has(ext)
}

const HTML_FIELD_TYPES: Record<string, HtmlSensitiveField['type']> = {
  email: 'email', username: 'username', user_name: 'username', login: 'username', userid: 'username', user_id: 'username',
  password: 'password', pass_word: 'password', passwd: 'password', pwd: 'password', secret: 'password',
  portallink: 'url', portal_link: 'url', portalurl: 'url', portal_url: 'url', url: 'url', website: 'url', web: 'url', link: 'url',
}

function parseHtml(source: string): ParsedDataFile {
  const fields: HtmlSensitiveField[] = []
  const counts = new Map<string, number>()
  const propertyPattern = /(?:["']?)(email|user_?name|login|user_?id|password|pass_?word|passwd|pwd|secret|portal_?link|portal_?url|url|website|web|link)(?:["']?)\s*[:=]\s*(["'`])([\s\S]*?)\2/gi
  for (const match of source.matchAll(propertyPattern)) {
    const key = match[1]
    const normalized = key.toLowerCase().replace(/[^a-z0-9_]/g, '')
    const type = HTML_FIELD_TYPES[normalized]
    if (!type || match.index === undefined) continue
    const occurrence = (counts.get(normalized) ?? 0) + 1
    counts.set(normalized, occurrence)
    const full = match[0]
    const value = match[3]
    const valueOffset = full.lastIndexOf(value)
    fields.push({ id: `${key} #${occurrence}`, key, value, valueStart: match.index + valueOffset, valueEnd: match.index + valueOffset + value.length, type })
  }
  const row = Object.fromEntries(fields.map(field => [field.id, field.value]))
  return { rows: fields.length ? [row] : [], htmlSource: source, htmlFields: fields }
}

export async function parseDataFile(file: File): Promise<ParsedDataFile> {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension === 'html' || extension === 'htm') return parseHtml(await file.text())
  if (extension === 'xlsx' || extension === 'xls') {
    const XLSX = await import('xlsx')
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: false })
    return { rows: XLSX.utils.sheet_to_json<DataRow>(workbook.Sheets[workbook.SheetNames[0]], { defval: '' }) }
  }
  const result = Papa.parse<DataRow>(await file.text(), { header: true, skipEmptyLines: true, transformHeader: header => header.trim() })
  if (result.errors.length && !result.data.length) throw new Error(result.errors[0].message)
  return { rows: result.data }
}

export function downloadMaskedHtml(source: string, fields: HtmlSensitiveField[], mapping: ColumnMapping, fileName: string) {
  let output = source
  for (const field of [...fields].sort((a, b) => b.valueStart - a.valueStart)) {
    const masked = String(maskValue(field.value, mapping[field.id] ?? field.type, fileName, field.key) ?? '')
    output = output.slice(0, field.valueStart) + masked + output.slice(field.valueEnd)
  }
  const url = URL.createObjectURL(new Blob([output], { type: 'text/html;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url; anchor.download = `${fileName.replace(/\.[^.]+$/, '')}_masked.${fileName.toLowerCase().endsWith('.htm') ? 'htm' : 'html'}`; anchor.click(); URL.revokeObjectURL(url)
}

function downloadDelimited(rows: DataRow[], fileName: string, extension: 'csv' | 'txt') {
  const content = Papa.unparse(rows, { quotes: extension === 'csv', delimiter: extension === 'txt' ? '\t' : ',' })
  const mime = extension === 'txt' ? 'text/plain;charset=utf-8' : 'text/csv;charset=utf-8'
  const url = URL.createObjectURL(new Blob(['\uFEFF' + content], { type: mime }))
  const anchor = document.createElement('a')
  anchor.href = url; anchor.download = `${fileName.replace(/\.[^.]+$/, '')}_masked.${extension}`; anchor.click(); URL.revokeObjectURL(url)
}

export async function downloadMaskedFile(rows: DataRow[], fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase()
  if (extension === 'xlsx' || extension === 'xls') {
    const XLSX = await import('xlsx')
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'Masked Data')
    XLSX.writeFile(workbook, `${fileName.replace(/\.[^.]+$/, '')}_masked.${extension}`, { compression: extension === 'xlsx', bookType: extension })
    return
  }
  downloadDelimited(rows, fileName, extension === 'txt' ? 'txt' : 'csv')
}
