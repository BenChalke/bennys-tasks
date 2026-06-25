import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faInbox,
  faSun,
  faCalendarWeek,
  faCircleCheck,
  faPlus,
  faHashtag,
  faTrashCan,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { useTodoStore, type Selection } from '@/store/useTodoStore'
import { useAllTags, useCategoryCounts } from '@/store/selectors'
import { cn, CATEGORY_COLORS } from '@/lib/utils'
import { CATEGORY_ICONS, categoryIcon } from '@/lib/categoryIcons'
import type { SmartView } from '@/types'

const VIEWS: { view: SmartView; label: string; icon: IconDefinition }[] = [
  { view: 'all', label: 'All tasks', icon: faInbox },
  { view: 'today', label: 'Today', icon: faSun },
  { view: 'upcoming', label: 'Upcoming', icon: faCalendarWeek },
  { view: 'completed', label: 'Completed', icon: faCircleCheck },
]

function isViewSelected(sel: Selection, view: SmartView) {
  return sel.kind === 'view' && sel.view === view
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const selection = useTodoStore((s) => s.selection)
  const setSelection = useTodoStore((s) => s.setSelection)
  const categories = useTodoStore((s) => s.categories)
  const addCategory = useTodoStore((s) => s.addCategory)
  const deleteCategory = useTodoStore((s) => s.deleteCategory)
  const tagFilter = useTodoStore((s) => s.tagFilter)
  const setTagFilter = useTodoStore((s) => s.setTagFilter)
  const counts = useCategoryCounts()
  const tags = useAllTags()

  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [colorIdx, setColorIdx] = useState(0)
  const [iconKey, setIconKey] = useState(CATEGORY_ICONS[0].key)

  function select(sel: Selection) {
    setSelection(sel)
    onNavigate?.()
  }

  function submitCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const id = addCategory(name, CATEGORY_COLORS[colorIdx], iconKey)
    setName('')
    setAdding(false)
    setColorIdx((i) => (i + 1) % CATEGORY_COLORS.length)
    select({ kind: 'category', id })
  }

  const itemBase =
    'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition'

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-2.5 px-2">
        <div className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white">
          <FontAwesomeIcon icon={faCircleCheck} className="text-xl" />
        </div>
        <div>
          <p className="font-display text-base font-bold leading-none tracking-tight">
            Flow
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Task manager
          </p>
        </div>
      </div>

      {/* Smart views */}
      <nav className="space-y-1">
        {VIEWS.map(({ view, label, icon }) => {
          const active = isViewSelected(selection, view)
          return (
            <button
              key={view}
              onClick={() => select({ kind: 'view', view })}
              className={cn(
                itemBase,
                active
                  ? 'bg-brand-500/10 text-brand-700 dark:text-brand-300'
                  : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800/60',
              )}
            >
              <FontAwesomeIcon
                icon={icon}
                fixedWidth
                className={cn('text-lg', active && 'text-brand-500')}
              />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Lists */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3 pb-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Lists
          </p>
          <button
            onClick={() => setAdding((v) => !v)}
            aria-label="Add list"
            className="grid size-6 place-items-center rounded-md text-slate-400 transition hover:bg-slate-500/10 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <FontAwesomeIcon icon={faPlus} className="text-sm" />
          </button>
        </div>

        {categories.map((c) => {
          const active = selection.kind === 'category' && selection.id === c.id
          return (
            <div key={c.id} className="group/cat relative">
              <button
                onClick={() => select({ kind: 'category', id: c.id })}
                className={cn(
                  itemBase,
                  'pr-9',
                  active
                    ? 'bg-slate-200/70 text-slate-900 dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800/60',
                )}
              >
                <span
                  className="grid size-5 place-items-center rounded-md text-[0.7rem]"
                  style={{ backgroundColor: `${c.color}26`, color: c.color }}
                >
                  <FontAwesomeIcon icon={categoryIcon(c.icon)} />
                </span>
                <span className="truncate">{c.name}</span>
                {counts.get(c.id) ? (
                  <span className="ml-auto text-xs text-slate-400">
                    {counts.get(c.id)}
                  </span>
                ) : null}
              </button>
              <button
                onClick={() => deleteCategory(c.id)}
                aria-label={`Delete ${c.name}`}
                className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-slate-400 opacity-0 transition hover:bg-rose-500/10 hover:text-rose-500 group-hover/cat:opacity-100"
              >
                <FontAwesomeIcon icon={faTrashCan} className="text-sm" />
              </button>
            </div>
          )
        })}

        <AnimatePresence>
          {adding && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={submitCategory}
              className="overflow-hidden px-1"
            >
              <div className="mt-1 space-y-2.5 rounded-xl border border-slate-200 p-2.5 dark:border-slate-800">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="List name"
                  className="w-full rounded-lg bg-slate-500/5 px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <div className="flex flex-wrap gap-1" role="group" aria-label="Icon">
                  {CATEGORY_ICONS.map(({ key, icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setIconKey(key)}
                      aria-label={`Icon ${key}`}
                      aria-pressed={iconKey === key}
                      className={cn(
                        'grid size-7 place-items-center rounded-md text-xs transition',
                        iconKey === key
                          ? 'bg-brand-500/15 text-brand-600 ring-2 ring-brand-400 dark:text-brand-300'
                          : 'text-slate-500 hover:bg-slate-500/10 dark:text-slate-400',
                      )}
                    >
                      <FontAwesomeIcon icon={icon} />
                    </button>
                  ))}
                </div>
                <div
                  className="flex flex-wrap items-center gap-1.5"
                  role="group"
                  aria-label="Color"
                >
                  {CATEGORY_COLORS.map((color, i) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setColorIdx(i)}
                      aria-label={`Color ${i + 1}`}
                      aria-pressed={colorIdx === i}
                      className={cn(
                        'size-5 rounded-full ring-offset-2 transition ring-offset-white dark:ring-offset-slate-900',
                        colorIdx === i && 'ring-2 ring-slate-400',
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAdding(false)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
                  >
                    Add
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="space-y-2">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Tags
          </p>
          <div className="flex flex-wrap gap-1.5 px-2">
            {tags.map(({ tag, count }) => {
              const active = tagFilter === tag
              return (
                <button
                  key={tag}
                  onClick={() => setTagFilter(active ? null : tag)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition',
                    active
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-500/5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
                  )}
                >
                  <FontAwesomeIcon
                    icon={active ? faXmark : faHashtag}
                    className="text-xs"
                  />
                  {tag}
                  <span className="opacity-60">{count}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
