import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, FileText, FolderSearch, BookTemplate, GitBranch, Activity,
  LayoutDashboard, ArrowRight
} from 'lucide-react'
import { useUIStore, type PageType } from '../../stores/ui-store'
import { useFileStore } from '../../stores/file-store'
import { templates } from '../../data/templates'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: typeof FileText
  action: () => void
  group: string
}

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, navigateTo } = useUIStore()
  const globalFiles = useFileStore((s) => s.globalFiles)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when opened
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [commandPaletteOpen])

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCommandPaletteOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setCommandPaletteOpen])

  const allItems: CommandItem[] = useMemo(() => {
    const items: CommandItem[] = []

    // Navigation
    const pages: { type: PageType['type']; label: string; icon: typeof FileText }[] = [
      { type: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { type: 'global-files', label: 'Global Files', icon: FileText },
      { type: 'scanner', label: 'Project Scanner', icon: FolderSearch },
      { type: 'templates', label: 'Templates', icon: BookTemplate },
      { type: 'tree-view', label: 'Tree View', icon: GitBranch },
      { type: 'health-check', label: 'Health Check', icon: Activity }
    ]
    for (const page of pages) {
      items.push({
        id: `nav-${page.type}`,
        label: page.label,
        icon: page.icon,
        action: () => navigateTo({ type: page.type } as PageType),
        group: 'Navigation'
      })
    }

    // Files
    for (const file of globalFiles) {
      if (file.status === 'exists') {
        items.push({
          id: `file-${file.id}`,
          label: file.displayName,
          description: file.filename,
          icon: FileText,
          action: () => navigateTo({ type: 'editor', filePath: file.absolutePath }),
          group: 'Files'
        })
      }
    }

    // Templates (first 8)
    for (const template of templates.slice(0, 8)) {
      items.push({
        id: `template-${template.id}`,
        label: template.name,
        description: template.category,
        icon: BookTemplate,
        action: () => navigateTo({ type: 'templates' }),
        group: 'Templates'
      })
    }

    return items
  }, [globalFiles, navigateTo])

  const filtered = useMemo(() => {
    if (!query) return allItems
    const lower = query.toLowerCase()
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(lower) ||
        item.description?.toLowerCase().includes(lower) ||
        item.group.toLowerCase().includes(lower)
    )
  }, [allItems, query])

  // Group items
  const grouped = useMemo(() => {
    const groups = new Map<string, CommandItem[]>()
    for (const item of filtered) {
      const existing = groups.get(item.group) || []
      existing.push(item)
      groups.set(item.group, existing)
    }
    return groups
  }, [filtered])

  const handleSelect = (item: CommandItem) => {
    setCommandPaletteOpen(false)
    item.action()
  }

  if (!commandPaletteOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm"
        onClick={() => setCommandPaletteOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-xl bg-card border border-border shadow-2xl shadow-black/50 overflow-hidden"
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search files, pages, templates..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50
                focus:outline-none"
            />
            <kbd className="text-[10px] text-muted-foreground/50 px-1.5 py-0.5 rounded bg-muted">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[300px] overflow-y-auto py-2">
            {Array.from(grouped.entries()).map(([group, items]) => (
              <div key={group}>
                <div className="px-4 py-1.5 text-xs text-muted-foreground/60 font-semibold uppercase tracking-wider">
                  {group}
                </div>
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left
                      hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-foreground">{item.label}</span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground ml-2">{item.description}</span>
                      )}
                    </div>
                    <ArrowRight className="w-3 h-3 text-muted-foreground/30" />
                  </button>
                ))}
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No results found
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
