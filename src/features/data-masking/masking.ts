import { MASK_PATTERNS } from './constants'
import type { ColumnMapping, DataRow, MaskType } from './types'

const normalizeHeader = (value: string) => value.trim().replace(/[\s.\-/]+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase()

export function inferMaskType(header: string): MaskType {
  const normalized = normalizeHeader(header.replace(/^["'`]|["'`]$/g, ''))
  for (const [type, pattern] of Object.entries(MASK_PATTERNS)) if (pattern.test(normalized)) return type as MaskType
  return 'none'
}

export const createMapping = (columns: string[]): ColumnMapping => Object.fromEntries(columns.map(column => [column, inferMaskType(column)]))

function hash(input: string) { let h = 2166136261; for (let i = 0; i < input.length; i++) { h ^= input.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }
function maskName(raw: string) { const parts = raw.trim().split(/\s+/).filter(Boolean); if (!parts.length) return raw; return [`${parts[0][0]}${'*'.repeat(Math.max(0, parts[0].length - 1))}`, ...parts.slice(1).map(part => '*'.repeat(part.length))].join(' ') }
function maskIdentifier(raw: string) { if (raw.length <= 3) return `${raw[0] ?? ''}${'*'.repeat(Math.max(0, raw.length - 1))}`; return `${raw.slice(0, 3)}${'*'.repeat(raw.length - 3)}` }

export function maskValue(value: unknown, type: MaskType, seed: string): string | number | boolean | null | undefined {
  if (value === null || value === undefined || value === '' || type === 'none') return value as string | number | boolean | null | undefined
  const raw = String(value), h = hash(`${seed}|${raw}`)
  if (type === 'name') return maskName(raw)
  if (type === 'email') return `user${String(h).padStart(10, '0').slice(0, 8)}@example.test`
  if (type === 'phone') return `08${String(h).padStart(10, '0').slice(0, 10)}`
  if (type === 'address') return `Jl. Data Aman No. ${(h % 199) + 1}, Kota Contoh`
  if (type === 'id') return maskIdentifier(raw)
  if (type === 'dob') { const parsed = new Date(raw); const year = Number.isNaN(parsed.getTime()) ? 1970 + (h % 35) : parsed.getFullYear(); return `${year}-${String((h % 12) + 1).padStart(2, '0')}-${String(((h >>> 5) % 28) + 1).padStart(2, '0')}` }
  return raw
}

export function maskRows(rows: DataRow[], columns: string[], mapping: ColumnMapping, seed: string) {
  return rows.map(row => Object.fromEntries(columns.map(column => [column, maskValue(row[column], mapping[column], seed)])))
}
