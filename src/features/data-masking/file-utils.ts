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

function downloadCsv(rows: DataRow[], fileName: string) {
  const csv = Papa.unparse(rows, { quotes: true })
  const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url; anchor.download = `${fileName.replace(/\.[^.]+$/, '')}_masked.csv`; anchor.click(); URL.revokeObjectURL(url)
}

export async function downloadMaskedFile(rows: DataRow[], fileName: string) {
  if (/\.(xlsx|xls)$/i.test(fileName)) {
    const XLSX = await import('xlsx')
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'Masked Data')
    XLSX.writeFile(workbook, `${fileName.replace(/\.[^.]+$/, '')}_masked.xlsx`, { compression: true })
    return
  }
  downloadCsv(rows, fileName)
}
