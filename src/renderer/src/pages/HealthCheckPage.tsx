import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Activity, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react'
import { useFileStore } from '../stores/file-store'
import { useUIStore } from '../stores/ui-store'

interface Issue {
  severity: 'critical' | 'warning' | 'info'
  message: string
  fix?: string
  filePath?: string
}

function analyzeHealth(content: string | null, filePath: string): Issue[] {
  const issues: Issue[] = []

  if (!content) {
    issues.push({
      severity: 'critical',
      message: 'File does not exist or is empty',
      fix: 'Create this file with basic project context',
      filePath
    })
    return issues
  }

  const lines = content.split('\n')
  const lineCount = lines.length

  // Check length
  if (lineCount > 200) {
    issues.push({
      severity: 'warning',
      message: `File is ${lineCount} lines (recommended: under 200)`,
      fix: 'Consider splitting into rules files or trimming less important sections',
      filePath
    })
  }

  // Check for headers
  const hasHeaders = lines.some((l) => l.startsWith('#'))
  if (!hasHeaders) {
    issues.push({
      severity: 'warning',
      message: 'No markdown headers found',
      fix: 'Add headers to organize content into clear sections',
      filePath
    })
  }

  // Check for too many absolute rules
  const absoluteWords = content.match(/\b(never|always|must|shall|forbidden)\b/gi) || []
  if (absoluteWords.length > 10) {
    issues.push({
      severity: 'info',
      message: `${absoluteWords.length} absolute directives found (never, always, must...)`,
      fix: 'Too many rigid rules can limit Claude\'s helpfulness. Consider softening some.',
      filePath
    })
  }

  // Check for code blocks
  const hasCodeExamples = content.includes('```')
  if (!hasCodeExamples && lineCount > 20) {
    issues.push({
      severity: 'info',
      message: 'No code examples found',
      fix: 'Adding code examples helps Claude understand your preferred patterns',
      filePath
    })
  }

  // Check for common sections
  const contentLower = content.toLowerCase()
  if (!contentLower.includes('command') && !contentLower.includes('script') && !contentLower.includes('run')) {
    issues.push({
      severity: 'info',
      message: 'No build/test commands documented',
      fix: 'Add a Commands section with common dev commands',
      filePath
    })
  }

  if (issues.length === 0) {
    issues.push({
      severity: 'info',
      message: 'Looks good! No issues detected.',
      filePath
    })
  }

  return issues
}

function ScoreRing({ score, size = 100 }: { score: number; size?: number }) {
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={6}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>
          {score}
        </span>
      </div>
    </div>
  )
}

export function HealthCheckPage() {
  const globalFiles = useFileStore((s) => s.globalFiles)
  const navigateTo = useUIStore((s) => s.navigateTo)

  // Find CLAUDE.md files to analyze
  const claudeMdFiles = globalFiles.filter(
    (f) => f.category === 'instructions' && f.filename.includes('CLAUDE')
  )

  const allIssues = useMemo(() => {
    const results: { filePath: string; displayName: string; issues: Issue[] }[] = []
    for (const file of claudeMdFiles) {
      results.push({
        filePath: file.absolutePath,
        displayName: file.displayName,
        issues: analyzeHealth(file.content, file.absolutePath)
      })
    }
    return results
  }, [claudeMdFiles])

  const totalIssues = allIssues.reduce((sum, r) => sum + r.issues.filter((i) => i.severity !== 'info' || !i.message.includes('Looks good')).length, 0)
  const criticalCount = allIssues.reduce((sum, r) => sum + r.issues.filter((i) => i.severity === 'critical').length, 0)
  const warningCount = allIssues.reduce((sum, r) => sum + r.issues.filter((i) => i.severity === 'warning').length, 0)

  // Simple score: start at 100, deduct for issues
  const score = Math.max(0, Math.min(100,
    100 - criticalCount * 30 - warningCount * 15 - (totalIssues - criticalCount - warningCount) * 5
  ))

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold text-foreground">Health Check</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Analyze your Claude configuration files for best practices.
        </p>
      </div>

      {/* Score overview */}
      <div className="flex items-center gap-8 rounded-xl bg-card border border-border p-6">
        <ScoreRing score={score} />
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {score >= 80 ? 'Great setup!' : score >= 50 ? 'Room for improvement' : 'Needs attention'}
          </h2>
          <div className="flex items-center gap-4 text-sm">
            {criticalCount > 0 && (
              <span className="flex items-center gap-1.5 text-destructive">
                <XCircle className="w-4 h-4" />
                {criticalCount} critical
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center gap-1.5 text-warning">
                <AlertTriangle className="w-4 h-4" />
                {warningCount} warnings
              </span>
            )}
            <span className="flex items-center gap-1.5 text-success">
              <CheckCircle2 className="w-4 h-4" />
              {claudeMdFiles.filter((f) => f.status === 'exists').length} files configured
            </span>
          </div>
        </div>
      </div>

      {/* Issue list */}
      <div className="space-y-6">
        {allIssues.map((result) => (
          <div key={result.filePath} className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">{result.displayName}</h3>
            <div className="space-y-2">
              {result.issues.map((issue, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border"
                >
                  {issue.severity === 'critical' ? (
                    <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  ) : issue.severity === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{issue.message}</p>
                    {issue.fix && (
                      <p className="text-xs text-muted-foreground mt-1">{issue.fix}</p>
                    )}
                  </div>
                  {issue.filePath && issue.severity !== 'info' && (
                    <button
                      onClick={() =>
                        navigateTo({ type: 'editor', filePath: issue.filePath! })
                      }
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 shrink-0 cursor-pointer"
                    >
                      Fix
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {claudeMdFiles.length === 0 && (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No instruction files found to analyze.
          </p>
        </div>
      )}
    </div>
  )
}
