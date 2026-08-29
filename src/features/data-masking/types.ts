export type DataRow = Record<string, unknown>
export type MaskType = 'none' | 'name' | 'email' | 'dob' | 'phone' | 'address' | 'id'
export type AppStep = 'upload' | 'configure' | 'done'
export type ColumnMapping = Record<string, MaskType>
export interface DetectionSuggestion { type: Exclude<MaskType, 'none'>; confidence: number }
export interface ColumnDetection { type: MaskType; confidence: number; source: 'header' | 'values' | 'combined' | 'none'; alternatives: DetectionSuggestion[] }
export type ColumnDetections = Record<string, ColumnDetection>
