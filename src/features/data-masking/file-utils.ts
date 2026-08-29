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
