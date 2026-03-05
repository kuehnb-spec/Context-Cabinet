import { watch, type FSWatcher } from 'chokidar'
import { BrowserWindow } from 'electron'
import { join } from 'path'
import { getGlobalClaudePath } from './utils'

const watchers: FSWatcher[] = []
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function notifyRenderer(event: string, path: string): void {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    const windows = BrowserWindow.getAllWindows()
    for (const win of windows) {
      win.webContents.send('files:changed', { event, path })
    }
  }, 300)
}

export function watchGlobalFiles(): void {
  const claudePath = getGlobalClaudePath()
  const watcher = watch(claudePath, {
    ignoreInitial: true,
    depth: 4,
    ignored: [
      '**/projects/**',
      '**/cache/**',
      '**/telemetry/**',
      '**/debug/**',
      '**/file-history/**',
      '**/shell-snapshots/**',
      '**/session-env/**',
      '**/todos/**',
      '**/tasks/**',
      '**/plans/**',
      '**/downloads/**'
    ]
  })

  watcher
    .on('add', (path) => notifyRenderer('add', path))
    .on('change', (path) => notifyRenderer('change', path))
    .on('unlink', (path) => notifyRenderer('unlink', path))

  watchers.push(watcher)
}

export function watchProjectFiles(projectPath: string): void {
  const paths = [
    join(projectPath, 'CLAUDE.md'),
    join(projectPath, 'CLAUDE.local.md'),
    join(projectPath, '.claudeignore'),
    join(projectPath, '.claude')
  ]

  const watcher = watch(paths, {
    ignoreInitial: true,
    depth: 3
  })

  watcher
    .on('add', (path) => notifyRenderer('add', path))
    .on('change', (path) => notifyRenderer('change', path))
    .on('unlink', (path) => notifyRenderer('unlink', path))

  watchers.push(watcher)
}

export function stopAllWatchers(): void {
  for (const watcher of watchers) {
    watcher.close()
  }
  watchers.length = 0
}
