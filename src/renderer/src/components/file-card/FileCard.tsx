import { motion } from 'framer-motion'
import { Info, Plus, FileText, Settings, Keyboard, Scale, Wand2, Bot, Terminal, EyeOff, Brain, Shield, Webhook } from 'lucide-react'
import type { ClaudeFile } from '../../types/claude-file'
import { getFileInfo } from '../../data/file-info'
import { InfoPopover } from './InfoPopover'
import { useUIStore } from '../../stores/ui-store'

const categoryIcons: Record<string, typeof FileText> = {
  instructions: FileText,
  settings: Settings,
  keybindings: Keyboard,
  rules: Scale,
  skills: Wand2,
  hooks: Webhook,
  agents: Bot,
  commands: Terminal,
  ignore: EyeOff,
  memory: Brain,
  policy: Shield
}

const categoryColors: Record<string, string> = {
  instructions: '#3A82FF',
  settings: '#8B5CF6',
  keybindings: '#EC4899',
  rules: '#F59E0B',
  skills: '#22C55E',
  hooks: '#EF4444',
  agents: '#06B6D4',
  commands: '#F97316',
  ignore: '#6B7280',
  memory: '#A855F7',
  policy: '#14B8A6'
}

interface FileCardProps {
  file: ClaudeFile
  index?: number
}

export function FileCard({ file, index = 0 }: FileCardProps) {
  const navigateTo = useUIStore((s) => s.navigateTo)
  const Icon = categoryIcons[file.category] || FileText
  const color = categoryColors[file.category] || '#3A82FF'
  const info = getFileInfo(file.relativePath)
  const isMissing = file.status === 'missing'

  const handleClick = async () => {
    if (file.status === 'exists' || file.status === 'empty') {
      // File exists (even if empty) — open it in the editor
      navigateTo({ type: 'editor', filePath: file.absolutePath })
    } else if (file.status === 'missing') {
      // File doesn't exist — create it first, then open in editor
      try {
        await window.api.files.create(file.absolutePath, '')
        navigateTo({ type: 'editor', filePath: file.absolutePath })
      } catch (err) {
        console.error('Failed to create file:', err)
      }
    }
  }

  const handleCreate = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await window.api.files.create(file.absolutePath, '')
      navigateTo({ type: 'editor', filePath: file.absolutePath })
    } catch (err) {
      console.error('Failed to create file:', err)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
      onClick={handleClick}
      className={`group relative rounded-xl border p-5 transition-all cursor-pointer ${
        isMissing
          ? 'border-dashed border-border/70 bg-card/30 hover:border-primary/30 hover:bg-card/50'
          : 'border-border bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1'
      }`}
    >
      {/* Top row: icon + name + info button */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="w-4.5 h-4.5" style={{ color }} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {file.displayName}
            </h3>
            <p className="text-xs text-muted-foreground truncate">{file.filename}</p>
          </div>
        </div>

        {info && (
          <InfoPopover
            info={info}
            trigger={
              <button className="p-1 rounded-md text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer">
                <Info className="w-4 h-4" />
              </button>
            }
          />
        )}
      </div>

      {/* Status + scope badges */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            file.status === 'exists'
              ? 'bg-success/10 text-success'
              : file.status === 'empty'
                ? 'bg-warning/10 text-warning'
                : 'bg-muted text-muted-foreground'
          }`}
        >
          {file.status}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {file.scope}
        </span>
      </div>

      {/* Description or content preview */}
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {file.status === 'exists' && file.content
          ? file.content.slice(0, 120).replace(/\n/g, ' ')
          : file.description || info?.description || file.relativePath}
      </p>

      {/* Create button for missing files */}
      {isMissing && (
        <button
          onClick={handleCreate}
          className="mt-4 flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Create this file
        </button>
      )}

      {/* File size for existing files */}
      {file.status === 'exists' && file.lineCount != null && (
        <div className="mt-3 text-xs text-muted-foreground/60">
          {file.lineCount} lines
        </div>
      )}
    </motion.div>
  )
}
