import { Search } from 'lucide-react'
import { useUIStore } from '../../stores/ui-store'
import { ViewModeToggle } from './ViewModeToggle'

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  editor: 'Editor',
  templates: 'Templates',
  scanner: 'Project Scanner',
  'tree-view': 'Tree View',
  'health-check': 'Health Check',
  'global-files': 'Global Files',
  'project-files': 'Project Files'
}

export function TitleBar() {
  const { currentPage, viewMode, toggleCommandPalette } = useUIStore()
  const title = viewMode === 'simple'
    ? 'Simple View'
    : pageTitles[currentPage.type] || 'Context Cabinet'

  return (
    <div className="drag-region relative h-12 flex items-center justify-between px-4 shrink-0 border-b border-border/50">
      {/* Left: page title (extra left padding in simple mode for traffic lights) */}
      <div className={`flex items-center gap-3 ${viewMode === 'simple' ? 'pl-20' : 'pl-16'}`}>
        <h1 className="text-sm font-medium text-foreground no-drag">{title}</h1>
      </div>

      {/* Center: view mode toggle */}
      <div className="absolute left-1/2 top-0 h-12 flex items-center -translate-x-1/2 z-10">
        <ViewModeToggle />
      </div>

      {/* Right: search trigger */}
      <button
        onClick={toggleCommandPalette}
        className="no-drag flex items-center gap-2 px-3 py-1.5 rounded-lg
          bg-muted/50 border border-border/50 text-muted-foreground text-xs
          hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Search</span>
        <kbd className="ml-2 text-[10px] opacity-60">⌘K</kbd>
      </button>
    </div>
  )
}
