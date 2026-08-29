import type { MaskType } from './types'

export const MASK_COLORS: Record<Exclude<MaskType, 'none'>, string> = { name: 'violet', email: 'blue', dob: 'amber', phone: 'cyan', address: 'rose', id: 'green' }
export const ACCEPTED_FILE_TYPES = '.csv,.txt,.xlsx,.xls'

export const MASK_PATTERNS: Record<Exclude<MaskType, 'none'>, RegExp> = {
  name: /(^|_)(nama|name|patient_?name|pat_?name|full_?name|firstname|lastname|surname|givenname|othername|papmi_?name[2-8]?|paper_?name[2-8]?|ctpcp_?(desc|surname|firstname|othername)|careprov_?(desc|description|name)|careprovider_?(desc|description|name)|provider_?(desc|description|name)|doctor_?(desc|description|name))(_|$)/i,
  email: /(^|_)(e_?mail|email_?address|papmi_?email|paper_?email|ctpcp_?email|careprov_?email|careprovider_?email|provider_?email|doctor_?email)(_|$)/i,
  dob: /(^|_)(dob|birth|birth_?date|date_?of_?birth|tanggal_?lahir|tgl_?lahir|papmi_?dob|paper_?dob)(_|$)/i,
  phone: /(^|_)(phone|mobile|telephone|telp|no_?hp|nomor_?hp|whatsapp|wa|papmi_?tel|paper_?tel[howm]?|ctpcp_?(telh|telo|mobilephone)|careprov_?(phone|mobile|telephone)|careprovider_?(phone|mobile|telephone))(_|$)/i,
  address: /(^|_)(address|alamat|street|domicile|domisili|papmi_?addr|paper_?(stname|address|address2|city|postcode)|ctpcp_?(stname|address)|careprov_?address|careprovider_?address)(_|$)/i,
  id: /(^|_)(mrn|medical_?record|patient_?id|pat_?id|no_?rm|norm|adm_?no|paadm_?admno|papmi_?(no|ipno|opno|id|rowid)|paper_?(id|rowid)|ctpcp_?(code|rowid)|careprov_?(code|id)|careprovider_?(code|id)|provider_?code|doctor_?code)(_|$)/i,
}
