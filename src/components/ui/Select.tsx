import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  /** Optional visual shown before the label (icon, color dot, etc.). */
  leading?: ReactNode
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  ariaLabel?: string
  /** Applied to the root wrapper — use it to control width. */
  className?: string
  /** Optional visual shown at the start of the trigger (e.g. a sort icon). */
  leading?: ReactNode
}

const TRIGGER =
  'flex w-full items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-left text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800/50'

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  ariaLabel,
  className,
  leading,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selectedIndex = options.findIndex((o) => o.value === value)
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined

  // Close on any click outside the component while open.
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  function openMenu() {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setOpen(true)
  }

  // Keep the highlighted option scrolled into view.
  useEffect(() => {
    if (!open || activeIndex < 0) return
    const node = listRef.current?.children[activeIndex] as HTMLElement | undefined
    node?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  function choose(index: number) {
    const option = options[index]
    if (option) {
      onChange(option.value)
      setOpen(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!open) openMenu()
        else setActiveIndex((i) => Math.min(options.length - 1, i + 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        if (!open) openMenu()
        else setActiveIndex((i) => Math.max(0, i - 1))
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (open) choose(activeIndex)
        else openMenu()
        break
      case 'Escape':
        if (open) {
          // Close only the dropdown — don't let a parent (e.g. modal) also close.
          e.preventDefault()
          e.stopPropagation()
          e.nativeEvent.stopImmediatePropagation()
          setOpen(false)
        }
        break
      case 'Home':
        if (open) {
          e.preventDefault()
          setActiveIndex(0)
        }
        break
      case 'End':
        if (open) {
          e.preventDefault()
          setActiveIndex(options.length - 1)
        }
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        className={TRIGGER}
      >
        {leading}
        <span
          className={cn(
            'flex flex-1 items-center gap-2 truncate',
            !selected && 'text-slate-400',
          )}
        >
          {selected ? (
            <>
              {selected.leading}
              <span className="truncate">{selected.label}</span>
            </>
          ) : (
            placeholder
          )}
        </span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={cn(
            'shrink-0 text-xs text-slate-400 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            role="listbox"
            aria-label={ariaLabel}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="surface absolute left-0 top-full z-50 mt-1.5 max-h-60 w-full min-w-max overflow-auto rounded-xl p-1 shadow-pop"
          >
            {options.map((option, i) => {
              const isSelected = option.value === value
              const isActive = i === activeIndex
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => choose(i)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-brand-500/10 text-brand-700 dark:text-brand-200'
                      : 'text-slate-700 dark:text-slate-200',
                  )}
                >
                  {option.leading}
                  <span className="flex-1 truncate">{option.label}</span>
                  {isSelected && (
                    <FontAwesomeIcon
                      icon={faCheck}
                      className="shrink-0 text-sm text-brand-500"
                    />
                  )}
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
