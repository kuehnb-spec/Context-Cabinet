import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Lightbulb, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
  BookTemplate, Sparkles
} from 'lucide-react'
import type { FileInfo } from '../../data/file-info'

interface GuidancePanelProps {
  fileInfo: FileInfo
  content: string
  onOpenTemplates: () => void
}

/** Analyze file content and suggest improvements */
function analyzeContent(content: string, fileInfo: FileInfo): Suggestion[] {
  const suggestions: Suggestion[] = []
  const lines = content.split('\n')
  const lineCount = lines.length
  const trimmedContent = content.trim()

  // Length check
  if (lineCount > 200) {
    suggestions.push({
      type: 'warning',
      title: 'File is getting long',
      description: `${lineCount} lines. Claude reads this every message — consider trimming to under 200 lines for best performance.`
    })
  } else if (lineCount < 10 && trimmedContent.length > 0) {
    suggestions.push({
      type: 'tip',
      title: 'Room to add more context',
      description: 'Even a few more lines of project context can significantly improve Claude\'s output. Consider adding commands, conventions, or architecture notes.'
    })
  }

  // Markdown-specific checks
  if (!content.includes('.json')) {
    // Check for headers
    if (!content.includes('# ') && trimmedContent.length > 50) {
      suggestions.push({
        type: 'tip',
        title: 'Add markdown headers',
        description: 'Headers help Claude quickly scan and find relevant sections. Use ## for main sections like Commands, Conventions, Structure.'
      })
    }

    // Check for commands section
    if (
      !content.toLowerCase().includes('command') &&
      !content.includes('npm ') &&
      !content.includes('yarn ') &&
      !content.includes('pnpm ') &&
      !content.includes('cargo ') &&
      !content.includes('pytest') &&
      trimmedContent.length > 100
    ) {
      suggestions.push({
        type: 'tip',
        title: 'Add a Commands section',
        description: 'Listing your dev/test/build commands is one of the highest-impact things you can add. Claude needs to know how to run your project.'
      })
    }

    // Check for vague instructions
    const vagueTerms = ['write good code', 'best practices', 'clean code', 'high quality']
    for (const term of vagueTerms) {
      if (content.toLowerCase().includes(term)) {
        suggestions.push({
          type: 'warning',
          title: `"${term}" is too vague`,
          description: 'Replace with specific, actionable instructions. E.g., instead of "write clean code" try "use early returns" or "keep functions under 30 lines".'
        })
        break
      }
    }

    // Check for "Don't" section
    if (
      !content.toLowerCase().includes("don't") &&
      !content.toLowerCase().includes('do not') &&
      !content.toLowerCase().includes('never') &&
      !content.toLowerCase().includes('avoid') &&
      trimmedContent.length > 200
    ) {
      suggestions.push({
        type: 'tip',
        title: 'Consider adding a "Don\'t" section',
        description: 'Negative instructions are surprisingly effective. Telling Claude what NOT to do (e.g., "Don\'t add comments to obvious code") prevents common annoyances.'
      })
    }
  }

  // JSON-specific checks
  if (content.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(content)
      if (parsed.permissions) {
        if (!parsed.permissions.deny || parsed.permissions.deny.length === 0) {
          suggestions.push({
            type: 'warning',
            title: 'No deny rules configured',
            description: 'Consider adding explicit deny rules for dangerous commands like "Bash(rm -rf /)" and "Bash(sudo:*)".'
          })
        }
        if (!parsed.permissions.allow || parsed.permissions.allow.length === 0) {
          suggestions.push({
            type: 'tip',
            title: 'No allow rules configured',
            description: 'Pre-approving common commands (git, npm, read/write) dramatically reduces permission prompts.'
          })
        }
      }
    } catch {
      // Not valid JSON yet, that's fine
    }
  }

  return suggestions
}

interface Suggestion {
  type: 'tip' | 'warning' | 'success'
  title: string
  description: string
}

export function GuidancePanel({ fileInfo, content, onOpenTemplates }: GuidancePanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const suggestions = analyzeContent(content, fileInfo)

  if (suggestions.length === 0 && content.trim().length > 0) {
    return null // Don't show panel if no suggestions and content exists
  }

  return (
    <div className="border-l border-border w-72 shrink-0 flex flex-col bg-card/30 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-4 py-3 border-b border-border
          hover:bg-muted/30 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Guidance</span>
          {suggestions.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {suggestions.length}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Suggestions */}
          {suggestions.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border border-border/50 bg-card/50 p-3"
            >
              <div className="flex items-start gap-2 mb-1">
                {s.type === 'tip' && <Lightbulb className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />}
                {s.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />}
                {s.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />}
                <h4 className="text-xs font-medium text-foreground">{s.title}</h4>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pl-5">
                {s.description}
              </p>
            </motion.div>
          ))}

          {/* Quick actions */}
          <div className="pt-2 border-t border-border/30">
            <button
              onClick={onOpenTemplates}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground
                hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <BookTemplate className="w-3.5 h-3.5" />
              Insert from template
            </button>
          </div>

          {/* Best practices reminder */}
          <div className="pt-2 border-t border-border/30">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Quick Tips
            </p>
            {fileInfo.proTips.slice(0, 2).map((tip, i) => (
              <p key={i} className="text-[11px] text-muted-foreground/80 leading-relaxed mb-2">
                {tip}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
