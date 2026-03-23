import { create } from 'zustand'
import type { ClaudeProject } from '../types/claude-file'

const DEFAULT_SCAN_PATHS_KEY = 'context-cabinet:scan-paths'
const PROJECTS_KEY = 'context-cabinet:projects'

function getDefaultScanPaths(): string[] {
  const home = '/Users/' + (typeof process !== 'undefined' ? process.env.USER || '' : '')
  return [`${home}/Projects`, `${home}/Developer`, `${home}/Desktop`].filter(Boolean)
}

function loadScanPaths(): string[] {
  try {
    const saved = localStorage.getItem(DEFAULT_SCAN_PATHS_KEY)
    return saved ? JSON.parse(saved) : getDefaultScanPaths()
  } catch {
    return getDefaultScanPaths()
  }
}

function loadCachedProjects(): ClaudeProject[] {
  try {
    const saved = localStorage.getItem(PROJECTS_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

interface ProjectStoreState {
  projects: ClaudeProject[]
  scanPaths: string[]
  isScanning: boolean
  scanProgress: { current: number; total: number; currentDir: string } | null

  addScanPath: (path: string) => void
  removeScanPath: (path: string) => void
  startScan: () => Promise<void>
  getProjectByPath: (path: string) => ClaudeProject | undefined
}

export const useProjectStore = create<ProjectStoreState>((set, get) => ({
  projects: loadCachedProjects(),
  scanPaths: loadScanPaths(),
  isScanning: false,
  scanProgress: null,

  addScanPath: (path: string) => {
    set((state) => {
      const newPaths = [...state.scanPaths, path]
      localStorage.setItem(DEFAULT_SCAN_PATHS_KEY, JSON.stringify(newPaths))
      return { scanPaths: newPaths }
    })
  },

  removeScanPath: (path: string) => {
    set((state) => {
      const newPaths = state.scanPaths.filter((p) => p !== path)
      localStorage.setItem(DEFAULT_SCAN_PATHS_KEY, JSON.stringify(newPaths))
      return { scanPaths: newPaths }
    })
  },

  startScan: async () => {
    const { scanPaths } = get()
    set({ isScanning: true, scanProgress: null })

    try {
      const projects = await window.api.projects.discover(scanPaths)
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
      set({ projects, isScanning: false, scanProgress: null })
    } catch (err) {
      console.error('Scan failed:', err)
      set({ isScanning: false, scanProgress: null })
    }
  },

  getProjectByPath: (path: string) => {
    return get().projects.find((p) => p.path === path)
  }
}))
