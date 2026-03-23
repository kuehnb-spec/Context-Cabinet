import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Check, Loader2 } from 'lucide-react'

type SaveState = 'idle' | 'saving' | 'success'

interface StashButtonProps {
  onSave: () => Promise<void>
  disabled?: boolean
  isDirty?: boolean
}

export function StashButton({ onSave, disabled, isDirty }: StashButtonProps) {
  const [state, setState] = useState<SaveState>('idle')

  const handleSave = async () => {
    if (state !== 'idle' || disabled) return
    setState('saving')
    try {
      await onSave()
      setState('success')
      setTimeout(() => setState('idle'), 2000)
    } catch {
      setState('idle')
    }
  }

  return (
    <motion.button
      onClick={handleSave}
      disabled={disabled || state !== 'idle'}
      whileTap={state === 'idle' ? { scale: 0.95 } : undefined}
      className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm
        transition-all cursor-pointer overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed ${
        state === 'success'
          ? 'bg-success text-white'
          : state === 'saving'
            ? 'bg-primary/80 text-primary-foreground'
            : isDirty
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'
              : 'bg-primary/50 text-primary-foreground/70'
      }`}
    >
      <AnimatePresence mode="wait">
        {state === 'saving' && (
          <motion.div
            key="saving"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
          >
            <Loader2 className="w-4 h-4 animate-spin" />
          </motion.div>
        )}
        {state === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
          >
            <Check className="w-4 h-4" />
          </motion.div>
        )}
        {state === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
          >
            <Save className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.span
          key={state}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {state === 'saving' ? 'Stashing...' : state === 'success' ? 'Stashed!' : 'Stash'}
        </motion.span>
      </AnimatePresence>

      {/* Shine effect on success */}
      {state === 'success' && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      )}
    </motion.button>
  )
}
