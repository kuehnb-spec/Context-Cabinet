export type FileScope = 'global' | 'project' | 'managed'

export type FileCategory =
  | 'instructions'
  | 'settings'
  | 'keybindings'
  | 'rules'
  | 'skills'
  | 'hooks'
  | 'agents'
  | 'memory'
  | 'commands'
  | 'ignore'

export type FileStatus = 'exists' | 'missing' | 'empty' | 'error'

export interface ClaudeFile {
  id: string
  absolutePath: string
  relativePath: string
  scope: FileScope
  category: FileCategory
  filename: string
  displayName: string
  description: string
  status: FileStatus
  content: string | null
  lineCount: number | null
  lastModified: number | null
  isLocal: boolean
  isShared: boolean
  projectPath?: string
  projectName?: string
  parentDir: string
  icon: string
  frontmatter?: Record<string, unknown>
}

export interface ClaudeProject {
  id: string
  path: string
  name: string
  files: ClaudeFile[]
  hasClaudeMd: boolean
  hasLocalClaudeMd: boolean
  hasSettings: boolean
  hasLocalSettings: boolean
  hasRules: boolean
  hasSkills: boolean
  hasAgents: boolean
  hasHooks: boolean
  hasIgnore: boolean
  healthScore: number
  lastScanned: number
}
