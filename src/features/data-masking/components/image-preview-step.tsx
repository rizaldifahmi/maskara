import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Check, CheckSquare, Download, Eye, EyeOff, Paintbrush, Square } from 'lucide-react'
import { Alert } from '../../../components/ui/alert'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Eyebrow } from '../../../components/shared/eyebrow'
import { useI18n } from '../../../i18n/i18n-context'
import { drawPreview, redactImage } from '../image-utils'
import type { ImageRedactionArea, RedactionStyle } from '../types'

interface Props {
  file: File
  areas: ImageRedactionArea[]
  onAreasChange: (areas: ImageRedactionArea[]) => void
  onBack: () => void
}

export function ImagePreviewStep({ file, areas, onAreasChange, onBack }: Props) {
  const { t } = useI18n()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [style, setStyle] = useState<RedactionStyle>('blur')
  const [solidColor, setSolidColor] = useState('#000000')
  const [blurRadius, setBlurRadius] = useState(20)
  const [pixelSize, setPixelSize] = useState(12)
  const [downloading, setDownloading] = useState(false)
  const scaleRef = useRef({ scale: 1, dx: 0, dy: 0 })

  const enabledCount = areas.filter(a => a.enabled).length

  // Load the image
  useEffect(() => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      imgRef.current = img
      setLoaded(true)
    }
    img.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Draw preview whenever areas, style, or options change
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || !loaded) return

    const container = canvas.parentElement
    if (container) {
      canvas.width = container.clientWidth
      canvas.height = Math.min(container.clientWidth * 0.75, 600)
    }

    const result = drawPreview(canvas, img, areas, style, { solidColor, blurRadius, pixelSize })
    if (result) scaleRef.current = result
  }, [areas, style, solidColor, blurRadius, pixelSize, loaded])

  useEffect(() => {
    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [draw])

  // Handle clicking on canvas to toggle areas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    const { scale, dx, dy } = scaleRef.current

    for (let i = areas.length - 1; i >= 0; i--) {
      const area = areas[i]
      const ax = dx + area.x * scale
      const ay = dy + area.y * scale
      const aw = area.width * scale
      const ah = area.height * scale
      const pad = 3 * scale

      if (clickX >= ax - pad && clickX <= ax + aw + pad && clickY >= ay - pad && clickY <= ay + ah + pad) {
        const updated = areas.map((a, idx) => idx === i ? { ...a, enabled: !a.enabled } : a)
        onAreasChange(updated)
        return
      }
    }
  }

  const toggleAll = (enabled: boolean) => {
    onAreasChange(areas.map(a => ({ ...a, enabled })))
  }

  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    setDownloading(true)
    try {
      const blob = await redactImage(file, areas, style, { solidColor, blurRadius, pixelSize })
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
      alert('Gagal menyalin gambar. Pastikan browser Anda mengizinkan akses clipboard.')
    } finally {
      setDownloading(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const blob = await redactImage(file, areas, style, { solidColor, blurRadius, pixelSize })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace(/\.[^.]+$/, '') + '_redacted.png'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <section className="workspace image-workspace">
      <Button variant="bare" className="back" onClick={onBack}>
        <ArrowLeft size={16} /> {t('changeFile')}
      </Button>

      <div className="workspace-head">
        <div>
          <Eyebrow>{t('imgPreview')}</Eyebrow>
          <h1>{t('imgTitle')}</h1>
          <p>{t('imgDesc')}</p>
        </div>
        <div className="file-chip">
          <Paintbrush />
          <span>
            <b>{file.name}</b>
            <small>{areas.length} {t('imgDetected')} · {enabledCount} {t('imgEnabled')}</small>
          </span>
        </div>
      </div>

      <div className="image-preview-layout">
        {/* Canvas preview */}
        <Card className="canvas-card">
          <canvas
            ref={canvasRef}
            className="preview-canvas"
            onClick={handleCanvasClick}
            style={{ cursor: areas.length > 0 ? 'pointer' : 'default' }}
          />
          {!loaded && <div className="canvas-loading">{t('imgProcessing')}</div>}
        </Card>

        {/* Controls sidebar */}
        <div className="image-controls">
          {/* Redaction style */}
          <Card className="control-card">
            <h3>{t('imgStyle')}</h3>
            <div className="style-options">
              {(['blur', 'pixelate', 'solid'] as RedactionStyle[]).map(s => (
                <button
                  key={s}
                  className={`style-option ${style === s ? 'active' : ''}`}
                  onClick={() => setStyle(s)}
                >
                  <span className={`style-preview style-preview-${s}`} />
                  <span>{t(s === 'blur' ? 'imgBlur' : s === 'pixelate' ? 'imgPixelate' : 'imgSolid')}</span>
                </button>
              ))}
            </div>

            {style === 'solid' && (
              <label className="control-row">
                <span>{t('imgColor')}</span>
                <input type="color" value={solidColor} onChange={e => setSolidColor(e.target.value)} />
              </label>
            )}
            {style === 'blur' && (
              <label className="control-row">
                <span>{t('imgRadius')}</span>
                <input type="range" min={5} max={50} value={blurRadius} onChange={e => setBlurRadius(Number(e.target.value))} />
                <code>{blurRadius}px</code>
              </label>
            )}
            {style === 'pixelate' && (
              <label className="control-row">
                <span>{t('imgPixelSize')}</span>
                <input type="range" min={4} max={30} value={pixelSize} onChange={e => setPixelSize(Number(e.target.value))} />
                <code>{pixelSize}px</code>
              </label>
            )}
          </Card>

          {/* Area list */}
          <Card className="control-card area-list-card">
            <div className="area-list-header">
              <h3>{t('imgDetected')} ({areas.length})</h3>
              <div className="area-toggle-buttons">
                <button className="area-toggle-btn" onClick={() => toggleAll(true)} title={t('imgToggleAll')}>
                  <CheckSquare size={14} />
                </button>
                <button className="area-toggle-btn" onClick={() => toggleAll(false)} title={t('imgUntoggleAll')}>
                  <Square size={14} />
                </button>
              </div>
            </div>
            {areas.length === 0 && (
              <Alert className="no-areas">{t('imgNoAreas')}</Alert>
            )}
            <div className="area-list">
              {areas.map((area, i) => (
                <button
                  key={area.id}
                  className={`area-item ${area.enabled ? 'enabled' : 'disabled'}`}
                  onClick={() => {
                    const updated = areas.map((a, idx) => idx === i ? { ...a, enabled: !a.enabled } : a)
                    onAreasChange(updated)
                  }}
                >
                  <span className="area-check">
                    {area.enabled ? <Check size={12} /> : null}
                  </span>
                  <span className="area-text">
                    {area.text ? `"${area.text.slice(0, 30)}${area.text.length > 30 ? '…' : ''}"` : `Area ${i + 1}`}
                  </span>
                  <span className="area-icon">
                    {area.enabled ? <EyeOff size={13} /> : <Eye size={13} />}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Action bar */}
      <div className="actionbar">
        <div>
          <Paintbrush />
          <span>
            <b>{enabledCount} / {areas.length} {t('imgEnabled')}</b>
            <small>{t(style === 'blur' ? 'imgBlur' : style === 'pixelate' ? 'imgPixelate' : 'imgSolid')}</small>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="ghost" onClick={handleCopy} disabled={!enabledCount || downloading}>
            {copied ? <Check size={18} /> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>}
            {copied ? t('imgCopied') : t('imgCopy')}
          </Button>
          <Button onClick={handleDownload} disabled={!enabledCount || downloading}>
            <Download size={18} /> {downloading ? t('imgProcessing') : t('imgDownload')}
          </Button>
        </div>
      </div>
    </section>
  )
}
