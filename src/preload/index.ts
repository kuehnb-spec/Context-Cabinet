import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  ping: (): Promise<string> => ipcRenderer.invoke('ping'),

  files: {
    scanGlobal: () => ipcRenderer.invoke('files:scan-global'),
    scanProject: (path: string) => ipcRenderer.invoke('files:scan-project', path),
    read: (path: string) => ipcRenderer.invoke('files:read', path),
    write: (path: string, content: string) => ipcRenderer.invoke('files:write', path, content),
    create: (path: string, content: string) => ipcRenderer.invoke('files:create', path, content),
    delete: (path: string) => ipcRenderer.invoke('files:delete', path),
    exists: (path: string) => ipcRenderer.invoke('files:exists', path),
    onChanged: (callback: (data: { event: string; path: string }) => void) => {
      ipcRenderer.on('files:changed', (_, data) => callback(data))
      return () => {
        ipcRenderer.removeAllListeners('files:changed')
      }
    }
  },

  projects: {
    discover: (paths: string[]) => ipcRenderer.invoke('projects:discover', paths)
  },

  dialog: {
    selectDirectory: (): Promise<string | null> => ipcRenderer.invoke('dialog:select-directory')
  },

  shell: {
    openInFinder: (path: string) => ipcRenderer.invoke('shell:open-in-finder', path),
    openInEditor: (path: string) => ipcRenderer.invoke('shell:open-in-editor', path)
  },

  watchers: {
    startGlobal: () => ipcRenderer.invoke('watchers:start-global'),
    startProject: (path: string) => ipcRenderer.invoke('watchers:start-project', path),
    stopAll: () => ipcRenderer.invoke('watchers:stop-all')
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
