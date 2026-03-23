import type { FileCategory } from '../types/claude-file'

// ─── Types ───

export interface GuidedQuestion {
  id: string
  label: string
  placeholder: string
  /** Hint text shown below the field */
  hint?: string
  type: 'text' | 'select' | 'multiline'
  options?: string[]
  /** Whether this question is required for a good prompt */
  required?: boolean
}

export interface PromptIntent {
  id: string
  label: string
  description: string
  /** Icon name from lucide */
  icon: 'Sparkles' | 'Wrench' | 'Search' | 'Plus' | 'RefreshCw'
  questions: GuidedQuestion[]
  buildPrompt: (answers: Record<string, string>, context: PromptContext) => string
}

export interface PromptContext {
  filePath: string
  fileName: string
  fileCategory: FileCategory | undefined
  fileDisplayName: string
  currentContent: string
  projectPath?: string
}

// ─── Question banks per intent ───

const commonProjectQuestions: GuidedQuestion[] = [
  {
    id: 'language',
    label: 'Primary language',
    placeholder: 'TypeScript, Python, Go, Rust...',
    type: 'text',
    required: true
  },
  {
    id: 'framework',
    label: 'Framework / stack',
    placeholder: 'React + Next.js, FastAPI, Rails...',
    type: 'text',
    required: true
  },
  {
    id: 'projectDescription',
    label: 'What does this project do?',
    placeholder: 'A task management app with real-time collaboration...',
    type: 'multiline',
    hint: 'One or two sentences is perfect.'
  },
  {
    id: 'packageManager',
    label: 'Package manager',
    placeholder: 'npm, pnpm, uv, cargo...',
    type: 'text'
  }
]

// ─── Intents per file category ───

const instructionsIntents: PromptIntent[] = [
  {
    id: 'generate-instructions',
    label: 'Generate content',
    description: 'Have Claude write instructions tailored to your project.',
    icon: 'Sparkles',
    questions: [
      ...commonProjectQuestions,
      {
        id: 'conventions',
        label: 'Key conventions or preferences',
        placeholder: 'Strict TypeScript, functional components, Tailwind for styling...',
        type: 'multiline',
        hint: 'Any coding style, patterns, or rules you care about.'
      },
      {
        id: 'commands',
        label: 'Key commands (dev, test, build, lint)',
        placeholder: 'npm run dev, npm test, npm run build',
        type: 'multiline',
        hint: 'Claude needs to know how to run your project.'
      }
    ],
    buildPrompt: (answers, ctx) => {
      const isGlobal = ctx.filePath.includes('.claude/CLAUDE.md') || ctx.filePath.includes('~/.claude')
      const scope = isGlobal
        ? 'global instructions (applying to ALL my projects)'
        : 'project-specific instructions (committed to git, shared with team)'

      return `I'm setting up my Claude Code ${scope} file at:
${ctx.filePath}

Please write a well-structured CLAUDE.md file for me. Here's my context:

${answers.projectDescription ? `**Project**: ${answers.projectDescription}` : ''}
${answers.language ? `**Language**: ${answers.language}` : ''}
${answers.framework ? `**Framework**: ${answers.framework}` : ''}
${answers.packageManager ? `**Package manager**: ${answers.packageManager}` : ''}
${answers.commands ? `**Key commands**: ${answers.commands}` : ''}
${answers.conventions ? `**Conventions/preferences**: ${answers.conventions}` : ''}

Guidelines for the output:
- Use clear markdown headers (## sections)
- Keep it under 150 lines — concise and scannable
- Include a Commands section with the actual commands
- Include a Conventions section with specific, actionable rules
- Include a "Don't Do" section with 5-8 things Claude should avoid
${isGlobal ? '- Focus on personal preferences that apply across ALL projects' : '- Focus on project-specific context that helps Claude understand THIS codebase'}
- Don't include generic advice — be specific to my stack and preferences
- Output ONLY the markdown content, no explanation around it`
    }
  },
  {
    id: 'improve-instructions',
    label: 'Improve existing',
    description: 'Review and suggest improvements to your current instructions.',
    icon: 'Wrench',
    questions: [
      {
        id: 'painPoints',
        label: 'What\'s not working well?',
        placeholder: 'Claude keeps adding JSDoc comments I don\'t want, or ignores my test patterns...',
        type: 'multiline',
        hint: 'Describe frustrations or things Claude gets wrong.'
      },
      {
        id: 'wishList',
        label: 'What do you wish Claude did better?',
        placeholder: 'Follow our naming conventions, use our custom hooks, match our error handling pattern...',
        type: 'multiline'
      }
    ],
    buildPrompt: (answers, ctx) => {
      return `I have an existing Claude Code instructions file and I'd like help improving it.

**File**: ${ctx.filePath}

**Current content**:
\`\`\`markdown
${ctx.currentContent}
\`\`\`

${answers.painPoints ? `**What's not working**: ${answers.painPoints}` : ''}
${answers.wishList ? `**What I wish was better**: ${answers.wishList}` : ''}

Please review my current instructions and suggest an improved version that:
- Keeps what's working well
- Addresses my pain points with specific, actionable instructions
- Adds any missing sections that would be high-impact
- Stays under 150 lines
- Uses clear markdown structure
- Output ONLY the improved markdown content, no explanation`
    }
  }
]

const settingsIntents: PromptIntent[] = [
  {
    id: 'generate-settings',
    label: 'Generate settings',
    description: 'Have Claude create permissions tuned to your workflow.',
    icon: 'Sparkles',
    questions: [
      {
        id: 'language',
        label: 'Primary language / ecosystem',
        placeholder: 'Node.js, Python, Rust, Go...',
        type: 'text',
        required: true
      },
      {
        id: 'tools',
        label: 'Tools you use frequently',
        placeholder: 'npm, docker compose, pytest, cargo, make...',
        type: 'multiline',
        hint: 'Commands you want Claude to run WITHOUT asking permission.'
      },
      {
        id: 'strictness',
        label: 'Permission strictness',
        type: 'select',
        placeholder: '',
        options: [
          'Permissive — let Claude run most dev commands freely',
          'Moderate — allow common tools, ask for others',
          'Restrictive — Claude asks for most commands'
        ]
      }
    ],
    buildPrompt: (answers, ctx) => {
      const isGlobal = ctx.filePath.includes('/.claude/settings.json') && !ctx.filePath.includes('.local')

      return `I need a Claude Code settings.json file for ${isGlobal ? 'my global configuration' : 'this project'}.

**File**: ${ctx.filePath}
${answers.language ? `**Ecosystem**: ${answers.language}` : ''}
${answers.tools ? `**Tools I use**: ${answers.tools}` : ''}
${answers.strictness ? `**Preference**: ${answers.strictness}` : ''}

Please generate a settings.json that:
- Pre-approves the commands/tools I listed (use wildcard patterns like "Bash(npm:*)")
- Always includes deny rules for dangerous operations (rm -rf /, sudo)
- Includes Read, Write, Edit in allow for file operations
- Uses proper JSON format with "permissions": { "allow": [...], "deny": [...] }
- Output ONLY the JSON, no explanation`
    }
  }
]

const rulesIntents: PromptIntent[] = [
  {
    id: 'generate-rules',
    label: 'Generate rules',
    description: 'Create path-scoped rules for specific file types.',
    icon: 'Sparkles',
    questions: [
      {
        id: 'fileTypes',
        label: 'What file types should this rule target?',
        placeholder: '**/*.tsx, src/api/**/*.ts, **/*.test.ts...',
        type: 'text',
        required: true,
        hint: 'Use glob patterns. Examples: **/*.tsx for all React files, src/api/**/*.ts for API routes.'
      },
      {
        id: 'language',
        label: 'Language / framework',
        placeholder: 'React + TypeScript, Python + FastAPI...',
        type: 'text'
      },
      {
        id: 'standards',
        label: 'What standards do you want enforced?',
        placeholder: 'Named exports only, always validate input, use our custom hooks, no inline styles...',
        type: 'multiline',
        hint: 'Be specific. "Use early returns" is better than "write clean code".'
      },
      {
        id: 'antiPatterns',
        label: 'Anti-patterns to prevent',
        placeholder: 'No default exports, no any types, no direct DOM manipulation in React...',
        type: 'multiline'
      }
    ],
    buildPrompt: (answers, ctx) => {
      return `I need a Claude Code rules file with path-scoped standards.

**File**: ${ctx.filePath}
${answers.fileTypes ? `**Target files**: ${answers.fileTypes}` : ''}
${answers.language ? `**Language/framework**: ${answers.language}` : ''}
${answers.standards ? `**Standards to enforce**: ${answers.standards}` : ''}
${answers.antiPatterns ? `**Anti-patterns to prevent**: ${answers.antiPatterns}` : ''}

Please generate a rules markdown file that:
- Starts with YAML frontmatter containing \`globs: "${answers.fileTypes || '**/*'}"\`
- Has a clear title and organized sections
- Contains specific, actionable rules (not vague "best practices")
- Includes both DO and DON'T rules
- Keeps total under 30 rules for clarity
- Output ONLY the markdown with frontmatter, no explanation`
    }
  }
]

const ignoreIntents: PromptIntent[] = [
  {
    id: 'generate-ignore',
    label: 'Generate ignore patterns',
    description: 'Create a .claudeignore tailored to your project type.',
    icon: 'Sparkles',
    questions: [
      {
        id: 'ecosystem',
        label: 'Project ecosystem',
        type: 'select',
        placeholder: '',
        options: [
          'Node.js / JavaScript / TypeScript',
          'Python',
          'Rust',
          'Go',
          'Java / Kotlin',
          'Ruby',
          'Monorepo (multiple packages)',
          'Other'
        ],
        required: true
      },
      {
        id: 'extras',
        label: 'Additional directories or files to ignore',
        placeholder: 'data/, *.sqlite, vendor/, generated-api-client/...',
        type: 'multiline',
        hint: 'Large or generated files that waste Claude\'s context.'
      }
    ],
    buildPrompt: (answers, ctx) => {
      return `I need a .claudeignore file for my project.

**File**: ${ctx.filePath}
${answers.ecosystem ? `**Ecosystem**: ${answers.ecosystem}` : ''}
${answers.extras ? `**Extra ignores**: ${answers.extras}` : ''}

Please generate a comprehensive .claudeignore that:
- Ignores standard build artifacts for my ecosystem
- Ignores dependency directories (node_modules, venv, etc.)
- Ignores .env files and secrets
- Ignores IDE and OS files
- Ignores lock files (they're huge and Claude rarely needs them)
- Ignores test coverage output
- Includes helpful comments explaining each section
${answers.extras ? `- Includes my custom ignores: ${answers.extras}` : ''}
- Output ONLY the .claudeignore content, no explanation`
    }
  }
]

const skillsIntents: PromptIntent[] = [
  {
    id: 'generate-skill',
    label: 'Generate a skill',
    description: 'Create a custom slash command.',
    icon: 'Sparkles',
    questions: [
      {
        id: 'skillName',
        label: 'Skill name (the /command)',
        placeholder: 'review, deploy, test, explain...',
        type: 'text',
        required: true,
        hint: 'Short and memorable — you\'ll type this often.'
      },
      {
        id: 'skillPurpose',
        label: 'What should this skill do?',
        placeholder: 'Review code for security issues, deploy to staging, generate tests...',
        type: 'multiline',
        required: true
      },
      {
        id: 'outputFormat',
        label: 'What output format do you expect?',
        placeholder: 'A checklist with findings, a test file, a summary report...',
        type: 'text'
      }
    ],
    buildPrompt: (answers, ctx) => {
      return `I need a Claude Code SKILL.md file for a custom slash command.

**File**: ${ctx.filePath}
${answers.skillName ? `**Command name**: /${answers.skillName}` : ''}
${answers.skillPurpose ? `**Purpose**: ${answers.skillPurpose}` : ''}
${answers.outputFormat ? `**Expected output**: ${answers.outputFormat}` : ''}

Please generate a SKILL.md that:
- Has YAML frontmatter with name and description
- Provides clear, step-by-step instructions for Claude
- Specifies the expected output format
- Is focused on ONE task (not a Swiss Army knife)
- Output ONLY the markdown with frontmatter, no explanation`
    }
  }
]

const agentsIntents: PromptIntent[] = [
  {
    id: 'generate-agent',
    label: 'Generate an agent',
    description: 'Create a specialized subagent.',
    icon: 'Sparkles',
    questions: [
      {
        id: 'agentRole',
        label: 'Agent\'s role/specialty',
        placeholder: 'Security reviewer, documentation writer, test generator...',
        type: 'text',
        required: true
      },
      {
        id: 'agentContext',
        label: 'What does this agent need to know about your project?',
        placeholder: 'We use Zod for validation, our API returns { data, error } format...',
        type: 'multiline'
      },
      {
        id: 'agentOutput',
        label: 'Expected output format',
        placeholder: 'A findings report with severity ratings, a test file, docs...',
        type: 'text'
      }
    ],
    buildPrompt: (answers, ctx) => {
      return `I need a Claude Code agent markdown file for a specialized subagent.

**File**: ${ctx.filePath}
${answers.agentRole ? `**Agent role**: ${answers.agentRole}` : ''}
${answers.agentContext ? `**Project context**: ${answers.agentContext}` : ''}
${answers.agentOutput ? `**Output format**: ${answers.agentOutput}` : ''}

Please generate an agent markdown file that:
- Clearly defines the agent's role and expertise
- Includes project-specific context so the agent understands our codebase
- Specifies the output format and quality standards
- Is focused on one domain (not a generalist)
- Output ONLY the markdown, no explanation`
    }
  }
]

const genericIntents: PromptIntent[] = [
  {
    id: 'generate-generic',
    label: 'Generate content',
    description: 'Have Claude write content for this file.',
    icon: 'Sparkles',
    questions: [
      {
        id: 'purpose',
        label: 'What should this file contain?',
        placeholder: 'Describe what you want...',
        type: 'multiline',
        required: true
      }
    ],
    buildPrompt: (answers, ctx) => {
      return `I need help writing content for a Claude Code configuration file.

**File**: ${ctx.filePath} (${ctx.fileDisplayName})
${ctx.currentContent ? `\n**Current content**:\n\`\`\`\n${ctx.currentContent}\n\`\`\`` : '(Currently empty)'}
${answers.purpose ? `\n**What I want**: ${answers.purpose}` : ''}

Please generate appropriate content for this file. Output ONLY the file content, no explanation.`
    }
  }
]

// ─── Public API ───

/** Get the available intents for a given file category */
export function getIntentsForCategory(category: FileCategory | undefined): PromptIntent[] {
  switch (category) {
    case 'instructions':
      return instructionsIntents
    case 'settings':
      return settingsIntents
    case 'rules':
      return rulesIntents
    case 'ignore':
      return ignoreIntents
    case 'skills':
      return skillsIntents
    case 'agents':
      return agentsIntents
    default:
      return genericIntents
  }
}

/** Build a prompt from an intent, answers, and context */
export function buildPrompt(
  intent: PromptIntent,
  answers: Record<string, string>,
  context: PromptContext
): string {
  // Clean empty answers
  const cleaned: Record<string, string> = {}
  for (const [key, value] of Object.entries(answers)) {
    if (value.trim()) cleaned[key] = value.trim()
  }
  return intent.buildPrompt(cleaned, context).replace(/\n{3,}/g, '\n\n').trim()
}
