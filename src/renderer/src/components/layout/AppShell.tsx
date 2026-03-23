import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { TitleBar } from './TitleBar'
import { ContentArea } from './ContentArea'
import { StatusBar } from './StatusBar'
import { CommandPalette } from '../command-palette/CommandPalette'
import { useFileStore } from '../../stores/file-store'
import { useUIStore } from '../../stores/ui-store'

export function AppShell() {
  const loadGlobalFiles = useFileStore((s) => s.loadGlobalFiles)
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette)
  const viewMode = useUIStore((s) => s.viewMode)
  const isSimple = viewMode === 'simple'

  // Load global files on mount
  useEffect(() => {
    loadGlobalFiles()
  }, [loadGlobalFiles])

  // Cmd+K handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault()
        toggleCommandPalette()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleCommandPalette])

  return (
    <>
      <div className={`h-full flex ${isSimple ? 'simple-mode-active' : ''}`}>
        {/* Sidebar — animated collapse in simple mode */}
        <AnimatePresence initial={false}>
          {!isSimple && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="shrink-0 border-r border-border/50 flex flex-col overflow-hidden"
            >
              <Sidebar />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TitleBar />
          <ContentArea />
          {!isSimple && <StatusBar />}
        </div>
      </div>

      <CommandPalette />
    </>
  )
}
