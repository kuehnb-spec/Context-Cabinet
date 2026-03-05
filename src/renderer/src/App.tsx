import { useEffect, useState } from 'react'

function App(): JSX.Element {
  const [ipcResult, setIpcResult] = useState<string>('')

  useEffect(() => {
    window.api.ping().then(setIpcResult).catch(() => setIpcResult('IPC not available'))
  }, [])

  return (
    <div className="h-full flex flex-col">
      {/* Title bar drag region */}
      <div className="drag-region h-12 flex items-center px-20 shrink-0">
        <h1 className="text-sm font-medium text-muted-foreground">Context Cabinet</h1>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-6">
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
        </div>
      </div>
    </div>
  )
}

export default App
