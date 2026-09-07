export function maskName(name: string): string {
  if (!name) return ''
  return name.split(/\s+/)
    .map(word => word.charAt(0) + '*'.repeat(Math.max(word.length - 1, 1)))
    .join(' ')
}

export function maskPhone(phone: string): string {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length <= 4) return '*'.repeat(cleaned.length)
  return cleaned.slice(0, 4) + '*'.repeat(cleaned.length - 4)
}

export function maskURN(urn: string): string {
  if (!urn) return ''
  return urn.replace(/[a-zA-Z0-9]/g, '*')
}
