import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Category,
  SmartView,
  SortKey,
  StatusFilter,
  Task,
  TaskDraft,
} from '@/types'
import { todayISO, uid } from '@/lib/utils'

export type Selection =
  | { kind: 'view'; view: SmartView }
  | { kind: 'category'; id: string }

interface TodoState {
  tasks: Task[]
  categories: Category[]

  // UI state
  selection: Selection
  search: string
  statusFilter: StatusFilter
  sort: SortKey
  tagFilter: string | null
  theme: 'light' | 'dark'

  // Task actions
  addTask: (draft: TaskDraft) => void
  updateTask: (id: string, patch: Partial<TaskDraft>) => void
  deleteTask: (id: string) => void
  toggleTask: (id: string) => void
  clearCompleted: () => void
  reorderTasks: (orderedVisibleIds: string[]) => void

  // Category actions
  addCategory: (name: string, color: string, icon: string) => string
  updateCategory: (id: string, patch: Partial<Omit<Category, 'id'>>) => void
  deleteCategory: (id: string) => void

  // UI actions
  setSelection: (selection: Selection) => void
  setSearch: (search: string) => void
  setStatusFilter: (status: StatusFilter) => void
  setSort: (sort: SortKey) => void
  setTagFilter: (tag: string | null) => void
  toggleTheme: () => void
}

function seed(): Pick<TodoState, 'tasks' | 'categories'> {
  const work = uid()
  const personal = uid()
  const health = uid()
  const t = (
    over: Partial<Task> & Pick<Task, 'title' | 'order'>,
  ): Task => ({
    id: uid(),
    notes: '',
    priority: 'medium',
    completed: false,
    categoryId: null,
    tags: [],
    dueDate: null,
    createdAt: Date.now() - over.order * 1000,
    completedAt: null,
    ...over,
  })

  return {
    categories: [
      { id: work, name: 'Work', color: '#6366f1', icon: 'briefcase' },
      { id: personal, name: 'Personal', color: '#ec4899', icon: 'seedling' },
      { id: health, name: 'Health', color: '#10b981', icon: 'running' },
    ],
    tasks: [
      t({
        title: 'Ship the portfolio redesign',
        notes: 'Polish the hero section and add case studies.',
        priority: 'high',
        categoryId: work,
        tags: ['design', 'urgent'],
        dueDate: todayISO(),
        order: 0,
      }),
      t({
        title: 'Review pull requests',
        priority: 'medium',
        categoryId: work,
        tags: ['code'],
        order: 1,
      }),
      t({
        title: 'Plan weekend hike',
        priority: 'low',
        categoryId: personal,
        tags: ['fun'],
        order: 2,
      }),
      t({
        title: 'Morning run — 5k',
        priority: 'medium',
        categoryId: health,
        tags: ['routine'],
        completed: true,
        completedAt: Date.now() - 3600_000,
        order: 3,
      }),
      t({
        title: 'Read "Refactoring" — chapter 4',
        priority: 'low',
        categoryId: personal,
        tags: ['learning'],
        order: 4,
      }),
    ],
  }
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      ...seed(),

      selection: { kind: 'view', view: 'all' },
      search: '',
      statusFilter: 'all',
      sort: 'manual',
      tagFilter: null,
      theme: 'dark',

      addTask: (draft) =>
        set((s) => {
          const minOrder = s.tasks.reduce(
            (m, x) => Math.min(m, x.order),
            0,
          )
          const task: Task = {
            id: uid(),
            ...draft,
            title: draft.title.trim(),
            completed: false,
            createdAt: Date.now(),
            completedAt: null,
            order: minOrder - 1,
          }
          return { tasks: [task, ...s.tasks] }
        }),

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, ...patch, title: (patch.title ?? t.title).trim() }
              : t,
          ),
        })),

      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  completed: !t.completed,
                  completedAt: !t.completed ? Date.now() : null,
                }
              : t,
          ),
        })),

      clearCompleted: () =>
        set((s) => ({ tasks: s.tasks.filter((t) => !t.completed) })),

      reorderTasks: (orderedVisibleIds) =>
        set((s) => {
          const sorted = [...s.tasks].sort((a, b) => a.order - b.order)
          const visible = new Set(orderedVisibleIds)
          let vi = 0
          const newGlobalOrder = sorted.map((t) =>
            visible.has(t.id) ? orderedVisibleIds[vi++] : t.id,
          )
          const orderMap = new Map(newGlobalOrder.map((id, i) => [id, i]))
          return {
            tasks: s.tasks.map((t) => ({
              ...t,
              order: orderMap.get(t.id) ?? t.order,
            })),
          }
        }),

      addCategory: (name, color, icon) => {
        const id = uid()
        set((s) => ({
          categories: [...s.categories, { id, name: name.trim(), color, icon }],
        }))
        return id
      },

      updateCategory: (id, patch) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        })),

      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          tasks: s.tasks.map((t) =>
            t.categoryId === id ? { ...t, categoryId: null } : t,
          ),
          selection:
            s.selection.kind === 'category' && s.selection.id === id
              ? { kind: 'view', view: 'all' }
              : s.selection,
        })),

      setSelection: (selection) => set({ selection, tagFilter: null }),
      setSearch: (search) => set({ search }),
      setStatusFilter: (statusFilter) => set({ statusFilter }),
      setSort: (sort) => set({ sort }),
      setTagFilter: (tagFilter) => set({ tagFilter }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
    }),
    {
      name: 'flow-todo-store',
      version: 1,
      partialize: (s) => ({
        tasks: s.tasks,
        categories: s.categories,
        theme: s.theme,
        sort: s.sort,
      }),
    },
  ),
)
