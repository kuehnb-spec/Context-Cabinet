import { useFileStore } from '../stores/file-store'
import { FileCard } from '../components/file-card/FileCard'

export function GlobalFilesPage() {
  const globalFiles = useFileStore((s) => s.globalFiles)

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Global Files</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configuration files in ~/.claude/ that apply to all projects.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {globalFiles.map((file, i) => (
          <FileCard key={file.id} file={file} index={i} />
        ))}
      </div>
    </div>
  )
}
