import { useState, type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SidebarSectionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

export function SidebarSection({
  title,
  children,
  defaultOpen = true
}: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
          uppercase tracking-wider text-muted-foreground/70
          hover:text-muted-foreground transition-colors cursor-pointer"
      >
        <ChevronRight
          className={cn(
            'w-3 h-3 transition-transform duration-200',
            isOpen && 'rotate-90'
          )}
        />
        {title}
      </button>
      {isOpen && <div className="mt-0.5 space-y-0.5">{children}</div>}
    </div>
  )
}
