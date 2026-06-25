import { useMemo } from 'react'
import { isToday, isPast, parseISO } from 'date-fns'
import { useTodoStore } from './useTodoStore'
import { PRIORITY_META } from '@/lib/utils'
import type { Task } from '@/types'

/** Upcoming = has a due date that is today or in the future. */
function isUpcoming(task: Task): boolean {
  if (!task.dueDate) return false
  const d = parseISO(task.dueDate)
  return isToday(d) || !isPast(d)
}

export function useVisibleTasks() {
  const tasks = useTodoStore((s) => s.tasks)
  const selection = useTodoStore((s) => s.selection)
  const search = useTodoStore((s) => s.search)
  const statusFilter = useTodoStore((s) => s.statusFilter)
  const sort = useTodoStore((s) => s.sort)
  const tagFilter = useTodoStore((s) => s.tagFilter)

  return useMemo(() => {
    const q = search.trim().toLowerCase()

    const filtered = tasks.filter((t) => {
      // selection scope
      if (selection.kind === 'category') {
        if (t.categoryId !== selection.id) return false
      } else if (selection.view === 'today') {
        if (!t.dueDate || !isToday(parseISO(t.dueDate))) return false
      } else if (selection.view === 'upcoming') {
        if (!isUpcoming(t)) return false
      } else if (selection.view === 'completed') {
        if (!t.completed) return false
      }

      // status filter (ignored inside the dedicated Completed view)
      if (selection.kind === 'view' && selection.view === 'completed') {
        // show all completed
      } else if (statusFilter === 'active' && t.completed) {
        return false
      } else if (statusFilter === 'completed' && !t.completed) {
        return false
      }

      // tag filter
      if (tagFilter && !t.tags.includes(tagFilter)) return false

      // text search
      if (q) {
        const hay = `${t.title} ${t.notes} ${t.tags.join(' ')}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })

    const byKey = (a: Task, b: Task): number => {
      switch (sort) {
        case 'priority':
          return (
            PRIORITY_META[b.priority].weight -
            PRIORITY_META[a.priority].weight
          )
        case 'dueDate': {
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return a.dueDate.localeCompare(b.dueDate)
        }
        case 'alpha':
          return a.title.localeCompare(b.title)
        case 'created':
          return b.createdAt - a.createdAt
        case 'manual':
        default:
          return a.order - b.order
      }
    }

    return [...filtered].sort((a, b) => {
      // Completed tasks sink to the bottom (except in the Completed view).
      const inCompletedView =
        selection.kind === 'view' && selection.view === 'completed'
      if (!inCompletedView && a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      return byKey(a, b)
    })
  }, [tasks, selection, search, statusFilter, sort, tagFilter])
}

export function useStats() {
  const tasks = useTodoStore((s) => s.tasks)
  return useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.completed).length
    const active = total - completed
    const overdue = tasks.filter(
      (t) =>
        !t.completed &&
        t.dueDate &&
        isPast(parseISO(t.dueDate)) &&
        !isToday(parseISO(t.dueDate)),
    ).length
    const dueToday = tasks.filter(
      (t) => !t.completed && t.dueDate && isToday(parseISO(t.dueDate)),
    ).length
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100)
    return { total, completed, active, overdue, dueToday, rate }
  }, [tasks])
}

export function useAllTags() {
  const tasks = useTodoStore((s) => s.tasks)
  return useMemo(() => {
    const counts = new Map<string, number>()
    for (const t of tasks) {
      for (const tag of t.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }))
  }, [tasks])
}

export function useCategoryCounts() {
  const tasks = useTodoStore((s) => s.tasks)
  return useMemo(() => {
    const counts = new Map<string, number>()
    for (const t of tasks) {
      if (t.completed) continue
      if (t.categoryId) counts.set(t.categoryId, (counts.get(t.categoryId) ?? 0) + 1)
    }
    return counts
  }, [tasks])
}
