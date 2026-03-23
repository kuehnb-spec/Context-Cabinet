import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../stores/ui-store'
import { ErrorBoundary } from '../shared/ErrorBoundary'
import { DashboardPage } from '../../pages/DashboardPage'
import { GlobalFilesPage } from '../../pages/GlobalFilesPage'
import { ProjectFilesPage } from '../../pages/ProjectFilesPage'
import { EditorPage } from '../../pages/EditorPage'
import { TemplatesPage } from '../../pages/TemplatesPage'
import { ScannerPage } from '../../pages/ScannerPage'
import { TreeViewPage } from '../../pages/TreeViewPage'
import { HealthCheckPage } from '../../pages/HealthCheckPage'
import { SimpleView } from '../../pages/SimpleView'

function PageContent() {
  const { currentPage } = useUIStore()

  switch (currentPage.type) {
    case 'dashboard':
      return <DashboardPage />
    case 'global-files':
      return <GlobalFilesPage />
    case 'project-files':
      return <ProjectFilesPage projectPath={currentPage.projectPath} />
    case 'editor':
      return <EditorPage filePath={currentPage.filePath} />
    case 'templates':
      return <TemplatesPage />
    case 'scanner':
      return <ScannerPage />
    case 'tree-view':
      return <TreeViewPage />
    case 'health-check':
      return <HealthCheckPage />
    default:
      return <DashboardPage />
  }
}

export function ContentArea() {
  const { currentPage, viewMode } = useUIStore()
  const isSimple = viewMode === 'simple'

  const key = isSimple
    ? 'simple-view'
    : currentPage.type === 'project-files'
      ? `project-files-${currentPage.projectPath}`
      : currentPage.type === 'editor'
        ? `editor-${currentPage.filePath}`
        : currentPage.type

  return (
    <div className="flex-1 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="h-full overflow-y-auto"
        >
          <ErrorBoundary key={key}>
            {isSimple ? <SimpleView /> : <PageContent />}
          </ErrorBoundary>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
