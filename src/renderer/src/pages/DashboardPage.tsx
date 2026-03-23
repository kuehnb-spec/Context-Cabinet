import { useFileStore } from '../stores/file-store'
import { useProjectStore } from '../stores/project-store'
import { useUIStore } from '../stores/ui-store'
import { FolderOpen, FileText, Wand2, FolderSearch, BookTemplate } from 'lucide-react'
import { FileCard } from '../components/file-card/FileCard'

export function DashboardPage() {
  const globalFiles = useFileStore((s) => s.globalFiles)
  const projects = useProjectStore((s) => s.projects)
  const navigateTo = useUIStore((s) => s.navigateTo)

  const existing = globalFiles.filter((f) => f.status === 'exists').length
  const missing = globalFiles.filter((f) => f.status === 'missing').length
  const total = globalFiles.length

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Hero */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Welcome to Context Cabinet</h1>
        <p className="text-muted-foreground">
          Discover, create, and manage your Claude Code configuration files.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
              <FileText className="w-4.5 h-4.5 text-success" />
            </div>
            <span className="text-2xl font-bold text-foreground">{existing}</span>
          </div>
          <p className="text-sm text-muted-foreground">Files configured</p>
        </div>

        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
              <Wand2 className="w-4.5 h-4.5 text-warning" />
            </div>
            <span className="text-2xl font-bold text-foreground">{missing}</span>
          </div>
          <p className="text-sm text-muted-foreground">Files to create</p>
        </div>

        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderOpen className="w-4.5 h-4.5 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">{projects.length}</span>
          </div>
          <p className="text-sm text-muted-foreground">Projects discovered</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Quick Actions
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => navigateTo({ type: 'global-files' })}
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border
              hover:border-primary/30 hover:bg-card/80 transition-all text-left cursor-pointer group"
          >
            <FileText className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-sm font-medium text-foreground">Browse Files</p>
              <p className="text-xs text-muted-foreground">{total} configs</p>
            </div>
          </button>

          <button
            onClick={() => navigateTo({ type: 'scanner' })}
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border
              hover:border-primary/30 hover:bg-card/80 transition-all text-left cursor-pointer group"
          >
            <FolderSearch className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-sm font-medium text-foreground">Scan Projects</p>
              <p className="text-xs text-muted-foreground">Find configs</p>
            </div>
          </button>

          <button
            onClick={() => navigateTo({ type: 'templates' })}
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border
              hover:border-primary/30 hover:bg-card/80 transition-all text-left cursor-pointer group"
          >
            <BookTemplate className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-sm font-medium text-foreground">Templates</p>
              <p className="text-xs text-muted-foreground">Pre-built content</p>
            </div>
          </button>
        </div>
      </div>

      {/* Global files as cards */}
      {globalFiles.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Global Files
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {globalFiles.map((file, i) => (
              <FileCard key={file.id} file={file} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
