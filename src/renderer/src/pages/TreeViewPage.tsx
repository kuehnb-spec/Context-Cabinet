import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronRight, Globe, FolderOpen, Shield,
  FileText, Settings, Keyboard, Scale, Wand2, Bot, Webhook, Terminal, EyeOff, Brain
} from 'lucide-react'
import { useFileStore } from '../stores/file-store'
import { useProjectStore } from '../stores/project-store'
import { useUIStore } from '../stores/ui-store'
import type { ClaudeFile } from '../types/claude-file'
import { cn } from '../lib/utils'

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

function TreeNode({
  file,
  depth = 0
}: {
  file: ClaudeFile
  depth?: number
}) {
  const navigateTo = useUIStore((s) => s.navigateTo)
  const Icon = categoryIcons[file.category] || FileText
  const color = categoryColors[file.category] || '#3A82FF'

  return (
    <div
      onClick={() => {
        if (file.status === 'exists') {
          navigateTo({ type: 'editor', filePath: file.absolutePath })
        }
      }}
      className={cn(
        'flex items-center gap-2.5 py-1.5 px-3 rounded-md transition-colors cursor-pointer',
        file.status === 'exists'
          ? 'hover:bg-muted/50'
          : 'opacity-40 hover:opacity-60'
      )}
      style={{ paddingLeft: `${depth * 20 + 12}px` }}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
      <span className="text-sm text-foreground truncate flex-1">{file.displayName}</span>
      <span className="text-xs text-muted-foreground shrink-0">{file.filename}</span>
      <div
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          file.status === 'exists'
            ? 'bg-success'
            : file.status === 'empty'
              ? 'bg-warning'
              : 'bg-muted-foreground/30'
        }`}
      />
    </div>
  )
}

function TreeSection({
  title,
  icon: SectionIcon,
  children,
  defaultOpen = true
}: {
  title: string
  icon: typeof Globe
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-foreground
          hover:bg-muted/30 rounded-md transition-colors cursor-pointer"
      >
        <ChevronRight
          className={cn('w-4 h-4 transition-transform text-muted-foreground', isOpen && 'rotate-90')}
        />
        <SectionIcon className="w-4 h-4 text-primary" />
        {title}
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  )
}

export function TreeViewPage() {
  const globalFiles = useFileStore((s) => s.globalFiles)
  const projects = useProjectStore((s) => s.projects)
  const projectFiles = useFileStore((s) => s.projectFiles)

  // Group global files by category
  const categories = new Map<string, ClaudeFile[]>()
  for (const file of globalFiles) {
    const existing = categories.get(file.category) || []
    existing.push(file)
    categories.set(file.category, existing)
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Tree View</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Hierarchical view of all Claude configuration files across all scopes.
        </p>
      </div>

      <div className="rounded-xl bg-card border border-border p-4 space-y-1">
        {/* Managed Policy */}
        <TreeSection title="Managed Policy" icon={Shield} defaultOpen={false}>
          <div className="py-1 px-3 text-xs text-muted-foreground ml-8">
            /Library/Application Support/ClaudeCode/CLAUDE.md
          </div>
        </TreeSection>

        {/* Global */}
        <TreeSection title="Global (~/.claude/)" icon={Globe}>
          {Array.from(categories.entries()).map(([category, files]) => (
            <div key={category}>
              {files.map((file) => (
                <TreeNode key={file.id} file={file} depth={1} />
              ))}
            </div>
          ))}
        </TreeSection>

        {/* Projects */}
        {projects.map((project) => {
          const files = projectFiles[project.path] || project.files || []
          return (
            <TreeSection
              key={project.path}
              title={project.name}
              icon={FolderOpen}
              defaultOpen={false}
            >
              {files.length > 0 ? (
                files.map((file) => (
                  <TreeNode key={file.id} file={file} depth={1} />
                ))
              ) : (
                <div className="py-1 px-3 text-xs text-muted-foreground ml-8">
                  No files scanned yet — click to load
                </div>
              )}
            </TreeSection>
          )
        })}

        {projects.length === 0 && (
          <div className="py-4 text-center text-xs text-muted-foreground">
            Scan for projects to see project-level files here.
          </div>
        )}
      </div>

      {/* Precedence diagram */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Precedence Order
        </h2>
        <div className="rounded-xl bg-card border border-border p-5 space-y-2">
          {[
            { label: 'Managed Policy', desc: 'Organization-wide (highest)', color: '#14B8A6' },
            { label: 'Project CLAUDE.md', desc: 'Team shared', color: '#3A82FF' },
            { label: 'Project CLAUDE.local.md', desc: 'Personal project', color: '#F59E0B' },
            { label: 'Global CLAUDE.md', desc: 'Your global defaults (lowest)', color: '#8B5CF6' }
          ].map((item, i) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-bold text-foreground">
                {i + 1}
              </div>
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div>
                <span className="text-sm text-foreground">{item.label}</span>
                <span className="text-xs text-muted-foreground ml-2">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
