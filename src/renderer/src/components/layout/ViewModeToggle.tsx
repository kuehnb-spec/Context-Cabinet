import { motion } from 'framer-motion'
import { LayoutGrid, Rows3 } from 'lucide-react'
import { useUIStore, type ViewMode } from '../../stores/ui-store'

const modes: { value: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { value: 'simple', label: 'Simple', icon: Rows3 },
  { value: 'complete', label: 'Complete', icon: LayoutGrid }
]

export function ViewModeToggle() {
  const viewMode = useUIStore((s) => s.viewMode)
  const setViewMode = useUIStore((s) => s.setViewMode)

  return (
    <div className="no-drag view-mode-toggle relative flex items-center rounded-lg p-0.5 h-7">
      {/* Sliding background pill */}
      <motion.div
        className="absolute top-0.5 bottom-0.5 rounded-md view-mode-pill"
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        style={{
          left: viewMode === 'simple' ? '2px' : '50%',
          right: viewMode === 'complete' ? '2px' : '50%'
        }}
      />

      {modes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setViewMode(value)}
          className={`
            relative z-10 flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium
            transition-colors duration-200 cursor-pointer
            ${viewMode === value ? 'view-mode-active' : 'view-mode-inactive'}
          `}
        >
          <Icon className="w-3 h-3" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
