import { createHash } from 'crypto'
import { homedir } from 'os'
import { basename, dirname, join } from 'path'

export function generateFileId(absolutePath: string): string {
  return createHash('md5').update(absolutePath).digest('hex').slice(0, 12)
}

export function getHomePath(): string {
  return homedir()
}

export function getGlobalClaudePath(): string {
  return join(homedir(), '.claude')
}

export function getManagedPolicyPath(): string {
  return '/Library/Application Support/ClaudeCode'
}

export function getProjectName(projectPath: string): string {
  return basename(projectPath)
}

export function getParentDir(filePath: string): string {
  return dirname(filePath)
}

/**
 * Decode the path-encoded project ID used in ~/.claude/projects/
 * e.g. "-Users-brantkuehn-Projects-the-ladder-v2" → "/Users/brantkuehn/Projects/the-ladder-v2"
 */
export function decodeProjectId(encodedId: string): string {
  return encodedId.replace(/^-/, '/').replace(/-/g, '/')
}

/**
 * Encode a project path into the format used in ~/.claude/projects/
 */
export function encodeProjectPath(projectPath: string): string {
  return projectPath.replace(/\//g, '-')
}
