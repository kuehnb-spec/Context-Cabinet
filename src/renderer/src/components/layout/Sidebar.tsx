import {
  LayoutDashboard,
  FileText,
  Settings,
  Keyboard,
  Scale,
  Wand2,
  Bot,
  Terminal,
  EyeOff,
  Brain,
  Shield,
  FolderSearch,
  BookTemplate,
  GitBranch,
  Activity,
  Webhook
} from 'lucide-react'
import { useUIStore, type PageType } from '../../stores/ui-store'
import { useFileStore } from '../../stores/file-store'
import { useProjectStore } from '../../stores/project-store'
import { SidebarSection } from './SidebarSection'
import { SidebarItem } from './SidebarItem'

const categoryIcons = {
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
} as const

export function Sidebar() {
  const { currentPage, navigateTo } = useUIStore()
  const globalFiles = useFileStore((s) => s.globalFiles)
  const projects = useProjectStore((s) => s.projects)

  const isActive = (type: PageType['type']) => currentPage.type === type

  // Group global files by category for status dots
  const getCategoryStatus = (category: string) => {
    const files = globalFiles.filter((f) => f.category === category)
    if (files.length === 0) return undefined
    const hasExisting = files.some((f) => f.status === 'exists')
    const allMissing = files.every((f) => f.status === 'missing')
    if (allMissing) return '#7A8BA0'
    if (hasExisting) return '#22C55E'
    return '#F59E0B'
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Logo area */}
      <div className="drag-region h-12 flex items-center px-4 pl-16 shrink-0">
        <div className="no-drag flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-foreground">Context Cabinet</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {/* Overview */}
        <div className="space-y-0.5">
          <SidebarItem
            label="Dashboard"
            icon={LayoutDashboard}
            isActive={isActive('dashboard')}
            onClick={() => navigateTo({ type: 'dashboard' })}
          />
          <SidebarItem
            label="Global Files"
            icon={FileText}
            isActive={isActive('global-files')}
            onClick={() => navigateTo({ type: 'global-files' })}
          />
        </div>

        {/* Global file categories */}
        <SidebarSection title="Configuration">
          {(
            ['instructions', 'settings', 'keybindings', 'rules', 'skills', 'agents', 'hooks', 'ignore', 'memory'] as const
          ).map((cat) => {
            const Icon = categoryIcons[cat]
            return (
              <SidebarItem
                key={cat}
                label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                icon={Icon}
                indent
                statusColor={getCategoryStatus(cat)}
                isActive={false}
                onClick={() => navigateTo({ type: 'global-files' })}
              />
            )
          })}
        </SidebarSection>

        {/* Projects */}
        <SidebarSection title="Projects">
          <SidebarItem
            label="Scanner"
            icon={FolderSearch}
            isActive={isActive('scanner')}
            onClick={() => navigateTo({ type: 'scanner' })}
          />
          {projects.slice(0, 8).map((project) => (
            <SidebarItem
              key={project.path}
              label={project.name}
              icon={GitBranch}
              indent
              statusColor={project.healthScore > 50 ? '#22C55E' : '#F59E0B'}
              isActive={
                currentPage.type === 'project-files' &&
                currentPage.projectPath === project.path
              }
              onClick={() =>
                navigateTo({ type: 'project-files', projectPath: project.path })
              }
            />
          ))}
        </SidebarSection>

        {/* Tools */}
        <SidebarSection title="Tools">
          <SidebarItem
            label="Templates"
            icon={BookTemplate}
            isActive={isActive('templates')}
            onClick={() => navigateTo({ type: 'templates' })}
          />
          <SidebarItem
            label="Tree View"
            icon={GitBranch}
            isActive={isActive('tree-view')}
            onClick={() => navigateTo({ type: 'tree-view' })}
          />
          <SidebarItem
            label="Health Check"
            icon={Activity}
            isActive={isActive('health-check')}
            onClick={() => navigateTo({ type: 'health-check' })}
          />
        </SidebarSection>
      </div>
    </div>
  )
}
