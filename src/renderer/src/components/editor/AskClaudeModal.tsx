import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Sparkles, Wrench, Search, Plus, RefreshCw,
  ArrowRight, ArrowLeft, Copy, Check, ClipboardPaste, ChevronRight
} from 'lucide-react'
import {
  getIntentsForCategory,
  buildPrompt,
  type PromptIntent,
  type PromptContext
} from '../../data/prompt-builder'
import type { FileCategory } from '../../types/claude-file'

const intentIcons = {
  Sparkles,
  Wrench,
  Search,
  Plus,
  RefreshCw
} as const

type Step = 'intent' | 'questions' | 'prompt' | 'paste'

interface AskClaudeModalProps {
  category: FileCategory | undefined
  context: PromptContext
  onInsert: (content: string) => void
  onClose: () => void
}

export function AskClaudeModal({ category, context, onInsert, onClose }: AskClaudeModalProps) {
  const [step, setStep] = useState<Step>('intent')
  const [selectedIntent, setSelectedIntent] = useState<PromptIntent | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [copied, setCopied] = useState(false)
  const [pasteContent, setPasteContent] = useState('')

  const intents = useMemo(() => getIntentsForCategory(category), [category])

  // Auto-select if only one intent
  const handleSelectIntent = useCallback((intent: PromptIntent) => {
    setSelectedIntent(intent)
    // Initialize answers
    const initial: Record<string, string> = {}
    intent.questions.forEach((q) => {
      initial[q.id] = ''
    })
    setAnswers(initial)
    setStep('questions')
  }, [])

  const handleGeneratePrompt = useCallback(() => {
    if (!selectedIntent) return
    const prompt = buildPrompt(selectedIntent, answers, context)
    setGeneratedPrompt(prompt)
    setStep('prompt')
  }, [selectedIntent, answers, context])

  const handleCopyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = generatedPrompt
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [generatedPrompt])

  const handlePasteFromClaude = useCallback(() => {
    setStep('paste')
  }, [])

  const handleInsert = useCallback(() => {
    if (pasteContent.trim()) {
      onInsert(pasteContent.trim())
    }
    onClose()
  }, [pasteContent, onInsert, onClose])

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) setPasteContent(text)
    } catch {
      // Clipboard access denied
    }
  }, [])

  const canProceed = selectedIntent
    ? selectedIntent.questions
        .filter((q) => q.required)
        .every((q) => answers[q.id]?.trim())
    : false

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[85vh] rounded-xl bg-card border border-border shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Ask Claude</h2>
              <p className="text-xs text-muted-foreground">
                {step === 'intent' && 'What kind of help do you need?'}
                {step === 'questions' && 'Tell Claude about your project'}
                {step === 'prompt' && 'Copy this prompt to Claude'}
                {step === 'paste' && 'Paste Claude\'s response'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 px-6 py-2.5 bg-muted/20 border-b border-border">
          {(['intent', 'questions', 'prompt', 'paste'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground/30" />}
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                  step === s
                    ? 'bg-primary/10 text-primary'
                    : (['intent', 'questions', 'prompt', 'paste'].indexOf(step) > i
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/40')
                }`}
              >
                {s === 'intent' ? 'Choose' : s === 'questions' ? 'Describe' : s === 'prompt' ? 'Copy' : 'Paste'}
              </span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Choose intent */}
            {step === 'intent' && (
              <motion.div
                key="intent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="p-6 space-y-3"
              >
                {intents.map((intent) => {
                  const Icon = intentIcons[intent.icon]
                  return (
                    <button
                      key={intent.id}
                      onClick={() => handleSelectIntent(intent)}
                      className="w-full flex items-start gap-4 p-4 rounded-lg border border-border
                        hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer text-left"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4.5 h-4.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground">{intent.label}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{intent.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-2" />
                    </button>
                  )
                })}
              </motion.div>
            )}

            {/* Step 2: Answer questions */}
            {step === 'questions' && selectedIntent && (
              <motion.div
                key="questions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="p-6 space-y-4"
              >
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Answer a few questions so we can craft the perfect prompt.
                  Claude will use these details to generate content tailored to your project.
                </p>

                {selectedIntent.questions.map((q) => (
                  <div key={q.id}>
                    <label className="text-xs font-medium text-foreground mb-1 block">
                      {q.label}
                      {q.required && <span className="text-primary ml-1">*</span>}
                    </label>
                    {q.type === 'select' ? (
                      <select
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border
                          text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                      >
                        <option value="">Select...</option>
                        {q.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : q.type === 'multiline' ? (
                      <textarea
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                        placeholder={q.placeholder}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border
                          text-sm text-foreground placeholder:text-muted-foreground/50
                          focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                        placeholder={q.placeholder}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border
                          text-sm text-foreground placeholder:text-muted-foreground/50
                          focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                    )}
                    {q.hint && (
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{q.hint}</p>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {/* Step 3: Preview and copy prompt */}
            {step === 'prompt' && (
              <motion.div
                key="prompt"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="p-6 space-y-4"
              >
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Generated Prompt
                    </span>
                    <button
                      onClick={handleCopyPrompt}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
                        transition-all cursor-pointer ${
                          copied
                            ? 'bg-success/10 text-success'
                            : 'bg-primary/10 text-primary hover:bg-primary/20'
                        }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy to clipboard
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-xs text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {generatedPrompt}
                  </pre>
                </div>

                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <h4 className="text-xs font-semibold text-foreground mb-2">Next steps:</h4>
                  <ol className="space-y-1.5 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">1.</span>
                      Click "Copy to clipboard" above
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">2.</span>
                      Open <strong>claude.ai</strong> and paste the prompt
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">3.</span>
                      Copy Claude's response
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">4.</span>
                      Click "I have Claude's response" below to paste it back
                    </li>
                  </ol>
                </div>
              </motion.div>
            )}

            {/* Step 4: Paste back */}
            {step === 'paste' && (
              <motion.div
                key="paste"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="p-6 space-y-4"
              >
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Paste Claude's response below. It will be inserted into your editor.
                </p>

                <div className="flex items-center gap-2 mb-1">
                  <label className="text-xs font-medium text-foreground flex-1">
                    Claude's response
                  </label>
                  <button
                    onClick={handlePasteFromClipboard}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs
                      text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted
                      transition-colors cursor-pointer"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    Paste from clipboard
                  </button>
                </div>

                <textarea
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder="Paste Claude's response here..."
                  rows={14}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border
                    text-sm text-foreground font-mono placeholder:text-muted-foreground/50
                    focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none leading-relaxed"
                />

                {pasteContent.trim() && (
                  <p className="text-[10px] text-muted-foreground">
                    {pasteContent.split('\n').length} lines · This will{' '}
                    {context.currentContent.trim()
                      ? 'replace the current content'
                      : 'be inserted into the empty file'}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <div>
            {step !== 'intent' && (
              <button
                onClick={() => {
                  if (step === 'questions') setStep('intent')
                  if (step === 'prompt') setStep('questions')
                  if (step === 'paste') setStep('prompt')
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground
                  hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground
                transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {step === 'questions' && (
              <button
                onClick={handleGeneratePrompt}
                disabled={!canProceed}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground
                  font-medium text-sm hover:bg-primary/90 disabled:opacity-40 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Generate Prompt
              </button>
            )}

            {step === 'prompt' && (
              <button
                onClick={handlePasteFromClaude}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground
                  font-medium text-sm hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <ClipboardPaste className="w-4 h-4" />
                I have Claude's response
              </button>
            )}

            {step === 'paste' && (
              <button
                onClick={handleInsert}
                disabled={!pasteContent.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground
                  font-medium text-sm hover:bg-primary/90 disabled:opacity-40 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Insert into editor
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
