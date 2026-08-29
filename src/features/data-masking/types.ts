export type DataRow = Record<string, unknown>
export type MaskType = 'none' | 'name' | 'email' | 'dob' | 'phone' | 'address' | 'id'
export type AppStep = 'upload' | 'configure' | 'done'
export type ColumnMapping = Record<string, MaskType>
