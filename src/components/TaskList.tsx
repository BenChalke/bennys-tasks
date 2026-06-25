import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { AnimatePresence } from 'framer-motion'
import { TaskItem } from './TaskItem'
import { EmptyState } from './EmptyState'
import { useVisibleTasks } from '@/store/selectors'
import { useTodoStore } from '@/store/useTodoStore'
import type { Task } from '@/types'

interface TaskListProps {
  onEdit: (task: Task) => void
}

export function TaskList({ onEdit }: TaskListProps) {
  const tasks = useVisibleTasks()
  const sort = useTodoStore((s) => s.sort)
  const search = useTodoStore((s) => s.search)
  const reorderTasks = useTodoStore((s) => s.reorderTasks)

  // Drag-to-reorder only makes sense for manual ordering.
  const sortable = sort === 'manual'
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = tasks.map((t) => t.id)
    const oldIndex = ids.indexOf(active.id as string)
    const newIndex = ids.indexOf(over.id as string)
    reorderTasks(arrayMove(ids, oldIndex, newIndex))
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        title={search ? 'No matching tasks' : 'All caught up'}
        subtitle={
          search
            ? 'Try a different search or clear your filters.'
            : 'Add a task to get started — press “n” anytime.'
        }
      />
    )
  }

  const ids = tasks.map((t) => t.id)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2.5">
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onEdit={onEdit}
                sortable={sortable}
              />
            ))}
          </AnimatePresence>
        </ul>
      </SortableContext>
    </DndContext>
  )
}
