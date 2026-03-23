import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Copy, Check, FileText, Settings, Scale, Wand2, EyeOff, Bot, Webhook } from 'lucide-react'
import { templates, searchTemplates, type Template } from '../data/templates'
import type { FileCategory } from '../types/claude-file'

const categoryFilters: { key: FileCategory | 'all'; label: string; icon: typeof FileText }[] = [
  { key: 'all' as FileCategory | 'all', label: 'All', icon: FileText },
  { key: 'instructions', label: 'Instructions', icon: FileText },
  { key: 'settings', label: 'Settings', icon: Settings },
  { key: 'rules', label: 'Rules', icon: Scale },
  { key: 'skills', label: 'Skills', icon: Wand2 },
  { key: 'agents', label: 'Agents', icon: Bot },
  { key: 'hooks', label: 'Hooks', icon: Webhook },
  { key: 'ignore', label: 'Ignore', icon: EyeOff }
]

function TemplatePreview({
  template,
  onClose
}: {
  template: Template
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [vars, setVars] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    template.variables?.forEach((v) => {
      initial[v.name] = v.defaultValue || ''
    })
    return initial
  })

  const resolvedContent = useMemo(() => {
    let content = template.content
    for (const [key, value] of Object.entries(vars)) {
      content = content.replaceAll(`{{${key}}}`, value || `{{${key}}}`)
    }
    return content
  }, [template.content, vars])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(resolvedContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
        className="w-full max-w-2xl max-h-[85vh] rounded-xl bg-card border border-border shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">{template.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{template.targetFile}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Variables */}
        {template.variables && template.variables.length > 0 && (
          <div className="px-6 py-4 border-b border-border bg-muted/20">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Customize
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {template.variables.map((v) => (
                <div key={v.name}>
                  <label className="text-xs text-muted-foreground mb-1 block">{v.label}</label>
                  <input
                    type="text"
                    value={vars[v.name] || ''}
                    onChange={(e) => setVars({ ...vars, [v.name]: e.target.value })}
                    placeholder={v.placeholder}
                    className="w-full px-3 py-1.5 rounded-md bg-background border border-border
                      text-sm text-foreground placeholder:text-muted-foreground/50
                      focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content preview */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <pre className="text-xs text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap">
            {resolvedContent}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground
              font-medium text-sm hover:bg-primary/90 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy to Clipboard
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function TemplatesPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<FileCategory | 'all'>('all')
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

  const filtered = useMemo(() => {
    let result = search ? searchTemplates(search) : templates
    if (activeCategory !== 'all') {
      result = result.filter((t) => t.category === activeCategory)
    }
    return result
  }, [search, activeCategory])

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Templates</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pre-built content templates for your Claude configuration files.
        </p>
      </div>

      {/* Search + Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border
              text-sm text-foreground placeholder:text-muted-foreground/50
              focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {categoryFilters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeCategory === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((template, i) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            onClick={() => setPreviewTemplate(template)}
            className="rounded-xl bg-card border border-border p-5 cursor-pointer
              hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5
              hover:-translate-y-1 transition-all group"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">{template.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {template.category}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {template.description}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {template.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No templates match your search.
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <TemplatePreview
            template={previewTemplate}
            onClose={() => setPreviewTemplate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
