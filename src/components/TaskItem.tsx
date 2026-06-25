import { memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faCheck,
  faGripVertical,
  faPencil,
  faTrashCan,
  faClock,
  faChevronUp,
  faAnglesUp,
} from '@fortawesome/free-solid-svg-icons'
import { useTodoStore } from '@/store/useTodoStore'
import { cn, getDueState, PRIORITY_META } from '@/lib/utils'
import { categoryIcon } from '@/lib/categoryIcons'
import type { Priority, Task } from '@/types'

interface TaskItemProps {
  task: Task
  onEdit: (task: Task) => void
  sortable: boolean
}

const dueToneClass: Record<string, string> = {
  overdue: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  today: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  soon: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  normal: 'bg-slate-500/10 text-slate-500 dark:text-slate-400',
}

// Only high/medium get a chip — low stays unmarked to keep cards quiet.
const priorityChipClass: Record<Priority, string> = {
  high: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  low: '',
}

// The checkbox ring is tinted by priority so every card signals it at a glance.
const checkboxRingClass: Record<Priority, string> = {
  high: 'border-rose-400 hover:border-rose-500 dark:border-rose-500/70',
  medium: 'border-amber-400 hover:border-amber-500 dark:border-amber-500/70',
  low: 'border-slate-300 hover:border-brand-400 dark:border-slate-600',
}

const priorityIcon: Record<Priority, IconDefinition | null> = {
  high: faAnglesUp,
  medium: faChevronUp,
  low: null,
}

function TaskItemImpl({ task, onEdit, sortable }: TaskItemProps) {
  const toggleTask = useTodoStore((s) => s.toggleTask)
  const deleteTask = useTodoStore((s) => s.deleteTask)
  const category = useTodoStore((s) =>
    task.categoryId ? s.categories.find((c) => c.id === task.categoryId) : undefined,
  )

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, disabled: !sortable })

  const meta = PRIORITY_META[task.priority]
  const due = getDueState(task.dueDate, task.completed)
  const PriorityIcon = priorityIcon[task.priority]

  return (
    <motion.li
      ref={setNodeRef}
      // Only opacity is animated by Framer Motion. `transform` is owned
      // exclusively by dnd-kit (below) so the drag is actually visible —
      // animating transform here would override dnd-kit and freeze the item.
      initial={{ opacity: 0 }}
      animate={{ opacity: task.completed ? 0.55 : 1 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2 }}
      style={{
        // Only translate — never scale. dnd-kit folds a scaleX/scaleY into
        // `transform` to morph the dragged card to the size of the item it's
        // over, which visibly distorts cards of differing heights.
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 20 : undefined,
      }}
      className={cn(
        'group surface relative flex items-start gap-3 rounded-2xl p-3.5 shadow-soft transition-colors',
        'hover:border-slate-300 dark:hover:border-slate-700',
        isDragging && 'shadow-pop ring-2 ring-brand-500/50',
      )}
    >
      {sortable && (
        <button
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="mt-0.5 hidden cursor-grab touch-none text-slate-300 transition hover:text-slate-500 active:cursor-grabbing group-hover:block sm:block dark:text-slate-600"
        >
          <FontAwesomeIcon icon={faGripVertical} className="text-lg" />
        </button>
      )}

      <button
        onClick={() => toggleTask(task.id)}
        aria-label={task.completed ? 'Mark as not done' : 'Mark as done'}
        className={cn(
          'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 transition',
          task.completed
            ? 'border-transparent bg-brand-600 text-white'
            : cn('text-transparent', checkboxRingClass[task.priority]),
        )}
      >
        <FontAwesomeIcon icon={faCheck} className="text-[0.6rem]" />
      </button>

      <div
        className="min-w-0 flex-1 cursor-pointer"
        onClick={() => onEdit(task)}
      >
        <p
          className={cn(
            'text-sm font-medium leading-snug break-words',
            task.completed && 'line-through',
          )}
        >
          {task.title}
        </p>
        {task.notes && (
          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
            {task.notes}
          </p>
        )}

        {(due ||
          category ||
          task.tags.length > 0 ||
          task.priority !== 'low') && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {due && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium',
                  dueToneClass[due.tone],
                )}
              >
                <FontAwesomeIcon icon={faClock} className="text-[0.7rem]" />
                {due.label}
              </span>
            )}
            {category && (
              <span
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium"
                style={{
                  backgroundColor: `${category.color}1a`,
                  color: category.color,
                }}
              >
                <FontAwesomeIcon
                  icon={categoryIcon(category.icon)}
                  className="text-[0.65rem]"
                />
                {category.name}
              </span>
            )}
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-slate-500/10 px-1.5 py-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400"
              >
                #{tag}
              </span>
            ))}
            {PriorityIcon && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium',
                  priorityChipClass[task.priority],
                )}
              >
                <FontAwesomeIcon icon={PriorityIcon} className="text-xs" />
                {meta.label}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
        <button
          onClick={() => onEdit(task)}
          aria-label="Edit task"
          className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-500/10 hover:text-slate-700 dark:hover:text-slate-200"
        >
          <FontAwesomeIcon icon={faPencil} className="text-sm" />
        </button>
        <button
          onClick={() => deleteTask(task.id)}
          aria-label="Delete task"
          className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500"
        >
          <FontAwesomeIcon icon={faTrashCan} className="text-sm" />
        </button>
      </div>
    </motion.li>
  )
}

export const TaskItem = memo(TaskItemImpl)
