import { useI18n } from '../../i18n/i18n-context'
export function AppFooter() { const { t } = useI18n(); return <footer><span>maskara</span><p>© 2026 <a href="https://fahmirizaldi.com" target="_blank" rel="noreferrer">Fahmi Rizaldi</a></p><small>{t('localProcess')}</small></footer> }
