import { useState, useEffect, useCallback, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ArrowLeft, ExternalLink, FolderOpen, BookTemplate, Lightbulb, Sparkles } from 'lucide-react'
import { useUIStore } from '../stores/ui-store'
import { useFileStore } from '../stores/file-store'
import { CodeEditor } from '../components/editor/CodeEditor'
import { StashButton } from '../components/editor/StashButton'
import { TemplatePicker } from '../components/editor/TemplatePicker'
import { AskClaudeModal } from '../components/editor/AskClaudeModal'
import { GuidancePanel } from '../components/editor/GuidancePanel'
import { useToast } from '../components/shared/Toast'
import { getFileInfo } from '../data/file-info'
import type { PromptContext } from '../data/prompt-builder'
import type { FileCategory } from '../types/claude-file'

/** Map file paths to categories for template filtering */
function detectCategory(filePath: string): FileCategory | undefined {
  if (filePath.includes('CLAUDE') && filePath.endsWith('.md')) return 'instructions'
  if (filePath.endsWith('settings.json') || filePath.endsWith('settings.local.json')) return 'settings'
  if (filePath.endsWith('keybindings.json')) return 'keybindings'
  if (filePath.includes('/rules/')) return 'rules'
  if (filePath.includes('/skills/')) return 'skills'
  if (filePath.includes('/agents/')) return 'agents'
  if (filePath.includes('/hooks/')) return 'hooks'
  if (filePath.includes('/commands/')) return 'commands'
  if (filePath.includes('.claudeignore')) return 'ignore'
  if (filePath.includes('MEMORY')) return 'memory'
  return undefined
}

/** Derive a relative-ish path for file-info lookup */
function deriveInfoKey(filePath: string): string {
  if (filePath.includes('.claude/rules/')) return '.claude/rules/*.md'
  if (filePath.includes('.claude/skills/')) return '.claude/skills/*/SKILL.md'
  if (filePath.includes('.claude/agents/')) return '.claude/agents/*.md'
  if (filePath.includes('.claude/hooks/')) return '.claude/hooks/*'
  if (filePath.includes('.claude/commands/')) return '.claude/commands/*.md'
  if (filePath.includes('.claude/settings.local.json')) return '.claude/settings.local.json'
  if (filePath.includes('.claude/settings.json')) return '.claude/settings.json'
  if (filePath.includes('.claudeignore')) return '.claudeignore'
  if (filePath.includes('CLAUDE.local.md')) return 'CLAUDE.local.md'
  if (filePath.includes('/.claude/') && filePath.endsWith('CLAUDE.md')) return 'CLAUDE.md'
  if (filePath.includes('MEMORY.md')) return 'memory/MEMORY.md'
  // Global paths
  if (filePath.includes('.claude/CLAUDE.md')) return '~/.claude/CLAUDE.md'
  if (filePath.includes('.claude/settings.json')) return '~/.claude/settings.json'
  if (filePath.includes('.claude/keybindings.json')) return '~/.claude/keybindings.json'
  if (filePath.includes('.claude/rules/')) return '~/.claude/rules/*.md'
  if (filePath.includes('.claude/skills/')) return '~/.claude/skills/*/SKILL.md'
  if (filePath.includes('.claude/agents/')) return '~/.claude/agents/*.md'
  if (filePath.includes('.claude/hooks/')) return '~/.claude/hooks/*'
  return filePath
}

interface EditorPageProps {
  filePath: string
}

export function EditorPage({ filePath }: EditorPageProps) {
  const goBack = useUIStore((s) => s.goBack)
  const loadGlobalFiles = useFileStore((s) => s.loadGlobalFiles)
  const { toast } = useToast()
  const [content, setContent] = useState<string>('')
  const [originalContent, setOriginalContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [showAskClaude, setShowAskClaude] = useState(false)

  const isDirty = content !== originalContent
  const isJson = filePath.endsWith('.json')
  const isEmpty = content.trim() === ''
  const fileName = filePath.split('/').pop() || filePath
  const lineCount = content.split('\n').length
  const category = detectCategory(filePath)
  const fileInfo = useMemo(() => getFileInfo(deriveInfoKey(filePath)), [filePath])

  // Load file content
  useEffect(() => {
    setIsLoading(true)
    setError(null)
    window.api.files
      .read(filePath)
      .then((text) => {
        setContent(text)
        setOriginalContent(text)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(String(err))
        setIsLoading(false)
      })
  }, [filePath])

  // Cmd+S handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 's') {
        e.preventDefault()
        if (isDirty) handleSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const handleSave = useCallback(async () => {
    await window.api.files.write(filePath, content)
    setOriginalContent(content)
    loadGlobalFiles()
    toast(`${fileName} saved successfully`, 'success')
  }, [filePath, content, loadGlobalFiles, toast, fileName])

  const handleInsertTemplate = (templateContent: string) => {
    if (isEmpty) {
      setContent(templateContent)
    } else {
      setContent(content + '\n\n' + templateContent)
    }
    toast('Template inserted', 'success')
  }

  const handleInsertFromClaude = (responseContent: string) => {
    if (isEmpty) {
      setContent(responseContent)
    } else {
      setContent(responseContent) // Replace — Claude generated full file content
    }
    toast('Content from Claude inserted', 'success')
  }

  const promptContext: PromptContext = useMemo(() => ({
    filePath,
    fileName,
    fileCategory: category,
    fileDisplayName: fileInfo?.displayName || fileName,
    currentContent: content
  }), [filePath, fileName, category, fileInfo, content])

  const handleOpenInFinder = () => {
    window.api.shell.openInFinder(filePath)
  }

  const handleOpenInEditor = () => {
    window.api.shell.openInEditor(filePath)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-foreground">{fileName}</h1>
              {isDirty && (
                <span className="w-2 h-2 rounded-full bg-warning" title="Unsaved changes" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{filePath}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAskClaude(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-primary
              hover:bg-primary/10 transition-colors cursor-pointer"
            title="Ask Claude for help writing this file"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask Claude</span>
          </button>
          <button
            onClick={() => setShowTemplatePicker(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground
              hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Insert from template"
          >
            <BookTemplate className="w-4 h-4" />
            <span>Insert Template</span>
          </button>
          <div className="w-px h-5 bg-border mx-1" />
          <button
            onClick={handleOpenInFinder}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Reveal in Finder"
          >
            <FolderOpen className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenInEditor}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Open in default editor"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <StashButton onSave={handleSave} isDirty={isDirty} disabled={!isDirty} />
        </div>
      </div>

      {/* Empty state guidance banner */}
      {!isLoading && !error && isEmpty && fileInfo && (
        <div className="px-6 py-5 border-b border-border bg-primary/5 overflow-y-auto max-h-[50vh]">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Getting started with {fileInfo.displayName}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                {fileInfo.description}
              </p>

              {/* Best practices */}
              <div className="space-y-1 mb-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Best Practices</p>
                {fileInfo.bestPractices.slice(0, 4).map((tip, i) => (
                  <p key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-success">-</span>
                    {tip}
                  </p>
                ))}
              </div>

              {/* Pro tips */}
              {fileInfo.proTips && fileInfo.proTips.length > 0 && (
                <div className="space-y-1 mb-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Pro Tips</p>
                  {fileInfo.proTips.slice(0, 3).map((tip, i) => (
                    <p key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">*</span>
                      {tip}
                    </p>
                  ))}
                </div>
              )}

              {/* Common mistakes */}
              {fileInfo.commonMistakes && fileInfo.commonMistakes.length > 0 && (
                <div className="space-y-1 mb-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Avoid These Mistakes</p>
                  {fileInfo.commonMistakes.slice(0, 2).map((mistake, i) => (
                    <p key={i} className="text-xs text-muted-foreground/80 flex items-start gap-2">
                      <span className="text-warning">!</span>
                      {mistake}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAskClaude(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground
                    text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Ask Claude for help
                </button>
                <button
                  onClick={() => setShowTemplatePicker(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-foreground
                    text-xs font-medium hover:bg-muted transition-colors cursor-pointer"
                >
                  <BookTemplate className="w-3.5 h-3.5" />
                  Choose a template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor + Guidance Panel */}
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : (
            <CodeEditor
              value={content}
              onChange={setContent}
              language={isJson ? 'json' : 'markdown'}
            />
          )}
        </div>

        {/* Contextual guidance panel */}
        {!isLoading && !error && fileInfo && !isEmpty && (
          <GuidancePanel
            fileInfo={fileInfo}
            content={content}
            onOpenTemplates={() => setShowTemplatePicker(true)}
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-2 border-t border-border text-xs text-muted-foreground shrink-0">
        <div className="flex items-center gap-4">
          <span>{lineCount} lines</span>
          <span>{isJson ? 'JSON' : 'Markdown'}</span>
        </div>
        <div>
          {isDirty ? (
            <span className="text-warning">Unsaved changes</span>
          ) : (
            <span>Saved</span>
          )}
        </div>
      </div>

      {/* Template Picker Modal */}
      <AnimatePresence>
        {showTemplatePicker && (
          <TemplatePicker
            category={category}
            onInsert={handleInsertTemplate}
            onClose={() => setShowTemplatePicker(false)}
          />
        )}
      </AnimatePresence>

      {/* Ask Claude Modal */}
      <AnimatePresence>
        {showAskClaude && (
          <AskClaudeModal
            category={category}
            context={promptContext}
            onInsert={handleInsertFromClaude}
            onClose={() => setShowAskClaude(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
