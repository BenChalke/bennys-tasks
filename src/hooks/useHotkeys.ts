import { useEffect } from 'react'

type Handlers = {
  onNew?: () => void
  onSearch?: () => void
  onEscape?: () => void
}

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  const tag = el.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    el.isContentEditable
  )
}

/** Global keyboard shortcuts: `n` new task, `/` focus search, `Esc` close. */
export function useHotkeys({ onNew, onSearch, onEscape }: Handlers) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onEscape?.()
        return
      }
      if (isTypingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'n') {
        e.preventDefault()
        onNew?.()
      } else if (e.key === '/') {
        e.preventDefault()
        onSearch?.()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onNew, onSearch, onEscape])
}
