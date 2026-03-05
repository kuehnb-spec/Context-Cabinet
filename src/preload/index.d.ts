import { ElectronAPI } from '@electron-toolkit/preload'
import type { ClaudeFile, ClaudeProject } from '../shared/types'

interface FilesAPI {
  scanGlobal: () => Promise<ClaudeFile[]>
  scanProject: (path: string) => Promise<ClaudeFile[]>
  read: (path: string) => Promise<string>
  write: (path: string, content: string) => Promise<boolean>
  create: (path: string, content: string) => Promise<ClaudeFile>
  delete: (path: string) => Promise<boolean>
  exists: (path: string) => Promise<boolean>
  onChanged: (callback: (data: { event: string; path: string }) => void) => () => void
}

interface ProjectsAPI {
  discover: (paths: string[]) => Promise<ClaudeProject[]>
}

interface DialogAPI {
  selectDirectory: () => Promise<string | null>
}

interface ShellAPI {
  openInFinder: (path: string) => Promise<boolean>
  openInEditor: (path: string) => Promise<boolean>
}

interface WatchersAPI {
  startGlobal: () => Promise<boolean>
  startProject: (path: string) => Promise<boolean>
  stopAll: () => Promise<boolean>
}

interface ContextCabinetAPI {
  ping: () => Promise<string>
  files: FilesAPI
  projects: ProjectsAPI
  dialog: DialogAPI
  shell: ShellAPI
  watchers: WatchersAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: ContextCabinetAPI
  }
}
