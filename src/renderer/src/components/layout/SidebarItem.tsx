import { type LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SidebarItemProps {
  label: string
  icon: LucideIcon
  isActive?: boolean
  statusColor?: string
  onClick: () => void
  indent?: boolean
}

export function SidebarItem({
  label,
  icon: Icon,
  isActive,
  statusColor,
  onClick,
  indent
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer',
        indent && 'pl-7',
        isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="truncate flex-1 text-left">{label}</span>
      {statusColor && (
        <div
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: statusColor }}
        />
      )}
    </button>
  )
}
