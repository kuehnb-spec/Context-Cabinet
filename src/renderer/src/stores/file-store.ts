import { create } from 'zustand'
import type { ClaudeFile, FileCategory } from '../types/claude-file'

interface FileStoreState {
  globalFiles: ClaudeFile[]
  projectFiles: Record<string, ClaudeFile[]>
  isLoading: boolean
  error: string | null

  loadGlobalFiles: () => Promise<void>
  loadProjectFiles: (projectPath: string) => Promise<void>
  updateFile: (file: ClaudeFile) => void
  getFilesByCategory: (category: FileCategory) => ClaudeFile[]
  refreshAll: () => Promise<void>
}

export const useFileStore = create<FileStoreState>((set, get) => ({
  globalFiles: [],
  projectFiles: {},
  isLoading: false,
  error: null,

  loadGlobalFiles: async () => {
    set({ isLoading: true, error: null })
    try {
      const files = await window.api.files.scanGlobal()
      set({ globalFiles: files, isLoading: false })
    } catch (err) {
      set({ error: String(err), isLoading: false })
    }
  },

  loadProjectFiles: async (projectPath: string) => {
    try {
      const files = await window.api.files.scanProject(projectPath)
      set((state) => ({
        projectFiles: { ...state.projectFiles, [projectPath]: files }
      }))
    } catch (err) {
      console.error('Failed to load project files:', err)
    }
  },

  updateFile: (file: ClaudeFile) => {
    set((state) => {
      if (file.scope === 'global') {
        return {
          globalFiles: state.globalFiles.map((f) =>
            f.id === file.id ? file : f
          )
        }
      }
      if (file.projectPath) {
        const projectPath = file.projectPath
        const projectFiles = state.projectFiles[projectPath] || []
        return {
          projectFiles: {
            ...state.projectFiles,
            [projectPath]: projectFiles.map((f) =>
              f.id === file.id ? file : f
            )
          }
        }
      }
      return state
    })
  },

  getFilesByCategory: (category: FileCategory) => {
    const state = get()
    return state.globalFiles.filter((f) => f.category === category)
  },

  refreshAll: async () => {
    const state = get()
    await state.loadGlobalFiles()
    for (const projectPath of Object.keys(state.projectFiles)) {
      await state.loadProjectFiles(projectPath)
    }
  }
}))
