import { useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark'
export type ThemeColor = 'zinc' | 'slate' | 'gray' | 'neutral' | 'stone'
export const THEME_COLORS: { value: ThemeColor; label: string }[] = [
  { value: 'zinc', label: 'Zinc' }, { value: 'slate', label: 'Slate' }, { value: 'gray', label: 'Gray' }, { value: 'neutral', label: 'Neutral' }, { value: 'stone', label: 'Stone' },
]

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('maskara-theme')
    return saved === 'light' || saved === 'dark' ? saved : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [color, setColor] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem('maskara-color')
    return THEME_COLORS.some(option => option.value === saved) ? saved as ThemeColor : 'zinc'
  })
  useEffect(() => { document.documentElement.dataset.theme = mode; document.documentElement.style.colorScheme = mode; localStorage.setItem('maskara-theme', mode); document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mode === 'dark' ? '#09090b' : '#ffffff') }, [mode])
  useEffect(() => { document.documentElement.dataset.palette = color; localStorage.setItem('maskara-color', color) }, [color])
  return { mode, color, setColor, toggleMode: () => setMode(current => current === 'light' ? 'dark' : 'light') }
}
