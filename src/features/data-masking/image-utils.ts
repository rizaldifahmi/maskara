import { createWorker } from 'tesseract.js'

export interface RedactionArea {
  x: number
  y: number
  width: number
  height: number
  text?: string
}

export async function detectSensitiveAreas(imageSource: string | File): Promise<RedactionArea[]> {
  try {
    const worker = await createWorker('eng')
    
    const image = typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource)
    const result: any = await worker.recognize(image)
    const words = result.data.words || []
    
    if (typeof imageSource !== 'string') URL.revokeObjectURL(image)
    await worker.terminate()

    const sensitiveAreas: RedactionArea[] = words
      .filter((word: any) => {
        const text = (word.text || '').toLowerCase()
        const isDate = /\d{2}[-/]\d{2}[-/]\d{4}/.test(text)
        const isPhone = /(\+62|08)\d{8,}/.test(text)
        const isID = /[A-Z]{2,3}\d{5,}/.test(text)
        
        return isDate || isPhone || isID || (word.confidence && word.confidence < 60)
      })
      .map((word: any) => ({
        x: word.bbox.x0,
        y: word.bbox.y0,
        width: word.bbox.x1 - word.bbox.x0,
        height: word.bbox.y1 - word.bbox.y0,
        text: word.text
      }))

    return sensitiveAreas
  } catch (err) {
    console.warn('Tesseract OCR detection warning:', err)
    return []
  }
}

export async function redactImage(
  imageSource: File, 
  areas: RedactionArea[]
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0)
      ctx.fillStyle = 'black'
      for (const area of areas) {
        ctx.fillRect(area.x - 2, area.y - 2, area.width + 4, area.height + 4)
      }

      canvas.toBlob(blob => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to export canvas to blob'))
      }, 'image/jpeg', 0.9)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(imageSource)
  })
}
