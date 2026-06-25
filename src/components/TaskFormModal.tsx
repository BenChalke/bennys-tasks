import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { Modal } from './Modal'
import { Select } from './ui/Select'
import { useTodoStore } from '@/store/useTodoStore'
import { cn, PRIORITY_META } from '@/lib/utils'
import { categoryIcon } from '@/lib/categoryIcons'
import type { Priority, Task, TaskDraft } from '@/types'

interface TaskFormModalProps {
  open: boolean
  onClose: () => void
  /** When provided, the form edits this task; otherwise it creates one. */
  task?: Task | null
}

function draftFromTask(task?: Task | null): TaskDraft {
  if (!task) {
    return {
      title: '',
      notes: '',
      priority: 'medium',
      categoryId: null,
      tags: [],
      dueDate: null,
    }
  }
  return {
    title: task.title,
    notes: task.notes,
    priority: task.priority,
    categoryId: task.categoryId,
    tags: [...task.tags],
    dueDate: task.dueDate,
  }
}

export function TaskFormModal({ open, onClose, task }: TaskFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={task ? 'Edit task' : 'New task'}>
      {/* Keyed so the form's state re-initializes for each task / new entry,
          instead of syncing props into state with an effect. */}
      <TaskForm key={task?.id ?? 'new'} task={task} onClose={onClose} />
    </Modal>
  )
}

function TaskForm({
  task,
  onClose,
}: {
  task?: Task | null
  onClose: () => void
}) {
  const categories = useTodoStore((s) => s.categories)
  const addTask = useTodoStore((s) => s.addTask)
  const updateTask = useTodoStore((s) => s.updateTask)

  const [draft, setDraft] = useState<TaskDraft>(() => draftFromTask(task))
  const [tagInput, setTagInput] = useState('')
  const titleRef = useRef<HTMLInputElement>(null)

  // Focus the title field when the form mounts (no state writes here).
  useEffect(() => {
    const id = requestAnimationFrame(() => titleRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [])

  function commitTag() {
    const value = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (value && !draft.tags.includes(value)) {
      setDraft((d) => ({ ...d, tags: [...d.tags, value] }))
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    setDraft((d) => ({ ...d, tags: d.tags.filter((t) => t !== tag) }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.title.trim()) {
      titleRef.current?.focus()
      return
    }
    if (task) updateTask(task.id, draft)
    else addTask(draft)
    onClose()
  }

  const field =
    'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800/50'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Title
          </label>
          <input
            ref={titleRef}
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            placeholder="What needs to be done?"
            className={field}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Notes
          </label>
          <textarea
            value={draft.notes}
            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
            placeholder="Add details…"
            rows={2}
            className={cn(field, 'resize-none')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Due date
            </label>
            <input
              type="date"
              value={draft.dueDate ?? ''}
              onChange={(e) =>
                setDraft((d) => ({ ...d, dueDate: e.target.value || null }))
              }
              className={field}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              List
            </label>
            <Select
              ariaLabel="List"
              value={draft.categoryId ?? ''}
              onChange={(v) =>
                setDraft((d) => ({ ...d, categoryId: v || null }))
              }
              options={[
                { value: '', label: 'No list' },
                ...categories.map((c) => ({
                  value: c.id,
                  label: c.name,
                  leading: (
                    <FontAwesomeIcon
                      icon={categoryIcon(c.icon)}
                      className="text-xs"
                      style={{ color: c.color }}
                    />
                  ),
                })),
              ]}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Priority
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as Priority[]).map((p) => {
              const active = draft.priority === p
              const meta = PRIORITY_META[p]
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, priority: p }))}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition',
                    active
                      ? 'border-brand-500 bg-brand-500/10 text-slate-900 dark:text-white'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/60',
                  )}
                >
                  <span className={cn('size-2 rounded-full', meta.dot)} />
                  {meta.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Tags
          </label>
          <div className={cn(field, 'flex flex-wrap items-center gap-1.5')}>
            {draft.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-brand-500/10 px-2 py-0.5 text-xs font-medium text-brand-600 dark:text-brand-300"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="opacity-60 transition hover:opacity-100"
                  aria-label={`Remove ${tag}`}
                >
                  <FontAwesomeIcon icon={faXmark} className="text-xs" />
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault()
                  commitTag()
                } else if (e.key === 'Backspace' && !tagInput && draft.tags.length) {
                  removeTag(draft.tags[draft.tags.length - 1])
                }
              }}
              onBlur={commitTag}
              placeholder={draft.tags.length ? '' : 'Add tags…'}
              className="min-w-[6rem] flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 active:scale-[0.98]"
          >
            {task ? 'Save changes' : 'Add task'}
          </button>
        </div>
    </form>
  )
}
