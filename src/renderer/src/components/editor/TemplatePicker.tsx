import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookTemplate, Check, Search } from 'lucide-react'
import { templates, type Template } from '../../data/templates'
import type { FileCategory } from '../../types/claude-file'

interface TemplatePickerProps {
  /** Filter templates to a specific category, or show all */
  category?: FileCategory
  /** Called when a template's resolved content should be inserted */
  onInsert: (content: string) => void
  onClose: () => void
}

export function TemplatePicker({ category, onInsert, onClose }: TemplatePickerProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Template | null>(null)
  const [vars, setVars] = useState<Record<string, string>>({})

  const filtered = useMemo(() => {
    let list = category
      ? templates.filter((t) => t.category === category)
      : templates
    if (search) {
      const lower = search.toLowerCase()
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(lower) ||
          t.description.toLowerCase().includes(lower)
      )
    }
    return list
  }, [category, search])

  const handleSelect = (template: Template) => {
    setSelected(template)
    const initial: Record<string, string> = {}
    template.variables?.forEach((v) => {
      initial[v.name] = v.defaultValue || ''
    })
    setVars(initial)
  }

  const resolvedContent = useMemo(() => {
    if (!selected) return ''
    let content = selected.content
    for (const [key, value] of Object.entries(vars)) {
      content = content.replaceAll(`{{${key}}}`, value || `{{${key}}}`)
    }
    return content
  }, [selected, vars])

  const handleInsert = () => {
    onInsert(resolvedContent)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[80vh] rounded-xl bg-card border border-border shadow-2xl flex overflow-hidden"
      >
        {/* Left: template list */}
        <div className="w-64 border-r border-border flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 rounded-md bg-background border border-border
                  text-xs text-foreground placeholder:text-muted-foreground/50
                  focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {filtered.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelect(t)}
                className={`w-full text-left px-4 py-2.5 transition-colors cursor-pointer ${
                  selected?.id === t.id
                    ? 'bg-primary/10 border-l-2 border-l-primary'
                    : 'hover:bg-muted/50 border-l-2 border-l-transparent'
                }`}
              >
                <p className="text-sm font-medium text-foreground truncate">{t.name}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{t.description}</p>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-6 text-xs text-muted-foreground text-center">
                No templates found
              </p>
            )}
          </div>
        </div>

        {/* Right: preview + variables */}
        <div className="flex-1 flex flex-col min-w-0">
          {selected ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{selected.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{selected.description}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Variables */}
              {selected.variables && selected.variables.length > 0 && (
                <div className="px-5 py-3 border-b border-border bg-muted/20">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Customize
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {selected.variables.map((v) => (
                      <div key={v.name}>
                        <label className="text-xs text-muted-foreground mb-0.5 block">
                          {v.label}
                        </label>
                        <input
                          type="text"
                          value={vars[v.name] || ''}
                          onChange={(e) =>
                            setVars({ ...vars, [v.name]: e.target.value })
                          }
                          placeholder={v.placeholder}
                          className="w-full px-2.5 py-1.5 rounded-md bg-background border border-border
                            text-xs text-foreground placeholder:text-muted-foreground/50
                            focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview */}
              <div className="flex-1 overflow-y-auto px-5 py-3">
                <pre className="text-xs text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap">
                  {resolvedContent}
                </pre>
              </div>

              {/* Insert button */}
              <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-border">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInsert}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground
                    font-medium text-sm hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Insert Template
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <BookTemplate className="w-10 h-10 opacity-30" />
              <p className="text-sm">Select a template to preview</p>
              <button
                onClick={onClose}
                className="mt-2 p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
