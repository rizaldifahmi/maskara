export type DataRow = Record<string, unknown>
export type MaskType = 'none' | 'name' | 'email' | 'dob' | 'phone' | 'address' | 'id' | 'username' | 'password' | 'url'
export type RedactionStyle = 'blur' | 'pixelate' | 'solid'
export type AppStep = 'upload' | 'configure' | 'image-preview' | 'done'
export type ColumnMapping = Record<string, MaskType>
export interface DetectionSuggestion { type: Exclude<MaskType, 'none'>; confidence: number }
export interface ColumnDetection { type: MaskType; confidence: number; source: 'header' | 'values' | 'combined' | 'none'; alternatives: DetectionSuggestion[] }
export type ColumnDetections = Record<string, ColumnDetection>

export interface HtmlSensitiveField {
  id: string
  key: string
  value: string
  valueStart: number
  valueEnd: number
  type: Extract<MaskType, 'email' | 'username' | 'password' | 'url'>
}

export interface ParsedDataFile {
  rows: DataRow[]
  htmlSource?: string
  htmlFields?: HtmlSensitiveField[]
}

export interface ImageRedactionArea {
  id: string
  x: number
  y: number
  width: number
  height: number
  text?: string
  enabled: boolean
}

export interface ImageState {
  file: File
  areas: ImageRedactionArea[]
  style: RedactionStyle
  solidColor: string
  blurRadius: number
  pixelSize: number
}
