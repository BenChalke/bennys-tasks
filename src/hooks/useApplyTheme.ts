import { useEffect } from 'react'
import { useTodoStore } from '@/store/useTodoStore'

/** Keeps the <html> `dark` class and color-scheme in sync with the store. */
export function useApplyTheme() {
  const theme = useTodoStore((s) => s.theme)
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
  }, [theme])
}
