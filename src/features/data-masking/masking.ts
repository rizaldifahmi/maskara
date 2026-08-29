import { MASK_PATTERNS } from './constants'
import type { ColumnDetection, ColumnDetections, ColumnMapping, DataRow, MaskType } from './types'

const normalizeHeader = (value: string) => value.trim().replace(/[\s.\-/]+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase()

export function inferMaskType(header: string): MaskType {
  const normalized = normalizeHeader(header.replace(/^["'`]|["'`]$/g, ''))
  for (const [type, pattern] of Object.entries(MASK_PATTERNS)) if (pattern.test(normalized)) return type as MaskType
  return 'none'
}

export const createMapping = (columns: string[]): ColumnMapping => Object.fromEntries(columns.map(column => [column, inferMaskType(column)]))

const detectors: Record<Exclude<MaskType, 'none'>, (value: string) => boolean> = {
  email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: value => /^\+?[\d\s().-]{8,18}$/.test(value) && value.replace(/\D/g, '').length >= 8,
  dob: value => { const date = new Date(value); return !Number.isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() <= new Date().getFullYear() },
  address: value => /\b(jl\.?|jalan|street|st\.?|road|rd\.?|avenue|ave\.?|kota|city|kabupaten|district)\b/i.test(value),
  name: value => /^[\p{L}.'-]+(?:\s+[\p{L}.'-]+){1,5}$/u.test(value) && value.length <= 80,
  id: value => /^[a-z0-9][a-z0-9./-]{3,30}$/i.test(value),
}

function valueScores(rows: DataRow[], column: string) {
  const values = rows.slice(0, 100).map(row => String(row[column] ?? '').trim()).filter(Boolean)
  const scores = {} as Record<Exclude<MaskType, 'none'>, number>
  for (const [type, detector] of Object.entries(detectors)) scores[type as Exclude<MaskType, 'none'>] = values.length ? values.filter(detector).length / values.length : 0
  return scores
}

export function analyzeColumn(column: string, rows: DataRow[]): ColumnDetection {
  const headerType = inferMaskType(column)
  const scores = valueScores(rows, column)
  const ranked = (Object.entries(scores) as [Exclude<MaskType, 'none'>, number][]).sort((a, b) => b[1] - a[1])
  const [bestValueType, bestValueScore] = ranked[0]
  const hasHeader = headerType !== 'none'
  const headerValueScore = hasHeader ? scores[headerType] : 0
  const type = hasHeader ? headerType : bestValueScore >= .72 ? bestValueType : 'none'
  const confidence = hasHeader ? Math.min(.99, .88 + headerValueScore * .11) : type !== 'none' ? Math.min(.94, .5 + bestValueScore * .44) : Math.min(.49, bestValueScore * .49)
  const source = hasHeader && headerValueScore >= .5 ? 'combined' : hasHeader ? 'header' : type !== 'none' ? 'values' : 'none'
  const alternatives = ranked.filter(([candidate, score]) => candidate !== type && score >= .45).slice(0, 2).map(([candidate, score]) => ({ type: candidate, confidence: Math.round(score * 100) / 100 }))
  return { type, confidence: Math.round(confidence * 100) / 100, source, alternatives }
}

export function analyzeColumns(columns: string[], rows: DataRow[]): ColumnDetections { return Object.fromEntries(columns.map(column => [column, analyzeColumn(column, rows)])) }
export function mappingFromDetections(detections: ColumnDetections): ColumnMapping { return Object.fromEntries(Object.entries(detections).map(([column, detection]) => [column, detection.type])) }

function hash(input: string) { let h = 2166136261; for (let i = 0; i < input.length; i++) { h ^= input.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }
function maskName(raw: string) { const parts = raw.trim().split(/\s+/).filter(Boolean); if (!parts.length) return raw; return [`${parts[0][0]}${'*'.repeat(Math.max(0, parts[0].length - 1))}`, ...parts.slice(1).map(part => '*'.repeat(part.length))].join(' ') }
function maskIdentifier(raw: string, visibleCharacters = 3) { const visible = Math.min(Math.max(1, visibleCharacters), raw.length); return `${raw.slice(0, visible)}${'*'.repeat(Math.max(0, raw.length - visible))}` }
function isPapmiNumber(column = '') { return /(^|_)papmi_?no(_|$)/i.test(normalizeHeader(column)) }

export function maskValue(value: unknown, type: MaskType, seed: string, column = ''): string | number | boolean | null | undefined {
  if (value === null || value === undefined || value === '' || type === 'none') return value as string | number | boolean | null | undefined
  const raw = String(value), h = hash(`${seed}|${raw}`)
  if (type === 'name') return maskName(raw)
  if (type === 'email') return `user${String(h).padStart(10, '0').slice(0, 8)}@example.test`
  if (type === 'phone') return `08${String(h).padStart(10, '0').slice(0, 10)}`
  if (type === 'address') return `Jl. Data Aman No. ${(h % 199) + 1}, Kota Contoh`
  if (type === 'id') return maskIdentifier(raw, isPapmiNumber(column) ? 1 : 3)
  if (type === 'dob') { const parsed = new Date(raw); const year = Number.isNaN(parsed.getTime()) ? 1970 + (h % 35) : parsed.getFullYear(); return `${year}-${String((h % 12) + 1).padStart(2, '0')}-${String(((h >>> 5) % 28) + 1).padStart(2, '0')}` }
  return raw
}

export function maskRows(rows: DataRow[], columns: string[], mapping: ColumnMapping, seed: string) {
  return rows.map(row => Object.fromEntries(columns.map(column => [column, maskValue(row[column], mapping[column], seed, column)])))
}
