import { createWorker } from 'tesseract.js'
import type { ImageRedactionArea, RedactionStyle } from './types'

let workerIdCounter = 0

/** Indonesian-aware sensitive data patterns */
const SENSITIVE_PATTERNS = [
  /\b\d{2,4}[-/.]\d{1,2}[-/.]\d{2,4}\b/,                      // dates (flexible for OCR errors like 2001/1965)
  /(\+62|62|08)\d{7,12}/,                                      // Indonesian phone
  /\b\d{16}\b/,                                                // NIK (16 digits)
  /\b\d{13}\b/,                                                // BPJS (13 digits)
  /\b[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{1,3}\b/,                   // plate numbers
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,              // email
  /\b\d{5,12}\b/,                                              // long numbers (MRN, IDs, missing slash dates like 22082026)
  /\b(Jl\.?|Jalan|RT|RW|Kel\.?|Kec\.?)\b/i,                  // address prefixes
]

const EXCLUDED_UI_WORDS = new Set([
  'date', 'no', 'age', 'record', 'encounter', 'management', 'problem',
  'episode', 'payor', 'paid', 'self', 'assistant', 'charts', 'filter',
  'reason', 'sex', 'male', 'female', 'back', 'to', 'full', 'urn', 'dob',
  'patient', 'doctor', 'provider', 'history', 'clinical', 'summary',
  'time', 'status', 'type', 'category', 'action', 'edit', 'view', 'delete',
  'save', 'cancel', 'close', 'open', 'add', 'new', 'search', 'find',
  'home', 'dashboard', 'settings', 'profile', 'logout', 'login', 'user',
  'admin', 'system', 'report', 'data', 'file', 'export', 'import',
  'download', 'upload', 'print', 'share', 'send', 'receive', 'message',
  'notification', 'alert', 'error', 'success', 'warning', 'info',
  'mr', 'mrs', 'ms', 'dr', 'drg', 'prof', 'tn', 'ny', 'sdr', 'sdri',
  'for', 'this', 'and', 'the', 'of', 'in', 'on', 'at', 'by', 'with'
])

const NAME_WORD_PATTERN = /^[A-Z][a-z]+(?:[-'][A-Z]?[a-z]+)*$/

function isSensitive(text: string): boolean {
  if (SENSITIVE_PATTERNS.some(pattern => pattern.test(text))) return true
  
  // Catch names (Capitalized words that are not common UI labels)
  const cleanText = text.replace(/^[^\w]+|[^\w]+$/g, '')
  if (NAME_WORD_PATTERN.test(cleanText)) {
    if (!EXCLUDED_UI_WORDS.has(cleanText.toLowerCase()) && cleanText.length > 2) {
      return true
    }
  }
  
  return false
}

export type OcrProgress = { status: string; progress: number }

export async function detectSensitiveAreas(
  imageSource: string | File,
  onProgress?: (p: OcrProgress) => void
): Promise<ImageRedactionArea[]> {
  try {
    onProgress?.({ status: 'loading', progress: 0 })
    const worker = await createWorker('eng', undefined, {
      logger: (m: any) => {
        if (m.status && m.progress != null) {
          onProgress?.({ status: m.status, progress: Math.round(m.progress * 100) })
        }
      },
    })
    
    // Use Sparse Text PSM (11) which is much better for UI screenshots
    await worker.setParameters({
      tessedit_pageseg_mode: '11' as any
    })

    const image = typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource)
    onProgress?.({ status: 'recognizing', progress: 0 })
    
    // In Tesseract v7, words are not at the root level, we MUST request blocks
    const result: any = await worker.recognize(image, undefined, { blocks: true })
    
    // Extract words from the blocks hierarchy
    const words: any[] = []
    if (result.data.blocks) {
      for (const block of result.data.blocks) {
        if (!block.paragraphs) continue
        for (const para of block.paragraphs) {
          if (!para.lines) continue
          for (const line of para.lines) {
            if (!line.words) continue
            for (const word of line.words) {
              words.push(word)
            }
          }
        }
      }
    }

    if (typeof imageSource !== 'string') URL.revokeObjectURL(image)
    await worker.terminate()
    onProgress?.({ status: 'done', progress: 100 })

    // Group adjacent sensitive words into larger areas
    const sensitiveWords = words.filter((word: any) => {
      const text = (word.text || '').trim()
      if (!text || text.length < 2) return false
      
      // Ignore obvious OCR garbage
      if (/^(RR|OR|ER)+$/i.test(text)) return false
      
      return isSensitive(text) || (word.confidence != null && word.confidence < 55)
    })

    const areas: ImageRedactionArea[] = sensitiveWords.map((word: any) => ({
      id: `area-${++workerIdCounter}`,
      x: word.bbox.x0,
      y: word.bbox.y0,
      width: word.bbox.x1 - word.bbox.x0,
      height: word.bbox.y1 - word.bbox.y0,
      text: word.text,
      enabled: true,
    }))

    // Merge overlapping/adjacent areas
    return mergeAreas(areas)
  } catch (err) {
    console.warn('Tesseract OCR detection warning:', err)
    return []
  }
}

function mergeAreas(areas: ImageRedactionArea[]): ImageRedactionArea[] {
  if (areas.length <= 1) return areas

  const sorted = [...areas].sort((a, b) => a.y - b.y || a.x - b.x)
  const merged: ImageRedactionArea[] = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i]
    const last = merged[merged.length - 1]
    const gap = 8

    const horizontalOverlap = current.x <= last.x + last.width + gap && current.x + current.width >= last.x - gap
    const verticalOverlap = current.y <= last.y + last.height + gap && current.y + current.height >= last.y - gap

    if (horizontalOverlap && verticalOverlap) {
      const x = Math.min(last.x, current.x)
      const y = Math.min(last.y, current.y)
      last.x = x
      last.y = y
      last.width = Math.max(last.x + last.width, current.x + current.width) - x
      last.height = Math.max(last.y + last.height, current.y + current.height) - y
      last.text = [last.text, current.text].filter(Boolean).join(' ')
    } else {
      merged.push({ ...current })
    }
  }

  return merged
}

export async function redactImage(
  imageSource: File,
  areas: ImageRedactionArea[],
  style: RedactionStyle = 'blur',
  options: { solidColor?: string; blurRadius?: number; pixelSize?: number } = {}
): Promise<Blob> {
  const { solidColor = '#000000', blurRadius = 20, pixelSize = 12 } = options
  const enabledAreas = areas.filter(a => a.enabled)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      if (!ctx) { reject(new Error('Failed to get canvas context')); return }

      ctx.drawImage(img, 0, 0)

      for (const area of enabledAreas) {
        const pad = 4
        const ax = Math.max(0, area.x - pad)
        const ay = Math.max(0, area.y - pad)
        const aw = Math.min(canvas.width - ax, area.width + pad * 2)
        const ah = Math.min(canvas.height - ay, area.height + pad * 2)

        if (style === 'solid') {
          ctx.fillStyle = solidColor
          ctx.fillRect(ax, ay, aw, ah)
        } else if (style === 'pixelate') {
          const size = Math.max(4, pixelSize)
          const imageData = ctx.getImageData(ax, ay, aw, ah)
          const data = imageData.data
          for (let py = 0; py < ah; py += size) {
            for (let px = 0; px < aw; px += size) {
              const idx = (py * aw + px) * 4
              const r = data[idx], g = data[idx + 1], b = data[idx + 2]
              for (let dy = 0; dy < size && py + dy < ah; dy++) {
                for (let dx = 0; dx < size && px + dx < aw; dx++) {
                  const i = ((py + dy) * aw + (px + dx)) * 4
                  data[i] = r; data[i + 1] = g; data[i + 2] = b
                }
              }
            }
          }
          ctx.putImageData(imageData, ax, ay)
        } else {
          // Blur using CanvasRenderingContext2D.filter
          const tempCanvas = document.createElement('canvas')
          tempCanvas.width = aw
          tempCanvas.height = ah
          const tempCtx = tempCanvas.getContext('2d')!
          tempCtx.drawImage(canvas, ax, ay, aw, ah, 0, 0, aw, ah)
          ctx.save()
          ctx.beginPath()
          ctx.rect(ax, ay, aw, ah)
          ctx.clip()
          ctx.filter = `blur(${blurRadius}px)`
          ctx.drawImage(tempCanvas, ax, ay)
          ctx.restore()
        }
      }

      URL.revokeObjectURL(img.src)
      canvas.toBlob(blob => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to export canvas to blob'))
      }, 'image/png')
    }
    img.onerror = () => { URL.revokeObjectURL(img.src); reject(new Error('Failed to load image')) }
    img.src = URL.createObjectURL(imageSource)
  })
}

export function drawPreview(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  areas: ImageRedactionArea[],
  style: RedactionStyle,
  options: { solidColor?: string; blurRadius?: number; pixelSize?: number } = {}
) {
  const { solidColor = '#000000', blurRadius = 20, pixelSize = 12 } = options
  const ctx = canvas.getContext('2d')!
  if (!ctx) return

  // Scale to fit canvas
  const scale = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight)
  const dw = img.naturalWidth * scale
  const dh = img.naturalHeight * scale
  const dx = (canvas.width - dw) / 2
  const dy = (canvas.height - dh) / 2

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw checkerboard background for transparency
  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.drawImage(img, dx, dy, dw, dh)

  for (const area of areas) {
    const ax = dx + area.x * scale
    const ay = dy + area.y * scale
    const aw = area.width * scale
    const ah = area.height * scale
    const pad = 3 * scale

    if (area.enabled) {
      // Draw redaction preview
      if (style === 'solid') {
        ctx.fillStyle = solidColor
        ctx.fillRect(ax - pad, ay - pad, aw + pad * 2, ah + pad * 2)
      } else if (style === 'pixelate') {
        // Draw a simplified mosaic preview
        const size = Math.max(3, pixelSize * scale)
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = Math.max(1, Math.ceil(aw + pad * 2))
        tempCanvas.height = Math.max(1, Math.ceil(ah + pad * 2))
        const tempCtx = tempCanvas.getContext('2d')!
        tempCtx.drawImage(canvas, ax - pad, ay - pad, aw + pad * 2, ah + pad * 2, 0, 0, tempCanvas.width, tempCanvas.height)
        const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
        const d = imgData.data
        for (let py = 0; py < tempCanvas.height; py += size) {
          for (let px = 0; px < tempCanvas.width; px += size) {
            const idx = (Math.floor(py) * tempCanvas.width + Math.floor(px)) * 4
            const r = d[idx], g = d[idx+1], b = d[idx+2]
            ctx.fillStyle = `rgb(${r},${g},${b})`
            ctx.fillRect(ax - pad + px, ay - pad + py, size, size)
          }
        }
      } else {
        // Blur preview - draw semi-transparent overlay
        ctx.save()
        ctx.beginPath()
        ctx.rect(ax - pad, ay - pad, aw + pad * 2, ah + pad * 2)
        ctx.clip()
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = Math.max(1, Math.ceil(aw + pad * 2))
        tempCanvas.height = Math.max(1, Math.ceil(ah + pad * 2))
        const tempCtx = tempCanvas.getContext('2d')!
        tempCtx.drawImage(canvas, ax - pad, ay - pad, aw + pad * 2, ah + pad * 2, 0, 0, tempCanvas.width, tempCanvas.height)
        ctx.filter = `blur(${blurRadius * scale * 0.5}px)`
        ctx.drawImage(tempCanvas, ax - pad, ay - pad)
        ctx.restore()
      }

      // Green border for enabled areas
      ctx.strokeStyle = '#22c55e'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 3])
      ctx.strokeRect(ax - pad, ay - pad, aw + pad * 2, ah + pad * 2)
      ctx.setLineDash([])
    } else {
      // Orange dashed border for disabled areas
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 4])
      ctx.strokeRect(ax - pad, ay - pad, aw + pad * 2, ah + pad * 2)
      ctx.setLineDash([])
    }
  }

  return { scale, dx, dy }
}
