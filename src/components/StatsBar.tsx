import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faListCheck,
  faFire,
  faCalendarDay,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { ProgressRing } from './ProgressRing'
import { useStats } from '@/store/selectors'

const cards = [
  { key: 'active', label: 'Active', icon: faListCheck, tint: 'text-brand-500' },
  { key: 'dueToday', label: 'Due today', icon: faCalendarDay, tint: 'text-sky-500' },
  { key: 'overdue', label: 'Overdue', icon: faCircleExclamation, tint: 'text-rose-500' },
  { key: 'completed', label: 'Completed', icon: faFire, tint: 'text-emerald-500' },
] as const

export function StatsBar() {
  const stats = useStats()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface flex flex-col gap-4 rounded-2xl p-4 shadow-soft sm:flex-row sm:items-center"
    >
      <div className="flex items-center gap-3 pr-2 sm:border-r sm:border-slate-200 sm:pr-5 dark:sm:border-slate-800">
        <ProgressRing value={stats.rate} />
        <div>
          <p className="text-sm font-semibold leading-tight">Progress</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {stats.completed} of {stats.total} done
          </p>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map(({ key, label, icon: Icon, tint }) => (
          <div key={key} className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800/60">
              <FontAwesomeIcon icon={Icon} className={`text-lg ${tint}`} />
            </div>
            <div>
              <p className="font-display text-lg font-semibold leading-none tabular-nums">
                {stats[key]}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
