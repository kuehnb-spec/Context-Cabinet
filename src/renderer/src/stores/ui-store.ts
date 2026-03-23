import { create } from 'zustand'

export type ViewMode = 'complete' | 'simple'

export type PageType =
  | { type: 'dashboard' }
  | { type: 'editor'; filePath: string }
  | { type: 'templates' }
  | { type: 'scanner' }
  | { type: 'tree-view' }
  | { type: 'health-check' }
  | { type: 'global-files' }
  | { type: 'project-files'; projectPath: string }

interface UIState {
  currentPage: PageType
  previousPage: PageType | null
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  viewMode: ViewMode
  navigateTo: (page: PageType) => void
  goBack: () => void
  toggleSidebar: () => void
  toggleCommandPalette: () => void
  setCommandPaletteOpen: (open: boolean) => void
  setViewMode: (mode: ViewMode) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  currentPage: { type: 'dashboard' },
  previousPage: null,
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  viewMode: 'complete',

  navigateTo: (page) =>
    set((state) => ({
      previousPage: state.currentPage,
      currentPage: page
    })),

  goBack: () => {
    const prev = get().previousPage
    if (prev) {
      set({ currentPage: prev, previousPage: null })
    } else {
      set({ currentPage: { type: 'dashboard' } })
    }
  },

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  setViewMode: (mode) => set({ viewMode: mode })
}))
