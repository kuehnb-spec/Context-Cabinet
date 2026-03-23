import { useState, useRef, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, ExternalLink, Lightbulb, AlertTriangle } from 'lucide-react'
import type { FileInfo } from '../../data/file-info'

interface InfoPopoverProps {
  info: FileInfo
  trigger: ReactNode
}

export function InfoPopover({ info, trigger }: InfoPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'tips' | 'mistakes'>('tips')
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handler)
    }
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handler)
    }
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen])

  const hasProTips = info.proTips && info.proTips.length > 0
  const hasMistakes = info.commonMistakes && info.commonMistakes.length > 0

  return (
    <div className="relative" ref={popoverRef}>
      <div onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}>
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 right-0 top-8 w-96 glass rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 pb-0">
              <h3 className="text-sm font-semibold text-foreground pr-4">{info.displayName}</h3>
              <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(false) }}
                className="p-0.5 rounded hover:bg-muted/50 text-muted-foreground cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="max-h-[400px] overflow-y-auto p-5 pt-3">
              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                {info.description}
              </p>

              {/* Best Practices */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">
                  Best Practices
                </h4>
                <ul className="space-y-1.5">
                  {info.bestPractices.map((practice, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                      <span>{practice}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro Tips / Common Mistakes tabs */}
              {(hasProTips || hasMistakes) && (
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-2">
                    {hasProTips && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveTab('tips') }}
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded cursor-pointer transition-colors ${
                          activeTab === 'tips'
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Pro Tips
                      </button>
                    )}
                    {hasMistakes && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveTab('mistakes') }}
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded cursor-pointer transition-colors ${
                          activeTab === 'mistakes'
                            ? 'bg-warning/10 text-warning'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Common Mistakes
                      </button>
                    )}
                  </div>

                  {activeTab === 'tips' && hasProTips && (
                    <ul className="space-y-1.5">
                      {info.proTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Lightbulb className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {activeTab === 'mistakes' && hasMistakes && (
                    <ul className="space-y-1.5">
                      {info.commonMistakes.map((mistake, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Scope */}
              <div className="flex items-start gap-2 text-xs text-muted-foreground mb-3">
                <ExternalLink className="w-3 h-3 shrink-0 mt-0.5" />
                <span>{info.scope}</span>
              </div>

              {/* Recommendation */}
              <div className="pt-3 border-t border-border/50">
                <p className="text-xs text-primary font-medium">{info.recommendation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
