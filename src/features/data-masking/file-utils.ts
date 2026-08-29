import Papa from 'papaparse'
import type { DataRow } from './types'

export async function parseDataFile(file: File): Promise<DataRow[]> {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension === 'xlsx' || extension === 'xls') {
    const XLSX = await import('xlsx')
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: false })
    return XLSX.utils.sheet_to_json<DataRow>(workbook.Sheets[workbook.SheetNames[0]], { defval: '' })
  }
  const result = Papa.parse<DataRow>(await file.text(), { header: true, skipEmptyLines: true, transformHeader: header => header.trim() })
  if (result.errors.length && !result.data.length) throw new Error(result.errors[0].message)
  return result.data
}

export function downloadCsv(rows: DataRow[], fileName: string) {
  const csv = Papa.unparse(rows, { quotes: true })
  const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url; anchor.download = `${fileName.replace(/\.[^.]+$/, '')}_masked.csv`; anchor.click(); URL.revokeObjectURL(url)
}
