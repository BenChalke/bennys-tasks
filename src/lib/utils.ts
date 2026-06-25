import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  format,
  isToday,
  isTomorrow,
  isPast,
  isThisYear,
  parseISO,
  differenceInCalendarDays,
} from 'date-fns'
import type { Priority } from '@/types'

/** Merge Tailwind classes without conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function uid() {
  return crypto.randomUUID()
}

export const PRIORITY_META: Record<
  Priority,
  { label: string; weight: number; dot: string; text: string; ring: string }
> = {
  high: {
    label: 'High',
    weight: 3,
    dot: 'bg-rose-500',
    text: 'text-rose-600 dark:text-rose-400',
    ring: 'ring-rose-500/30',
  },
  medium: {
    label: 'Medium',
    weight: 2,
    dot: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500/30',
  },
  low: {
    label: 'Low',
    weight: 1,
    dot: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/30',
  },
}

export const CATEGORY_COLORS = [
  '#6366f1',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#8b5cf6',
  '#ef4444',
  '#14b8a6',
]

/** Human-friendly due-date label, e.g. "Today", "Tomorrow", "Mar 14". */
export function formatDueDate(iso: string | null): string | null {
  if (!iso) return null
  const date = parseISO(iso)
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  return format(date, isThisYear(date) ? 'MMM d' : 'MMM d, yyyy')
}

export interface DueState {
  label: string
  tone: 'overdue' | 'today' | 'soon' | 'normal'
}

export function getDueState(
  iso: string | null,
  completed: boolean,
): DueState | null {
  if (!iso) return null
  const label = formatDueDate(iso)!
  if (completed) return { label, tone: 'normal' }
  const date = parseISO(iso)
  if (isToday(date)) return { label, tone: 'today' }
  if (isPast(date)) return { label, tone: 'overdue' }
  if (differenceInCalendarDays(date, new Date()) <= 3)
    return { label, tone: 'soon' }
  return { label, tone: 'normal' }
}

export function todayISO() {
  return format(new Date(), 'yyyy-MM-dd')
}
