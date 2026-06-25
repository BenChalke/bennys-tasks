import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpWideShort, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { useTodoStore } from '@/store/useTodoStore'
import { useStats } from '@/store/selectors'
import { cn } from '@/lib/utils'
import { Select } from './ui/Select'
import type { SortKey, StatusFilter } from '@/types'

const STATUS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Done' },
]

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'manual', label: 'Manual order' },
  { value: 'priority', label: 'Priority' },
  { value: 'dueDate', label: 'Due date' },
  { value: 'alpha', label: 'Alphabetical' },
  { value: 'created', label: 'Recently added' },
]

export function FilterBar() {
  const statusFilter = useTodoStore((s) => s.statusFilter)
  const setStatusFilter = useTodoStore((s) => s.setStatusFilter)
  const sort = useTodoStore((s) => s.sort)
  const setSort = useTodoStore((s) => s.setSort)
  const clearCompleted = useTodoStore((s) => s.clearCompleted)
  const stats = useStats()

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
        {STATUS.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={cn(
              'relative rounded-lg px-3 py-1.5 text-sm font-medium transition',
              statusFilter === s.value
                ? 'bg-brand-500/10 text-brand-700 dark:text-brand-300'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <Select
        ariaLabel="Sort tasks"
        className="ml-auto w-44"
        leading={
          <FontAwesomeIcon
            icon={faArrowUpWideShort}
            className="shrink-0 text-sm text-slate-400"
          />
        }
        value={sort}
        onChange={(v) => setSort(v as SortKey)}
        options={SORTS}
      />

      {stats.completed > 0 && (
        <button
          onClick={clearCompleted}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 transition hover:border-rose-300 hover:text-rose-500 dark:border-slate-800"
        >
          <FontAwesomeIcon icon={faTrashCan} className="text-sm" />
          Clear done
        </button>
      )}
    </div>
  )
}
