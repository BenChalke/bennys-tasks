export type Priority = 'low' | 'medium' | 'high'

export type SmartView = 'all' | 'today' | 'upcoming' | 'completed'

export type SortKey = 'manual' | 'priority' | 'dueDate' | 'alpha' | 'created'

export type StatusFilter = 'all' | 'active' | 'completed'

export interface Task {
  id: string
  title: string
  notes: string
  priority: Priority
  completed: boolean
  categoryId: string | null
  tags: string[]
  /** ISO date string (yyyy-mm-dd) or null */
  dueDate: string | null
  createdAt: number
  completedAt: number | null
  /** manual sort position */
  order: number
}

export interface Category {
  id: string
  name: string
  color: string
  /** Key into CATEGORY_ICONS (Font Awesome). */
  icon: string
}

/** Draft shape used by create/edit forms */
export type TaskDraft = Pick<
  Task,
  'title' | 'notes' | 'priority' | 'categoryId' | 'tags' | 'dueDate'
>
