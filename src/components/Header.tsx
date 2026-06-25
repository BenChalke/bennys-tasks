import type { RefObject } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMagnifyingGlass,
  faPlus,
  faMoon,
  faSun,
  faBars,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { useTodoStore } from '@/store/useTodoStore'
import type { Selection } from '@/store/useTodoStore'

const titleFor = (selection: Selection, categoryName?: string): string => {
  if (selection.kind === 'category') return categoryName ?? 'List'
  return {
    all: 'All tasks',
    today: 'Today',
    upcoming: 'Upcoming',
    completed: 'Completed',
  }[selection.view]
}

interface HeaderProps {
  onNewTask: () => void
  onMenu: () => void
  searchRef: RefObject<HTMLInputElement | null>
}

export function Header({ onNewTask, onMenu, searchRef }: HeaderProps) {
  const selection = useTodoStore((s) => s.selection)
  const categories = useTodoStore((s) => s.categories)
  const search = useTodoStore((s) => s.search)
  const setSearch = useTodoStore((s) => s.setSearch)
  const theme = useTodoStore((s) => s.theme)
  const toggleTheme = useTodoStore((s) => s.toggleTheme)

  const categoryName =
    selection.kind === 'category'
      ? categories.find((c) => c.id === selection.id)?.name
      : undefined

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          aria-label="Open menu"
          className="grid size-10 place-items-center rounded-xl border border-slate-200 lg:hidden dark:border-slate-800"
        >
          <FontAwesomeIcon icon={faBars} className="text-xl" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {titleFor(selection, categoryName)}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:flex-none">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400"
          />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…  ( / )"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 sm:w-56 dark:border-slate-800 dark:bg-slate-900"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <FontAwesomeIcon icon={faXmark} className="text-sm" />
            </button>
          )}
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/60"
        >
          <FontAwesomeIcon
            icon={theme === 'dark' ? faSun : faMoon}
            className="text-xl"
          />
        </button>

        <button
          onClick={onNewTask}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 active:scale-[0.98]"
        >
          <FontAwesomeIcon icon={faPlus} className="text-sm" />
          <span className="hidden sm:inline">New task</span>
        </button>
      </div>
    </header>
  )
}
