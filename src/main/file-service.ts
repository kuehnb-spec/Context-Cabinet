import { readFile, writeFile, mkdir, stat, readdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join, basename, dirname, relative } from 'path'
import fg from 'fast-glob'
import matter from 'gray-matter'
import type { ClaudeFile, FileCategory, FileScope, FileStatus } from '../shared/types'
import {
  generateFileId,
  getGlobalClaudePath,
  getManagedPolicyPath,
  getProjectName,
  getHomePath
} from './utils'

interface FileSpec {
  path: string
  category: FileCategory
  displayName: string
  description: string
  icon: string
  isLocal: boolean
  isShared: boolean
}

function getGlobalFileSpecs(): FileSpec[] {
  const claudePath = getGlobalClaudePath()
  return [
    {
      path: join(claudePath, 'CLAUDE.md'),
      category: 'instructions',
      displayName: 'Global Instructions',
      description: 'Instructions that apply to every project you work on with Claude.',
      icon: 'Globe',
      isLocal: false,
      isShared: false
    },
    {
      path: join(claudePath, 'settings.json'),
      category: 'settings',
      displayName: 'Global Settings',
      description: 'Default permissions, tools, and behavior for all projects.',
      icon: 'Settings',
      isLocal: false,
      isShared: false
    },
    {
      path: join(claudePath, 'keybindings.json'),
      category: 'keybindings',
      displayName: 'Keybindings',
      description: 'Custom keyboard shortcuts for Claude Code CLI.',
      icon: 'Keyboard',
      isLocal: false,
      isShared: false
    }
  ]
}

function getProjectFileSpecs(projectPath: string): FileSpec[] {
  return [
    {
      path: join(projectPath, 'CLAUDE.md'),
      category: 'instructions',
      displayName: 'Project Instructions',
      description: 'Primary instructions file for this project. Shared with your team via git.',
      icon: 'FileText',
      isLocal: false,
      isShared: true
    },
    {
      path: join(projectPath, 'CLAUDE.local.md'),
      category: 'instructions',
      displayName: 'Personal Instructions',
      description: 'Your private project instructions. Automatically gitignored.',
      icon: 'FileKey',
      isLocal: true,
      isShared: false
    },
    {
      path: join(projectPath, '.claude', 'settings.json'),
      category: 'settings',
      displayName: 'Project Settings',
      description: 'Shared project settings for permissions, tools, and hooks.',
      icon: 'Settings',
      isLocal: false,
      isShared: true
    },
    {
      path: join(projectPath, '.claude', 'settings.local.json'),
      category: 'settings',
      displayName: 'Personal Settings',
      description: 'Your personal project settings. Overrides shared settings.',
      icon: 'UserCog',
      isLocal: true,
      isShared: false
    },
    {
      path: join(projectPath, '.claudeignore'),
      category: 'ignore',
      displayName: 'Ignore Patterns',
      description: 'Files and directories Claude should skip when building context.',
      icon: 'EyeOff',
      isLocal: false,
      isShared: true
    }
  ]
}

async function buildClaudeFile(
  spec: FileSpec,
  scope: FileScope,
  projectPath?: string
): Promise<ClaudeFile> {
  const fileExists = existsSync(spec.path)
  let status: FileStatus = 'missing'
  let lineCount: number | null = null
  let lastModified: number | null = null
  let content: string | null = null

  if (fileExists) {
    try {
      const fileStat = await stat(spec.path)
      lastModified = fileStat.mtimeMs
      content = await readFile(spec.path, 'utf-8')
      lineCount = content.split('\n').length
      status = content.trim().length === 0 ? 'empty' : 'exists'
    } catch {
      status = 'error'
    }
  }

  let frontmatterData: Record<string, unknown> | undefined
  if (content && (spec.category === 'rules' || spec.category === 'skills' || spec.category === 'agents')) {
    try {
      const parsed = matter(content)
      if (Object.keys(parsed.data).length > 0) {
        frontmatterData = parsed.data
      }
    } catch {
      // Not valid frontmatter, ignore
    }
  }

  return {
    id: generateFileId(spec.path),
    absolutePath: spec.path,
    relativePath: projectPath ? relative(projectPath, spec.path) : relative(getHomePath(), spec.path),
    scope,
    category: spec.category,
    filename: basename(spec.path),
    displayName: spec.displayName,
    description: spec.description,
    status,
    content,
    lineCount,
    lastModified,
    isLocal: spec.isLocal,
    isShared: spec.isShared,
    projectPath,
    projectName: projectPath ? getProjectName(projectPath) : undefined,
    parentDir: dirname(spec.path),
    icon: spec.icon,
    frontmatter: frontmatterData
  }
}

async function scanGlobFiles(
  pattern: string,
  category: FileCategory,
  displayNamePrefix: string,
  description: string,
  icon: string,
  scope: FileScope,
  isLocal: boolean,
  isShared: boolean,
  projectPath?: string
): Promise<ClaudeFile[]> {
  const files = await fg(pattern, { onlyFiles: true, dot: true })
  const results: ClaudeFile[] = []

  for (const filePath of files) {
    const spec: FileSpec = {
      path: filePath,
      category,
      displayName: `${displayNamePrefix}: ${basename(filePath)}`,
      description,
      icon,
      isLocal,
      isShared
    }
    results.push(await buildClaudeFile(spec, scope, projectPath))
  }

  return results
}

export async function scanGlobalFiles(): Promise<ClaudeFile[]> {
  const files: ClaudeFile[] = []
  const claudePath = getGlobalClaudePath()

  // Static known files
  for (const spec of getGlobalFileSpecs()) {
    files.push(await buildClaudeFile(spec, 'global'))
  }

  // Dynamic glob files
  const globScans = [
    scanGlobFiles(
      join(claudePath, 'rules', '*.md'),
      'rules', 'Global Rule', 'A global rule applied across all projects.',
      'BookOpen', 'global', false, false
    ),
    scanGlobFiles(
      join(claudePath, 'skills', '*', 'SKILL.md'),
      'skills', 'Global Skill', 'A globally available skill.',
      'Sparkles', 'global', false, false
    ),
    scanGlobFiles(
      join(claudePath, 'agents', '*.md'),
      'agents', 'Global Agent', 'A globally available custom subagent.',
      'Bot', 'global', false, false
    ),
    scanGlobFiles(
      join(claudePath, 'hooks', '*'),
      'hooks', 'Global Hook', 'A global hook script.',
      'Webhook', 'global', false, false
    )
  ]

  const globResults = await Promise.all(globScans)
  for (const result of globResults) {
    files.push(...result)
  }

  return files
}

export async function scanProjectFiles(projectPath: string): Promise<ClaudeFile[]> {
  const files: ClaudeFile[] = []

  // Static known files
  for (const spec of getProjectFileSpecs(projectPath)) {
    files.push(await buildClaudeFile(spec, 'project', projectPath))
  }

  // Check alternate CLAUDE.md location
  const altClaudeMd = join(projectPath, '.claude', 'CLAUDE.md')
  if (existsSync(altClaudeMd) && !existsSync(join(projectPath, 'CLAUDE.md'))) {
    files.push(
      await buildClaudeFile(
        {
          path: altClaudeMd,
          category: 'instructions',
          displayName: 'Project Instructions',
          description: 'Primary instructions file (in .claude/ directory).',
          icon: 'FileText',
          isLocal: false,
          isShared: true
        },
        'project',
        projectPath
      )
    )
  }

  // Dynamic glob files
  const claudeDir = join(projectPath, '.claude')
  const globScans = [
    scanGlobFiles(
      join(claudeDir, 'rules', '*.md'),
      'rules', 'Rule', 'A project-specific rule.',
      'BookOpen', 'project', false, true, projectPath
    ),
    scanGlobFiles(
      join(claudeDir, 'skills', '*', 'SKILL.md'),
      'skills', 'Skill', 'A project skill.',
      'Sparkles', 'project', false, true, projectPath
    ),
    scanGlobFiles(
      join(claudeDir, 'agents', '*.md'),
      'agents', 'Agent', 'A project subagent.',
      'Bot', 'project', false, true, projectPath
    ),
    scanGlobFiles(
      join(claudeDir, 'hooks', '*'),
      'hooks', 'Hook', 'A project hook script.',
      'Webhook', 'project', false, true, projectPath
    ),
    scanGlobFiles(
      join(claudeDir, 'commands', '*.md'),
      'commands', 'Command', 'A legacy slash command.',
      'Terminal', 'project', false, true, projectPath
    )
  ]

  const globResults = await Promise.all(globScans)
  for (const result of globResults) {
    files.push(...result)
  }

  return files
}

export async function readFileContent(absolutePath: string): Promise<string> {
  return readFile(absolutePath, 'utf-8')
}

export async function writeFileContent(absolutePath: string, content: string): Promise<void> {
  const dir = dirname(absolutePath)
  await mkdir(dir, { recursive: true })
  await writeFile(absolutePath, content, 'utf-8')
}

export async function createFile(absolutePath: string, content: string): Promise<ClaudeFile> {
  await writeFileContent(absolutePath, content)

  // Re-scan to get the full ClaudeFile object
  const filename = basename(absolutePath)
  const category = getCategoryFromFilename(filename)

  return {
    id: generateFileId(absolutePath),
    absolutePath,
    relativePath: basename(absolutePath),
    scope: absolutePath.includes('.claude/') && absolutePath.startsWith(getHomePath())
      ? 'global'
      : 'project',
    category,
    filename,
    displayName: filename,
    description: '',
    status: content.trim().length === 0 ? 'empty' : 'exists',
    content,
    lineCount: content.split('\n').length,
    lastModified: Date.now(),
    isLocal: filename.includes('.local'),
    isShared: !filename.includes('.local'),
    parentDir: dirname(absolutePath),
    icon: 'FileText'
  }
}

export async function deleteFile(absolutePath: string): Promise<void> {
  const { unlink } = await import('fs/promises')
  await unlink(absolutePath)
}

export function fileExists(absolutePath: string): boolean {
  return existsSync(absolutePath)
}

function getCategoryFromFilename(filename: string): FileCategory {
  if (filename === 'CLAUDE.md' || filename === 'CLAUDE.local.md') return 'instructions'
  if (filename.includes('settings')) return 'settings'
  if (filename === 'keybindings.json') return 'keybindings'
  if (filename === '.claudeignore') return 'ignore'
  if (filename === 'SKILL.md') return 'skills'
  if (filename === 'MEMORY.md') return 'memory'
  return 'instructions'
}
