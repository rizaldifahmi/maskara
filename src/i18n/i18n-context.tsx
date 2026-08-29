import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { translations, type Language, type TranslationKey } from './translations'

interface I18nValue { language: Language; setLanguage: (language: Language) => void; t: (key: TranslationKey) => string }
const I18nContext = createContext<I18nValue | null>(null)
export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => localStorage.getItem('maskara-language') === 'id' ? 'id' : 'en')
  useEffect(() => { document.documentElement.lang = language; localStorage.setItem('maskara-language', language) }, [language])
  const value = useMemo<I18nValue>(() => ({ language, setLanguage: next => { setLanguageState(next); localStorage.setItem('maskara-language', next); document.documentElement.lang = next }, t: key => translations[language][key] }), [language])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
export function useI18n() { const context = useContext(I18nContext); if (!context) throw new Error('useI18n must be used inside I18nProvider'); return context }
