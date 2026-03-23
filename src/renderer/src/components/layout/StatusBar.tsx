import { useFileStore } from '../../stores/file-store'
import { useProjectStore } from '../../stores/project-store'

export function StatusBar() {
  const globalFiles = useFileStore((s) => s.globalFiles)
  const projects = useProjectStore((s) => s.projects)

  const existingCount = globalFiles.filter((f) => f.status === 'exists').length
  const totalCount = globalFiles.length

  return (
    <div className="h-8 flex items-center justify-between px-4 border-t border-border/50 text-xs text-muted-foreground shrink-0">
      <div className="flex items-center gap-4">
        <span>
          {existingCount}/{totalCount} global files
        </span>
        {projects.length > 0 && (
          <span>{projects.length} projects</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-success" />
        <span>Connected</span>
      </div>
    </div>
  )
}
