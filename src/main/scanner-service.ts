import fg from 'fast-glob'
import { basename, join } from 'path'
import { existsSync } from 'fs'
import type { ClaudeProject } from '../shared/types'
import { generateFileId } from './utils'
import { scanProjectFiles } from './file-service'

const PROJECT_MARKERS = [
  '.git',
  'package.json',
  'Cargo.toml',
  'pyproject.toml',
  'go.mod',
  'Gemfile',
  'pom.xml',
  'build.gradle',
  'CMakeLists.txt',
  'Makefile',
  '*.xcodeproj',
  '*.sln'
]

const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  'build',
  'dist',
  '.next',
  'target',
  'vendor',
  '__pycache__',
  '.venv',
  'venv',
  '.eggs',
  'coverage',
  '.cache'
]

function computeHealthScore(project: ClaudeProject): number {
  let score = 0

  if (project.hasClaudeMd) {
    score += 30
    const claudeMdFile = project.files.find(
      (f) => f.filename === 'CLAUDE.md' && f.category === 'instructions'
    )
    if (claudeMdFile && claudeMdFile.lineCount && claudeMdFile.lineCount <= 200) {
      score += 10
    }
    if (claudeMdFile && claudeMdFile.content && /^#+\s/m.test(claudeMdFile.content)) {
      score += 10
    }
  }

  if (project.hasIgnore) score += 10
  if (project.hasSettings || project.hasLocalSettings) score += 10
  if (project.hasRules) score += 15
  if (project.hasSkills) score += 10
  if (project.hasAgents) score += 5

  return Math.min(score, 100)
}

export async function discoverProjects(
  searchPaths: string[],
  onProjectFound?: (project: ClaudeProject) => void
): Promise<ClaudeProject[]> {
  const projects: ClaudeProject[] = []
  const seen = new Set<string>()

  for (const searchPath of searchPaths) {
    if (!existsSync(searchPath)) continue

    // Find directories containing project markers
    const markerPatterns = PROJECT_MARKERS.map((marker) =>
      join(searchPath, '**', marker)
    )

    const markerFiles = await fg(markerPatterns, {
      onlyFiles: false,
      deep: 3,
      ignore: EXCLUDE_DIRS.map((d) => `**/${d}/**`),
      dot: true,
      followSymbolicLinks: false
    })

    for (const markerPath of markerFiles) {
      // Get the project root (parent of the marker)
      const projectPath = markerPath.replace(/\/[^/]+$/, '')

      if (seen.has(projectPath)) continue
      seen.add(projectPath)

      const files = await scanProjectFiles(projectPath)

      const project: ClaudeProject = {
        id: generateFileId(projectPath),
        path: projectPath,
        name: basename(projectPath),
        files,
        hasClaudeMd: files.some(
          (f) => f.filename === 'CLAUDE.md' && f.status === 'exists'
        ),
        hasLocalClaudeMd: files.some(
          (f) => f.filename === 'CLAUDE.local.md' && f.status === 'exists'
        ),
        hasSettings: files.some(
          (f) => f.filename === 'settings.json' && f.category === 'settings' && f.status === 'exists'
        ),
        hasLocalSettings: files.some(
          (f) => f.filename === 'settings.local.json' && f.status === 'exists'
        ),
        hasRules: files.some((f) => f.category === 'rules' && f.status === 'exists'),
        hasSkills: files.some((f) => f.category === 'skills' && f.status === 'exists'),
        hasAgents: files.some((f) => f.category === 'agents' && f.status === 'exists'),
        hasHooks: files.some((f) => f.category === 'hooks' && f.status === 'exists'),
        hasIgnore: files.some(
          (f) => f.filename === '.claudeignore' && f.status === 'exists'
        ),
        healthScore: 0,
        lastScanned: Date.now()
      }

      project.healthScore = computeHealthScore(project)
      projects.push(project)

      if (onProjectFound) {
        onProjectFound(project)
      }
    }
  }

  // Sort by name
  projects.sort((a, b) => a.name.localeCompare(b.name))

  return projects
}
