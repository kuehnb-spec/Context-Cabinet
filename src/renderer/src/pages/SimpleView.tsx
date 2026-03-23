import { useState, useMemo } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
  FileText,
  Settings,
  Keyboard,
  Scale,
  Wand2,
  Bot,
  Webhook,
  Terminal,
  EyeOff,
  Brain,
  ChevronDown,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  Lightbulb,
  AlertTriangle,
  FolderOpen,
  FolderSearch
} from 'lucide-react'
import { useFileStore } from '../stores/file-store'
import { useUIStore } from '../stores/ui-store'
import { useProjectStore } from '../stores/project-store'
import { getFileInfo } from '../data/file-info'
import type { ClaudeFile, FileCategory } from '../types/claude-file'

/* ── Icon & color maps ─────────────────────── */
const catIcons: Record<string, typeof FileText> = {
  instructions: FileText,
  settings: Settings,
  keybindings: Keyboard,
  rules: Scale,
  skills: Wand2,
  hooks: Webhook,
  agents: Bot,
  commands: Terminal,
  ignore: EyeOff,
  memory: Brain
}

const catAccent: Record<string, string> = {
  instructions: '#5B8DEF',
  settings: '#9B7ADB',
  keybindings: '#D4749A',
  rules: '#D4A24C',
  skills: '#5BB88A',
  hooks: '#D46B6B',
  agents: '#4EA8B8',
  commands: '#D48A5B',
  ignore: '#8B9BAA',
  memory: '#A578D4'
}

/* ── Tree hierarchy definition ─────────────── */
interface TreeSection {
  label: string
  description: string
  categories: FileCategory[]
}

const treeSections: TreeSection[] = [
  {
    label: 'Core',
    description: 'The essentials — start here',
    categories: ['instructions', 'settings', 'keybindings']
  },
  {
    label: 'Behaviors',
    description: 'Rules, patterns & constraints',
    categories: ['rules', 'ignore']
  },
  {
    label: 'Extensions',
    description: 'Skills, agents & automations',
    categories: ['skills', 'agents', 'hooks', 'commands']
  },
  {
    label: 'Knowledge',
    description: 'Memory & context',
    categories: ['memory']
  }
]

/* ── Individual file node ──────────────────── */
interface FileNodeProps {
  file: ClaudeFile
  delay: number
  isExpanded: boolean
  onToggle: () => void
}

function FileNode({ file, delay, isExpanded, onToggle }: FileNodeProps) {
  const navigateTo = useUIStore((s) => s.navigateTo)
  const setViewMode = useUIStore((s) => s.setViewMode)
  const [isHovered, setIsHovered] = useState(false)
  const Icon = catIcons[file.category] || FileText
  const accent = catAccent[file.category] || '#5B8DEF'
  const info = getFileInfo(file.relativePath)
  const isMissing = file.status === 'missing'
  const isPopulated = file.status === 'exists' && (file.lineCount ?? 0) > 0

  const handleOpenInEditor = async () => {
    if (isMissing) {
      try {
        await window.api.files.create(file.absolutePath, '')
      } catch (err) {
        console.error('Failed to create file:', err)
        return
      }
    }
    setViewMode('complete')
    // Small delay so mode switch animates, then navigate
    setTimeout(() => {
      navigateTo({ type: 'editor', filePath: file.absolutePath })
    }, 50)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: delay * 0.06 + 0.2,
        ease: [0.23, 1, 0.32, 1],
        layout: { duration: 0.35, ease: [0.23, 1, 0.32, 1] }
      }}
      className="simple-file-node group relative"
    >
      <motion.div
        layout
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{
          y: !isExpanded && isHovered ? -3 : 0,
          boxShadow: isExpanded
            ? `0 16px 48px -8px ${accent}20, 0 6px 20px -6px rgba(0,0,0,0.1)`
            : isHovered
              ? `0 12px 40px -8px ${accent}18, 0 4px 16px -4px rgba(0,0,0,0.08)`
              : '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)'
        }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className={`relative rounded-2xl border backdrop-blur-sm overflow-hidden cursor-pointer ${
          isMissing
            ? 'bg-stone-100/40 border-dashed'
            : 'bg-white/70'
        }`}
        style={{
          borderColor: isExpanded
            ? `${accent}50`
            : isHovered
              ? `${accent}40`
              : isMissing
                ? 'rgba(180, 170, 158, 0.3)'
                : 'rgba(180, 170, 158, 0.25)'
        }}
      >
        {/* Top accent line */}
        <motion.div
          layout
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ backgroundColor: accent }}
          animate={{
            opacity: isMissing ? 0.08 : isPopulated ? 1 : 0.2,
            scaleX: isMissing ? 0.2 : isPopulated ? 1 : 0.4
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Collapsed header — always visible, clickable to expand */}
        <motion.div
          layout
          onClick={onToggle}
          className="p-4 flex items-start gap-3.5"
        >
          {/* Icon */}
          <motion.div
            layout
            animate={{
              scale: isHovered && !isExpanded ? 1.08 : 1,
              rotate: isHovered && !isExpanded ? 4 : 0,
              opacity: isMissing ? 0.4 : 1
            }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: isMissing ? 'rgba(180,170,158,0.08)' : `${accent}12`,
              border: `1px solid ${isMissing ? 'rgba(180,170,158,0.15)' : `${accent}20`}`
            }}
          >
            <Icon
              className="w-[18px] h-[18px]"
              style={{ color: isMissing ? '#B4AA9E' : accent }}
            />
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[13px] font-semibold truncate ${
                isMissing ? 'text-stone-400' : 'text-stone-800'
              }`}>
                {file.displayName}
              </span>

              {/* Status icon */}
              {isPopulated ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : file.status === 'empty' ? (
                <Circle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : isMissing ? (
                <Plus className="w-3.5 h-3.5 text-stone-300 shrink-0" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-stone-300 shrink-0" />
              )}
            </div>

            <p className={`text-[11px] font-mono truncate mb-1.5 ${
              isMissing ? 'text-stone-300' : 'text-stone-400'
            }`}>
              {file.filename}
            </p>

            <p className={`text-[11px] leading-relaxed line-clamp-2 ${
              isMissing ? 'text-stone-400 italic' : 'text-stone-500'
            }`}>
              {isMissing
                ? 'Not created yet — click to learn more'
                : file.status === 'exists' && file.content
                  ? file.content.slice(0, 80).replace(/\n/g, ' ').replace(/#/g, '').trim()
                  : info?.description?.slice(0, 80) || file.description}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-2 mt-2">
              {file.status === 'exists' && file.lineCount != null && (
                <span className="text-[10px] text-stone-400 font-mono">
                  {file.lineCount} lines
                </span>
              )}
              {file.status === 'empty' && (
                <span className="text-[10px] text-amber-500 italic">Empty file</span>
              )}
              {isMissing && (
                <span className="text-[10px] text-stone-300 font-mono">not created</span>
              )}
            </div>
          </div>

          {/* Expand chevron */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="shrink-0 self-center"
          >
            <ChevronDown className={`w-4 h-4 ${
              isMissing ? 'text-stone-300' : 'text-stone-400'
            }`} />
          </motion.div>
        </motion.div>

        {/* ── Expanded detail panel ── */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3 border-t"
                style={{ borderColor: `${accent}15` }}
              >
                <div className="pt-3" />

                {/* Description */}
                {info && (
                  <p className="text-[12px] text-stone-600 leading-relaxed">
                    {info.description}
                  </p>
                )}

                {/* Content preview for existing files */}
                {file.status === 'exists' && file.content && (
                  <div className="rounded-lg bg-stone-50/80 border border-stone-200/40 p-3">
                    <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                      Content Preview
                    </p>
                    <pre className="text-[11px] text-stone-600 font-mono whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                      {file.content.slice(0, 400)}
                      {(file.content.length ?? 0) > 400 && (
                        <span className="text-stone-400">...</span>
                      )}
                    </pre>
                  </div>
                )}

                {/* Best practices */}
                {info && info.bestPractices.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Lightbulb className="w-3 h-3" style={{ color: accent }} />
                      <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                        Best Practices
                      </p>
                    </div>
                    <div className="space-y-1">
                      {info.bestPractices.slice(0, 3).map((tip, i) => (
                        <p key={i} className="text-[11px] text-stone-500 flex items-start gap-2">
                          <span style={{ color: accent }}>-</span>
                          {tip}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Common mistakes for missing/empty */}
                {info && (isMissing || file.status === 'empty') && info.commonMistakes && info.commonMistakes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                        Common Mistakes
                      </p>
                    </div>
                    <div className="space-y-1">
                      {info.commonMistakes.slice(0, 2).map((m, i) => (
                        <p key={i} className="text-[11px] text-stone-400 flex items-start gap-2">
                          <span className="text-amber-500">!</span>
                          {m}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scope & recommendation */}
                {info && (
                  <div className="flex items-center gap-3 text-[10px] text-stone-400">
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200/50">
                      {file.scope}
                    </span>
                    <span>{info.scope}</span>
                  </div>
                )}

                {/* Action button — opens in Complete mode editor */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenInEditor()
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold
                    transition-all duration-200 cursor-pointer"
                  style={{
                    backgroundColor: `${accent}10`,
                    color: accent,
                    border: `1px solid ${accent}25`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${accent}18`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = `${accent}10`
                  }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {isMissing ? 'Create & Open in Editor' : 'Open in Editor'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

/* ── Tree Section component ────────────────── */
interface TreeSectionProps {
  section: TreeSection
  files: ClaudeFile[]
  sectionIndex: number
  expandedId: string | null
  onToggleExpand: (id: string) => void
}

function TreeSectionBlock({ section, files, sectionIndex, expandedId, onToggleExpand }: TreeSectionProps) {
  const populatedCount = files.filter(
    (f) => f.status === 'exists' && (f.lineCount ?? 0) > 0
  ).length
  const totalCount = files.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: sectionIndex * 0.12,
        ease: [0.23, 1, 0.32, 1]
      }}
      className="relative"
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor:
                populatedCount === totalCount
                  ? '#22C55E'
                  : populatedCount > 0
                    ? '#D4A24C'
                    : 'rgba(180, 170, 158, 0.4)'
            }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{
              duration: 2,
              delay: sectionIndex * 0.3,
              repeat: Infinity,
              repeatDelay: 4
            }}
          />
          <h2 className="text-base font-semibold text-stone-700 tracking-tight">
            {section.label}
          </h2>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-stone-200/60 to-transparent" />
        <span className="text-[10px] text-stone-400 font-mono">
          {populatedCount}/{totalCount}
        </span>
      </div>

      <p className="text-[11px] text-stone-400 mb-4 -mt-1 ml-[18px]">{section.description}</p>

      {/* File cards */}
      <LayoutGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 ml-[18px]">
          {files.map((file, i) => (
            <FileNode
              key={file.id}
              file={file}
              delay={sectionIndex * 4 + i}
              isExpanded={expandedId === file.id}
              onToggle={() => onToggleExpand(file.id)}
            />
          ))}
        </div>
      </LayoutGroup>
    </motion.div>
  )
}

/* ── Project block with collapsible file list ── */
interface ProjectBlockProps {
  project: import('../types/claude-file').ClaudeProject
  index: number
  expandedId: string | null
  onToggleExpand: (id: string) => void
}

/** The key project-level file types we always show, even if missing */
const projectFileSlots: { category: FileCategory; displayName: string; filename: string; relPath: string }[] = [
  { category: 'instructions', displayName: 'Project Instructions', filename: 'CLAUDE.md', relPath: 'CLAUDE.md' },
  { category: 'instructions', displayName: 'Local Instructions', filename: 'CLAUDE.local.md', relPath: 'CLAUDE.local.md' },
  { category: 'settings', displayName: 'Project Settings', filename: 'settings.json', relPath: '.claude/settings.json' },
  { category: 'settings', displayName: 'Local Settings', filename: 'settings.local.json', relPath: '.claude/settings.local.json' },
  { category: 'rules', displayName: 'Rules', filename: 'rules/', relPath: '.claude/rules/*.md' },
  { category: 'ignore', displayName: 'Ignore Patterns', filename: '.claudeignore', relPath: '.claudeignore' },
  { category: 'skills', displayName: 'Skills', filename: 'skills/', relPath: '.claude/skills/*/SKILL.md' },
  { category: 'agents', displayName: 'Agents', filename: 'agents/', relPath: '.claude/agents/*.md' },
  { category: 'hooks', displayName: 'Hooks', filename: 'hooks/', relPath: '.claude/hooks/*' },
  { category: 'commands', displayName: 'Commands', filename: 'commands/', relPath: '.claude/commands/*.md' }
]

function ProjectBlock({ project, index, expandedId, onToggleExpand }: ProjectBlockProps) {
  const [isOpen, setIsOpen] = useState(false)
  const navigateTo = useUIStore((s) => s.navigateTo)
  const setViewMode = useUIStore((s) => s.setViewMode)

  const existingCount = project.files.filter(
    (f) => f.status === 'exists' && (f.lineCount ?? 0) > 0
  ).length
  const totalSlots = projectFileSlots.length

  // Build a merged list: real files + placeholders for missing slots
  const mergedFiles = useMemo(() => {
    const result: ClaudeFile[] = []
    const usedIds = new Set<string>()

    for (const slot of projectFileSlots) {
      // Find a matching real file
      const match = project.files.find(
        (f) => f.category === slot.category && f.filename === slot.filename && !usedIds.has(f.id)
      )
      // For directory-based types (rules, skills, etc.), match any file in that category
      const dirMatch = !match
        ? project.files.find((f) => f.category === slot.category && !usedIds.has(f.id))
        : null
      const file = match || dirMatch

      if (file) {
        usedIds.add(file.id)
        result.push(file)
      } else {
        // Create a placeholder for the missing file
        result.push({
          id: `${project.id}-missing-${slot.relPath}`,
          absolutePath: `${project.path}/${slot.relPath}`,
          relativePath: slot.relPath,
          scope: 'project',
          category: slot.category,
          filename: slot.filename,
          displayName: slot.displayName,
          description: '',
          status: 'missing',
          content: null,
          lineCount: null,
          lastModified: null,
          isLocal: false,
          isShared: false,
          projectPath: project.path,
          projectName: project.name,
          parentDir: project.path,
          icon: ''
        })
      }
    }

    // Also include any real project files not yet in result (extra rules, skills, etc.)
    for (const f of project.files) {
      if (!usedIds.has(f.id)) {
        result.push(f)
      }
    }

    return result
  }, [project])

  const handleOpenProject = () => {
    setViewMode('complete')
    setTimeout(() => {
      navigateTo({ type: 'project-files', projectPath: project.path })
    }, 50)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08 + 0.15,
        ease: [0.23, 1, 0.32, 1]
      }}
      className="rounded-2xl border border-stone-200/40 bg-white/50 backdrop-blur-sm overflow-hidden"
    >
      {/* Project header — click to expand/collapse */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3.5 p-4 text-left cursor-pointer
          hover:bg-stone-50/50 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200/50
          flex items-center justify-center shrink-0"
        >
          <FolderOpen className="w-[18px] h-[18px] text-stone-500" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-stone-800 truncate">
              {project.name}
            </span>
            {/* Health score pill */}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
              project.healthScore >= 70
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50'
                : project.healthScore >= 40
                  ? 'bg-amber-50 text-amber-600 border border-amber-200/50'
                  : 'bg-stone-100 text-stone-400 border border-stone-200/50'
            }`}>
              {project.healthScore}%
            </span>
          </div>
          <p className="text-[11px] text-stone-400 font-mono truncate">{project.path}</p>
        </div>

        {/* File count summary */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] text-stone-400 font-mono">
            {existingCount}/{totalSlots} files
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <ChevronDown className="w-4 h-4 text-stone-400" />
          </motion.div>
        </div>
      </button>

      {/* Expanded file list */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-stone-200/30">
              <div className="pt-3" />

              {/* Mini progress bar for this project */}
              <div className="h-0.5 rounded-full bg-stone-100 overflow-hidden mb-4">
                <motion.div
                  className="h-full rounded-full bg-emerald-400"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(existingCount / Math.max(totalSlots, 1)) * 100}%`
                  }}
                  transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>

              {/* File cards grid */}
              <LayoutGroup>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {mergedFiles.map((file, i) => (
                    <FileNode
                      key={file.id}
                      file={file}
                      delay={i}
                      isExpanded={expandedId === file.id}
                      onToggle={() => onToggleExpand(file.id)}
                    />
                  ))}
                </div>
              </LayoutGroup>

              {/* Open in Complete mode button */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenProject()
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium
                    text-stone-500 bg-stone-100/60 border border-stone-200/40
                    hover:bg-stone-100 hover:text-stone-700 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open in Complete View
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ── Main SimpleView component ─────────────── */
export function SimpleView() {
  const globalFiles = useFileStore((s) => s.globalFiles)
  const projects = useProjectStore((s) => s.projects)
  const navigateTo = useUIStore((s) => s.navigateTo)
  const setViewMode = useUIStore((s) => s.setViewMode)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleToggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  // Organize files into tree sections
  const sectionedFiles = useMemo(() => {
    return treeSections.map((section) => ({
      section,
      files: section.categories.flatMap(
        (cat) => globalFiles.filter((f) => f.category === cat)
      )
    })).filter((s) => s.files.length > 0)
  }, [globalFiles])

  // Stats — count global + all project files
  const allProjectFiles = projects.flatMap((p) => p.files)
  const totalFiles = globalFiles.length + allProjectFiles.length
  const populated = [
    ...globalFiles,
    ...allProjectFiles
  ].filter((f) => f.status === 'exists' && (f.lineCount ?? 0) > 0).length

  return (
    <div className="simple-view-root h-full overflow-y-auto">
      <div className="simple-view-bg min-h-full">
        <div className="max-w-5xl mx-auto px-8 py-10">
          {/* Hero header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            className="mb-10"
          >
            <div className="flex items-end justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold text-stone-800 tracking-tight">
                  Your Configuration
                </h1>
                <p className="text-sm text-stone-500 mt-1">
                  All Claude Code files at a glance — click any card to expand
                </p>
              </div>

              {/* Donut progress */}
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11">
                  <svg viewBox="0 0 36 36" className="w-11 h-11 -rotate-90">
                    <circle
                      cx="18" cy="18" r="14"
                      fill="none"
                      stroke="rgba(180, 170, 158, 0.15)"
                      strokeWidth="3"
                    />
                    <motion.circle
                      cx="18" cy="18" r="14"
                      fill="none"
                      stroke="#5BB88A"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${(populated / Math.max(totalFiles, 1)) * 88} 88`}
                      initial={{ strokeDasharray: '0 88' }}
                      animate={{
                        strokeDasharray: `${(populated / Math.max(totalFiles, 1)) * 88} 88`
                      }}
                      transition={{ duration: 1.2, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-stone-600">{populated}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-600">
                    {populated} of {totalFiles}
                  </p>
                  <p className="text-[10px] text-stone-400">files configured</p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 rounded-full bg-stone-200/50 overflow-hidden mt-4">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #5BB88A, #4EA8B8, #5B8DEF)'
                }}
                initial={{ width: 0 }}
                animate={{
                  width: `${(populated / Math.max(totalFiles, 1)) * 100}%`
                }}
                transition={{ duration: 1, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
              />
            </div>
          </motion.div>

          {/* ── Global Files ── */}
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex items-center gap-2.5 mb-6"
            >
              <div className="w-6 h-6 rounded-md bg-stone-200/40 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-stone-500" />
              </div>
              <h2 className="text-lg font-bold text-stone-700 tracking-tight">Global</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-stone-200/40 to-transparent" />
            </motion.div>

            <div className="space-y-10">
              {sectionedFiles.map(({ section, files }, i) => (
                <TreeSectionBlock
                  key={section.label}
                  section={section}
                  files={files}
                  sectionIndex={i}
                  expandedId={expandedId}
                  onToggleExpand={handleToggleExpand}
                />
              ))}
            </div>
          </div>

          {/* ── Projects ── */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-center gap-2.5 mb-5"
            >
              <div className="w-6 h-6 rounded-md bg-stone-200/40 flex items-center justify-center">
                <FolderOpen className="w-3.5 h-3.5 text-stone-500" />
              </div>
              <h2 className="text-lg font-bold text-stone-700 tracking-tight">Projects</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-stone-200/40 to-transparent" />
              <span className="text-[10px] text-stone-400 font-mono">
                {projects.length} project{projects.length !== 1 ? 's' : ''}
              </span>
            </motion.div>

            {projects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="rounded-2xl border border-dashed border-stone-200/40 bg-white/30 p-8 text-center"
              >
                <FolderSearch className="w-8 h-8 text-stone-300 mx-auto mb-3" />
                <p className="text-[13px] text-stone-500 font-medium mb-1">No projects scanned yet</p>
                <p className="text-[11px] text-stone-400 mb-4">
                  Scan your filesystem to discover projects with Claude Code configs.
                </p>
                <button
                  onClick={() => {
                    setViewMode('complete')
                    setTimeout(() => navigateTo({ type: 'scanner' }), 50)
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold
                    bg-stone-100 text-stone-600 border border-stone-200/50
                    hover:bg-stone-200/60 transition-colors cursor-pointer"
                >
                  <FolderSearch className="w-3.5 h-3.5" />
                  Open Scanner
                </button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {projects.map((project, i) => (
                  <ProjectBlock
                    key={project.id}
                    project={project}
                    index={i}
                    expandedId={expandedId}
                    onToggleExpand={handleToggleExpand}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
