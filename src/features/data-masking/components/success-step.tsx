import { Check, Download, Upload } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Eyebrow } from '../../../components/shared/eyebrow'
import { useI18n } from '../../../i18n/i18n-context'
export function SuccessStep({ rowCount, onReset, onDownload }: { rowCount: number; onReset: () => void; onDownload: () => void }) { const { t, language } = useI18n(); return <section className="success"><div className="success-icon"><Check size={31}/></div><Eyebrow>{t('done')}</Eyebrow><h1>{t('safe')}</h1><p><b>{rowCount.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} {t('rows')}</b> {t('processed')}</p><Button onClick={onReset}><Upload size={17}/> {t('another')}</Button><Button variant="ghost" onClick={onDownload}><Download size={17}/> {t('redownload')}</Button></section> }
