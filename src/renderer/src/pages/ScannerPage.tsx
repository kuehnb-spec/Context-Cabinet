import { motion } from 'framer-motion'
import { useProjectStore } from '../stores/project-store'
import { useUIStore } from '../stores/ui-store'
import {
  FolderSearch, Plus, Trash2, Loader2,
  FileText, Settings, Scale, EyeOff, Wand2, Bot, Webhook, CheckCircle2, Circle
} from 'lucide-react'

const configChecks = [
  { key: 'hasClaudeMd', label: 'CLAUDE.md', icon: FileText },
  { key: 'hasSettings', label: 'Settings', icon: Settings },
  { key: 'hasRules', label: 'Rules', icon: Scale },
  { key: 'hasIgnore', label: '.claudeignore', icon: EyeOff },
  { key: 'hasSkills', label: 'Skills', icon: Wand2 },
  { key: 'hasAgents', label: 'Agents', icon: Bot },
  { key: 'hasHooks', label: 'Hooks', icon: Webhook }
] as const

export function ScannerPage() {
  const { scanPaths, projects, isScanning, addScanPath, removeScanPath, startScan } =
    useProjectStore()
  const navigateTo = useUIStore((s) => s.navigateTo)

  const handleAddPath = async () => {
    const path = await window.api.dialog.selectDirectory()
    if (path) addScanPath(path)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Project Scanner</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Discover projects and their Claude configuration status.
        </p>
      </div>

      {/* Scan paths */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Scan Directories
          </h2>
          <button
            onClick={handleAddPath}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Directory
          </button>
        </div>
        <div className="space-y-2">
          {scanPaths.map((path) => (
            <div
              key={path}
              className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-card border border-border"
            >
              <span className="text-sm text-foreground truncate">{path}</span>
              <button
                onClick={() => removeScanPath(path)}
                className="p-1 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Scan button */}
      <button
        onClick={startScan}
        disabled={isScanning}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground
          font-medium text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
      >
        {isScanning ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FolderSearch className="w-4 h-4" />
        )}
        {isScanning ? 'Scanning...' : 'Scan for Projects'}
      </button>

      {/* Results */}
      {projects.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Discovered Projects ({projects.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((project, i) => (
              <motion.div
                key={project.path}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06, ease: 'easeOut' }}
                onClick={() =>
                  navigateTo({ type: 'project-files', projectPath: project.path })
                }
                className="rounded-xl bg-card border border-border p-5
                  hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5
                  hover:-translate-y-1 transition-all cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{project.name}</h3>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{project.path}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-bold ${
                        project.healthScore >= 60
                          ? 'text-success'
                          : project.healthScore >= 30
                            ? 'text-warning'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {project.healthScore}
                    </span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>

                {/* Health bar */}
                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.healthScore}%` }}
                    transition={{ duration: 0.6, delay: i * 0.06 + 0.2, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      project.healthScore >= 60
                        ? 'bg-success'
                        : project.healthScore >= 30
                          ? 'bg-warning'
                          : 'bg-muted-foreground'
                    }`}
                  />
                </div>

                {/* Config checklist */}
                <div className="grid grid-cols-2 gap-1.5">
                  {configChecks.map(({ key, label, icon: Icon }) => {
                    const has = project[key]
                    return (
                      <div key={key} className="flex items-center gap-1.5">
                        {has ? (
                          <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                        ) : (
                          <Circle className="w-3 h-3 text-muted-foreground/30 shrink-0" />
                        )}
                        <span
                          className={`text-xs truncate ${
                            has ? 'text-foreground' : 'text-muted-foreground/50'
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {!isScanning && projects.length === 0 && (
        <div className="text-center py-12">
          <FolderSearch className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Click "Scan for Projects" to discover Claude configurations in your projects.
          </p>
        </div>
      )}
    </div>
  )
}
