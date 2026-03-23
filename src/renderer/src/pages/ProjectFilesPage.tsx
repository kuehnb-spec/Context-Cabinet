import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Lightbulb, Plus, Sparkles, FileText,
  Settings, Scale, EyeOff, Wand2, Bot, Webhook, Terminal,
  CheckCircle2, Circle, BookTemplate
} from 'lucide-react'
import { useFileStore } from '../stores/file-store'
import { useProjectStore } from '../stores/project-store'
import { useUIStore } from '../stores/ui-store'
import { FileCard } from '../components/file-card/FileCard'

/** Suggested files for a project with guidance on why each matters */
const projectFileGuide = [
  {
    key: 'claudeMd',
    label: 'CLAUDE.md',
    icon: FileText,
    category: 'instructions' as const,
    importance: 'essential',
    whyItMatters:
      'This is the single most impactful file. It gives Claude deep context about your project — architecture, conventions, key commands. Projects with a good CLAUDE.md get dramatically better results.',
    whatToInclude: [
      'Project overview and tech stack',
      'Build/test/lint commands',
      'File structure and conventions',
      'Important patterns and gotchas'
    ],
    matchFn: (path: string) =>
      path.endsWith('/CLAUDE.md') && !path.includes('.local') && !path.includes('.claude/')
  },
  {
    key: 'claudeLocalMd',
    label: 'CLAUDE.local.md',
    icon: FileText,
    category: 'instructions' as const,
    importance: 'recommended',
    whyItMatters:
      'Your personal project notes that stay on your machine (gitignored). Great for local environment details, personal preferences, or reminders only you need.',
    whatToInclude: [
      'Local port overrides and env details',
      'Personal coding preferences',
      'Notes about your specific setup',
      'Things you want to remember between sessions'
    ],
    matchFn: (path: string) => path.includes('CLAUDE.local.md')
  },
  {
    key: 'settings',
    label: 'Project Settings',
    icon: Settings,
    category: 'settings' as const,
    importance: 'recommended',
    whyItMatters:
      'Pre-approve project commands so Claude doesn\'t ask permission every time you run npm test or docker compose up. Saves huge amounts of friction.',
    whatToInclude: [
      'Allow your project\'s build/test/dev commands',
      'Deny dangerous operations for safety',
      'Configure MCP servers if used'
    ],
    matchFn: (path: string) =>
      path.includes('.claude/settings.json') && !path.includes('.local')
  },
  {
    key: 'claudeignore',
    label: '.claudeignore',
    icon: EyeOff,
    category: 'ignore' as const,
    importance: 'recommended',
    whyItMatters:
      'Prevents Claude from wasting context on node_modules, build artifacts, and generated files. This directly improves response quality by focusing on your actual code.',
    whatToInclude: [
      'node_modules/, dist/, build/',
      '.env files and secrets',
      'Generated files, lock files',
      'Large binary assets'
    ],
    matchFn: (path: string) => path.includes('.claudeignore')
  },
  {
    key: 'rules',
    label: 'Rules',
    icon: Scale,
    category: 'rules' as const,
    importance: 'optional',
    whyItMatters:
      'Path-scoped rules let you enforce standards per file type. E.g., "all .tsx files must use named exports" or "all test files must use describe blocks".',
    whatToInclude: [
      'TypeScript conventions for .ts files',
      'React component patterns for .tsx',
      'Testing standards for test files',
      'API route conventions'
    ],
    matchFn: (path: string) => path.includes('.claude/rules/')
  },
  {
    key: 'skills',
    label: 'Skills',
    icon: Wand2,
    category: 'skills' as const,
    importance: 'optional',
    whyItMatters:
      'Custom slash commands shared with your team. Great for standardizing workflows like /deploy, /review, or /migrate.',
    whatToInclude: [
      'Common team workflows',
      'Project-specific automation',
      'Deployment procedures'
    ],
    matchFn: (path: string) => path.includes('.claude/skills/')
  },
  {
    key: 'agents',
    label: 'Agents',
    icon: Bot,
    category: 'agents' as const,
    importance: 'optional',
    whyItMatters:
      'Specialized subagents with deep domain knowledge. Useful for code review agents, documentation writers, or test generators that understand your project.',
    whatToInclude: [
      'Reviewer agents with project-specific checks',
      'Documentation generators',
      'Migration assistants'
    ],
    matchFn: (path: string) => path.includes('.claude/agents/')
  },
  {
    key: 'hooks',
    label: 'Hooks',
    icon: Webhook,
    category: 'hooks' as const,
    importance: 'advanced',
    whyItMatters:
      'Auto-run scripts when Claude takes actions — like running linting before commits or formatting after saves.',
    whatToInclude: [
      'Pre-commit lint/format checks',
      'Post-save formatting',
      'Custom validation scripts'
    ],
    matchFn: (path: string) => path.includes('.claude/hooks/')
  }
]

const importanceBadges = {
  essential: { label: 'Essential', color: 'text-success bg-success/10' },
  recommended: { label: 'Recommended', color: 'text-primary bg-primary/10' },
  optional: { label: 'Optional', color: 'text-muted-foreground bg-muted' },
  advanced: { label: 'Advanced', color: 'text-warning bg-warning/10' }
}

interface ProjectFilesPageProps {
  projectPath: string
}

export function ProjectFilesPage({ projectPath }: ProjectFilesPageProps) {
  const projectFiles = useFileStore((s) => s.projectFiles[projectPath] || [])
  const loadProjectFiles = useFileStore((s) => s.loadProjectFiles)
  const projects = useProjectStore((s) => s.projects)
  const goBack = useUIStore((s) => s.goBack)
  const navigateTo = useUIStore((s) => s.navigateTo)
  const [isLoading, setIsLoading] = useState(true)

  // Find project by path directly from the projects array (avoid calling store method in selector)
  const project = projects.find((p) => p.path === projectPath)

  useEffect(() => {
    setIsLoading(true)
    loadProjectFiles(projectPath)
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false))
  }, [projectPath, loadProjectFiles])

  // Check which guide items have existing files
  const getFileStatus = (guide: (typeof projectFileGuide)[0]) => {
    return projectFiles.some(
      (f) => guide.matchFn(f.absolutePath) && f.status === 'exists'
    )
  }

  const handleCreateFile = async (guide: (typeof projectFileGuide)[0]) => {
    // Find the matching file spec to get the correct path
    const matchingFile = projectFiles.find((f) => guide.matchFn(f.absolutePath))
    if (matchingFile) {
      try {
        await window.api.files.create(matchingFile.absolutePath, '')
        navigateTo({ type: 'editor', filePath: matchingFile.absolutePath })
      } catch (err) {
        console.error('Failed to create file:', err)
      }
    }
  }

  const handleOpenFile = (guide: (typeof projectFileGuide)[0]) => {
    const matchingFile = projectFiles.find(
      (f) => guide.matchFn(f.absolutePath) && f.status === 'exists'
    )
    if (matchingFile) {
      navigateTo({ type: 'editor', filePath: matchingFile.absolutePath })
    }
  }

  const existingCount = projectFileGuide.filter(getFileStatus).length
  const projectName = project?.name || projectPath.split('/').pop() || 'Project'

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={goBack}
          className="p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground">{projectName}</h1>
          <p className="text-xs text-muted-foreground truncate">{projectPath}</p>
        </div>
        {project && (
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-bold ${
                project.healthScore >= 60
                  ? 'text-success'
                  : project.healthScore >= 30
                    ? 'text-warning'
                    : 'text-muted-foreground'
              }`}
            >
              {project.healthScore}
            </span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span>
            <strong className="text-foreground">{existingCount}</strong> of{' '}
            {projectFileGuide.length} config files set up
          </span>
        </div>
      </div>

      {/* Guidance banner */}
      {existingCount < 3 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-primary/20 bg-primary/5 p-5"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Get the most out of Claude Code
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Projects with well-configured Claude files get dramatically better results.
                Start with the <strong>essentials</strong> — a good CLAUDE.md and .claudeignore
                will make the biggest difference. Then add rules and settings as you go.
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-success" /> Essential
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" /> Recommended
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/50" /> Optional
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-warning" /> Advanced
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* File guide cards */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {projectFileGuide.map((guide, i) => {
            const exists = getFileStatus(guide)
            const badge = importanceBadges[guide.importance]
            const Icon = guide.icon

            return (
              <motion.div
                key={guide.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04, ease: 'easeOut' }}
                className={`rounded-xl border p-5 transition-all ${
                  exists
                    ? 'border-border bg-card hover:border-primary/20'
                    : 'border-dashed border-border/60 bg-card/30 hover:border-primary/30 hover:bg-card/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon + status */}
                  <div className="flex flex-col items-center gap-1.5 pt-0.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        exists ? 'bg-success/10' : 'bg-muted/50'
                      }`}
                    >
                      <Icon
                        className={`w-4.5 h-4.5 ${
                          exists ? 'text-success' : 'text-muted-foreground/50'
                        }`}
                      />
                    </div>
                    {exists ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground/30" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground">
                        {guide.label}
                      </h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                      {guide.whyItMatters}
                    </p>

                    {/* What to include */}
                    {!exists && (
                      <div className="mb-3">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          What to include
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {guide.whatToInclude.map((item, j) => (
                            <span
                              key={j}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action */}
                    {exists ? (
                      <button
                        onClick={() => handleOpenFile(guide)}
                        className="text-xs text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
                      >
                        Open in editor
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCreateFile(guide)}
                        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Create and configure
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Existing file cards grid (for glob-matched files like individual rules) */}
      {projectFiles.filter((f) => f.status === 'exists').length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            All Project Files
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectFiles
              .filter((f) => f.status === 'exists')
              .map((file, i) => (
                <FileCard key={file.id} file={file} index={i} />
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
