import { ipcMain, dialog, shell } from 'electron'
import {
  scanGlobalFiles,
  scanProjectFiles,
  readFileContent,
  writeFileContent,
  createFile,
  deleteFile,
  fileExists
} from './file-service'
import { discoverProjects } from './scanner-service'
import { watchGlobalFiles, watchProjectFiles, stopAllWatchers } from './watcher-service'

export function registerIpcHandlers(): void {
  // Ping
  ipcMain.handle('ping', () => 'Electron IPC connected')

  // File operations
  ipcMain.handle('files:scan-global', async () => {
    return scanGlobalFiles()
  })

  ipcMain.handle('files:scan-project', async (_, projectPath: string) => {
    return scanProjectFiles(projectPath)
  })

  ipcMain.handle('files:read', async (_, path: string) => {
    return readFileContent(path)
  })

  ipcMain.handle('files:write', async (_, path: string, content: string) => {
    await writeFileContent(path, content)
    return true
  })

  ipcMain.handle('files:create', async (_, path: string, content: string) => {
    return createFile(path, content)
  })

  ipcMain.handle('files:delete', async (_, path: string) => {
    await deleteFile(path)
    return true
  })

  ipcMain.handle('files:exists', async (_, path: string) => {
    return fileExists(path)
  })

  // Project discovery
  ipcMain.handle('projects:discover', async (_, searchPaths: string[]) => {
    return discoverProjects(searchPaths)
  })

  // Native dialogs
  ipcMain.handle('dialog:select-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select directory to scan'
    })
    return result.canceled ? null : result.filePaths[0]
  })

  // Shell operations
  ipcMain.handle('shell:open-in-finder', async (_, path: string) => {
    shell.showItemInFolder(path)
    return true
  })

  ipcMain.handle('shell:open-in-editor', async (_, path: string) => {
    shell.openPath(path)
    return true
  })

  // File watchers
  ipcMain.handle('watchers:start-global', () => {
    watchGlobalFiles()
    return true
  })

  ipcMain.handle('watchers:start-project', (_, projectPath: string) => {
    watchProjectFiles(projectPath)
    return true
  })

  ipcMain.handle('watchers:stop-all', () => {
    stopAllWatchers()
    return true
  })
}
