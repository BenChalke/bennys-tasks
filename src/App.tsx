import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { StatsBar } from './components/StatsBar'
import { FilterBar } from './components/FilterBar'
import { TaskList } from './components/TaskList'
import { TaskFormModal } from './components/TaskFormModal'
import { useApplyTheme } from './hooks/useApplyTheme'
import { useHotkeys } from './hooks/useHotkeys'
import type { Task } from './types'

export default function App() {
  useApplyTheme()

  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const openNew = useCallback(() => {
    setEditingTask(null)
    setFormOpen(true)
  }, [])

  const openEdit = useCallback((task: Task) => {
    setEditingTask(task)
    setFormOpen(true)
  }, [])

  const focusSearch = useCallback(() => searchRef.current?.focus(), [])
  const closeAll = useCallback(() => {
    setFormOpen(false)
    setDrawerOpen(false)
  }, [])

  useHotkeys({
    onNew: openNew,
    onSearch: focusSearch,
    onEscape: closeAll,
  })

  return (
    <div className="app-shell min-h-dvh">
      <div className="mx-auto flex min-h-dvh max-w-7xl">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 overflow-y-auto border-r border-slate-200 lg:block dark:border-slate-800">
          <Sidebar />
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {drawerOpen && (
            <motion.div
              className="fixed inset-0 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-black/60"
                onClick={() => setDrawerOpen(false)}
              />
              <motion.aside
                className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-white dark:bg-slate-900"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
              >
                <Sidebar onNavigate={() => setDrawerOpen(false)} />
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            <Header
              onNewTask={openNew}
              onMenu={() => setDrawerOpen(true)}
              searchRef={searchRef}
            />
            <StatsBar />
            <FilterBar />
            <TaskList onEdit={openEdit} />
            <footer className="pt-4 text-center text-xs text-slate-400">
              Built by Ben Chalke · React 19 · TypeScript · Tailwind
            </footer>
          </div>
        </main>
      </div>

      <TaskFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        task={editingTask}
      />
    </div>
  )
}
