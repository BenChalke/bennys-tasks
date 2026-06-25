import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons'

export function EmptyState({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="grid place-items-center rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-800"
    >
      <div className="grid size-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">
        <FontAwesomeIcon icon={faClipboardCheck} className="text-[1.75rem]" />
      </div>
      <p className="mt-4 text-sm font-semibold">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">
        {subtitle}
      </p>
    </motion.div>
  )
}
