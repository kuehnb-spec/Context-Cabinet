import { useEffect, useState } from 'react'
import type { ClaudeFile } from './types/claude-file'

function App(): JSX.Element {
  const [ipcResult, setIpcResult] = useState<string>('')
  const [globalFiles, setGlobalFiles] = useState<ClaudeFile[]>([])

  useEffect(() => {
    window.api.ping().then(setIpcResult).catch(() => setIpcResult('IPC not available'))
    window.api.files.scanGlobal().then(setGlobalFiles).catch(console.error)
  }, [])

  const existingFiles = globalFiles.filter((f) => f.status === 'exists')
  const missingFiles = globalFiles.filter((f) => f.status === 'missing')

  return (
    <div className="h-full flex flex-col">
      {/* Title bar drag region */}
      <div className="drag-region h-12 flex items-center px-20 shrink-0">
        <h1 className="text-sm font-medium text-muted-foreground">Context Cabinet</h1>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center overflow-auto">
        <div className="text-center space-y-6 max-w-2xl px-8">
          {/* Logo / Hero */}
          <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
              <path d="M12 10v6" />
              <path d="m9 13 3-3 3 3" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-foreground">Context Cabinet</h2>
            <p className="text-muted-foreground mt-2">
              Discover, create, and manage your Claude Code configuration
            </p>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${ipcResult ? 'bg-success' : 'bg-warning animate-pulse'}`} />
            <span className="text-xs text-muted-foreground">
              {ipcResult || 'Connecting...'}
            </span>
          </div>

          {/* File scan results */}
          {globalFiles.length > 0 && (
            <div className="text-left space-y-4 mt-8">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Global Files ({existingFiles.length} found, {missingFiles.length} missing)
              </h3>
              <div className="space-y-2">
                {globalFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        file.status === 'exists'
                          ? 'bg-success'
                          : file.status === 'empty'
                            ? 'bg-warning'
                            : 'bg-muted-foreground/30'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{file.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{file.absolutePath}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        file.status === 'exists'
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {file.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
