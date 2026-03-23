export interface FileInfo {
  displayName: string
  description: string
  bestPractices: string[]
  /** Deep, opinionated tips about what actually works well */
  proTips: string[]
  /** Common mistakes people make */
  commonMistakes: string[]
  exampleContent: string
  scope: string
  recommendation: string
}

export const fileInfoMap: Record<string, FileInfo> = {
  // ─── Global Instructions ───
  '~/.claude/CLAUDE.md': {
    displayName: 'Global Instructions',
    description:
      'Your personal global instructions that apply to every Claude Code session across all projects. This is the single most important file for shaping Claude\'s behavior — think of it as your personal "working agreement" with Claude.',
    bestPractices: [
      'Keep it under 200 lines — Claude reads this every single time, so brevity matters',
      'Use clear markdown headers to organize into sections',
      'Include your coding style preferences (language, framework conventions)',
      'Specify communication preferences (concise vs verbose, when to ask vs act)',
      'Add a "Don\'t Do" section — Claude respects negative instructions well',
      'Focus on things that apply across ALL your projects'
    ],
    proTips: [
      'The most effective instructions are specific and actionable. "Use TypeScript strict mode" works better than "write good code"',
      'A "Don\'t" section is surprisingly powerful — "Don\'t add comments to obvious code" or "Don\'t create files I didn\'t ask for" prevents common annoyances',
      'Include your preferred error handling pattern — Claude will mirror it everywhere',
      'Mention your editor (VS Code, Cursor, etc.) so Claude can suggest relevant shortcuts/extensions',
      'If you always use a specific package manager (pnpm, bun), state it here to avoid Claude defaulting to npm'
    ],
    commonMistakes: [
      'Making it too long — anything over 200 lines gets diminishing returns',
      'Being too vague — "write clean code" doesn\'t help; "use early returns instead of nested ifs" does',
      'Contradicting project-level CLAUDE.md files — global should be personal preferences, not project rules',
      'Forgetting to update it — your preferences evolve, revisit every few weeks'
    ],
    exampleContent: `# My Claude Preferences

## Communication
- Be concise and direct — skip the preamble
- Show code examples when explaining concepts
- Ask before making large refactors or architectural changes
- Don't apologize for mistakes, just fix them

## Coding Style
- TypeScript with strict mode, always
- Functional components with hooks (no class components)
- Prefer composition over inheritance
- Use early returns to reduce nesting
- Descriptive variable names > short ones

## Workflow
- I use VS Code with Prettier and ESLint
- Use pnpm as the package manager
- Always run tests before suggesting commits
- Format with the project's formatter before saving

## Don't Do
- Don't add JSDoc comments unless I ask
- Don't create README files or documentation I didn't request
- Don't refactor surrounding code when fixing a bug
- Don't add error handling for impossible scenarios
- Don't suggest installing new dependencies without asking first`,
    scope: 'Applies to all projects and sessions globally',
    recommendation: 'Highly recommended — this is the single highest-impact customization you can make'
  },

  // ─── Global Settings ───
  '~/.claude/settings.json': {
    displayName: 'Global Settings',
    description:
      'JSON configuration for global permissions, allowed/denied tools, and MCP server connections. Controls what Claude can do without asking permission first.',
    bestPractices: [
      'Pre-approve commands you use constantly (git, npm, basic shell)',
      'Deny dangerous operations explicitly (rm -rf, sudo)',
      'Use wildcard patterns for command families (e.g., "Bash(git:*)")',
      'Configure MCP servers here if you use them across projects'
    ],
    proTips: [
      'The biggest productivity boost: pre-approve git commands, your package manager, and file read/write — Claude asking "can I run git status?" gets old fast',
      'Use "Bash(npm run:*)" to allow all npm scripts without approving each one',
      'You can allow "Read" and "Write" globally since Claude\'s sandbox prevents writing outside your project anyway',
      'MCP servers configured here are available in all projects — great for things like database tools or API clients'
    ],
    commonMistakes: [
      'Being too restrictive — if Claude asks permission 10 times per task, you\'ll get frustrated',
      'Forgetting to deny dangerous commands — always explicitly deny "rm -rf /" and "sudo"',
      'Not using wildcards — "Bash(git status)" only allows exactly "git status", not "git status -s"'
    ],
    exampleContent: `{
  "permissions": {
    "allow": [
      "Bash(npm:*)",
      "Bash(npx:*)",
      "Bash(git:*)",
      "Bash(node:*)",
      "Bash(cat:*)",
      "Bash(ls:*)",
      "Read",
      "Write",
      "Edit"
    ],
    "deny": [
      "Bash(rm -rf /)",
      "Bash(sudo:*)"
    ]
  }
}`,
    scope: 'Global — affects all projects unless overridden by project settings',
    recommendation: 'Recommended — dramatically reduces permission prompts'
  },

  // ─── Keybindings ───
  '~/.claude/keybindings.json': {
    displayName: 'Keybindings',
    description:
      'Customize keyboard shortcuts for the Claude Code CLI interface. Remap keys to match your muscle memory from your preferred editor.',
    bestPractices: [
      'Only override shortcuts you actually use differently',
      'Use familiar patterns from VS Code, Vim, or your preferred editor',
      'Test changes immediately — bad keybindings are frustrating'
    ],
    proTips: [
      'Most users never need this — the defaults are good',
      'If you\'re a Vim user, the most useful remap is changing the submit key',
      'You can chain key sequences for chord-based shortcuts'
    ],
    commonMistakes: [
      'Remapping essential keys without realizing you need them',
      'Conflicting bindings that shadow important defaults'
    ],
    exampleContent: `[
  {
    "key": "ctrl+shift+enter",
    "command": "submit"
  }
]`,
    scope: 'Global — applies to the Claude Code CLI interface',
    recommendation: 'Optional — only if the default shortcuts bother you'
  },

  // ─── Global Rules ───
  '~/.claude/rules/*.md': {
    displayName: 'Global Rules',
    description:
      'Markdown files with specific rules Claude must follow. The killer feature: YAML frontmatter with glob patterns to scope rules to specific file types. One rule file per concern.',
    bestPractices: [
      'One rule per file — "typescript-style.md", not "all-my-rules.md"',
      'Use descriptive filenames so you can manage them at a glance',
      'Add YAML frontmatter with globs to target specific file types',
      'Keep rules specific and actionable — not "write good code" but "use early returns"',
      'Don\'t duplicate what\'s in CLAUDE.md — rules are for file-type-specific standards'
    ],
    proTips: [
      'Rules with globs are incredibly powerful — "**/*.test.ts" rules only apply when Claude is working on test files',
      'This is the best place for language-specific conventions that apply across all your projects',
      'Rules stack: global rules + project rules both apply. Keep global rules language-level, project rules project-level',
      'You can have rules for non-code files too — e.g., a rule for "**/*.md" that says "use ATX headings, not Setext"'
    ],
    commonMistakes: [
      'Making rules too broad — "write clean code" is useless; "use explicit return types on exported functions" is actionable',
      'Putting project-specific rules in global — those belong in the project\'s .claude/rules/',
      'Having contradicting rules between files — Claude gets confused',
      'Forgetting the globs frontmatter — without it, the rule applies to ALL files'
    ],
    exampleContent: `---
globs: "**/*.ts"
---

# TypeScript Rules

- Always use explicit return types on exported functions
- Prefer interfaces over type aliases for object shapes
- Use \`const\` assertions for literal types
- Never use \`any\` — use \`unknown\` and narrow with type guards
- Prefer \`Record<K, V>\` over \`{[key: string]: V}\``,
    scope: 'Global — can be path-scoped with frontmatter globs. Rules apply to matching files across ALL projects.',
    recommendation: 'Great for language standards you want everywhere — TypeScript strictness, naming conventions, etc.'
  },

  // ─── Global Skills ───
  '~/.claude/skills/*/SKILL.md': {
    displayName: 'Global Skills',
    description:
      'Custom slash commands available across all projects. Each skill lives in its own folder with a SKILL.md that defines the command name, description, and instructions.',
    bestPractices: [
      'Give skills short, memorable names — you\'ll type /name frequently',
      'Include clear step-by-step instructions for Claude to follow',
      'Keep skills focused on a single task',
      'Use YAML frontmatter for name and description'
    ],
    proTips: [
      'Skills are like reusable prompts — "review this code", "explain this function", "write tests for this"',
      'The best skills encode YOUR specific workflow, not generic tasks Claude can already do',
      'Skills can reference other files, tools, and even other skills',
      'A /review skill with your specific quality criteria is one of the most popular use cases'
    ],
    commonMistakes: [
      'Making skills too broad — "/do-everything" is less useful than "/review-security"',
      'Not including examples of expected output',
      'Forgetting the frontmatter — without it, the skill won\'t show up as a command'
    ],
    exampleContent: `---
name: review
description: Review code for common issues
---

# Code Review Skill

When reviewing code, check for:

1. **Security**: Input validation, injection risks, auth checks
2. **Performance**: N+1 queries, unnecessary renders, missing memoization
3. **Correctness**: Edge cases, off-by-one errors, null handling
4. **Style**: Naming, consistency, readability

Rate each finding: Critical > Major > Minor > Style
Include code suggestions for each issue.`,
    scope: 'Global — available as /commands in all projects',
    recommendation: 'Useful once you find yourself repeating the same prompts'
  },

  // ─── Global Agents ───
  '~/.claude/agents/*.md': {
    displayName: 'Global Agents',
    description:
      'Custom subagents that Claude can delegate to for specialized tasks. Think of them as specialists Claude can consult — a security reviewer, a documentation writer, a test expert.',
    bestPractices: [
      'Define clear roles and areas of expertise',
      'Specify what tools/approaches the agent should use',
      'Include examples of the agent\'s expected behavior',
      'Keep each agent focused on one domain'
    ],
    proTips: [
      'Agents work best for tasks where you want a specific "personality" — a strict security reviewer, a thorough documentation writer',
      'Unlike skills, agents are used by Claude itself, not invoked directly by you',
      'Agent files are just markdown instructions — Claude creates a sub-context with these as the system prompt'
    ],
    commonMistakes: [
      'Making agents too generic — a "code helper" agent is just Claude again',
      'Not being specific about the agent\'s output format',
      'Creating too many agents — start with one or two you actually need'
    ],
    exampleContent: `# Security Reviewer Agent

You are a security-focused code reviewer. Your job is to find vulnerabilities.

## Focus Areas
- SQL/NoSQL injection
- XSS and CSRF vulnerabilities
- Authentication and authorization flaws
- Secrets in code or config
- Input validation gaps

## Output Format
For each finding:
- **Severity**: Critical/High/Medium/Low
- **Location**: File and line
- **Issue**: What's wrong
- **Fix**: Specific code change`,
    scope: 'Global — Claude can delegate to these agents in any session',
    recommendation: 'Advanced — most useful for teams with specific review/analysis needs'
  },

  // ─── Global Hooks ───
  '~/.claude/hooks/*': {
    displayName: 'Global Hooks',
    description:
      'Scripts that run automatically when Claude performs certain actions. Defined in settings.json and triggered on events like PreToolUse, PostToolUse, and Notification.',
    bestPractices: [
      'Keep hooks fast (under 2 seconds) to avoid slowing Claude down',
      'Use hooks for validation and formatting, not complex logic',
      'Test hooks thoroughly — a broken hook breaks your whole workflow',
      'Use exit codes to signal pass/fail to Claude'
    ],
    proTips: [
      'Hooks are defined in settings.json, not as standalone files — the files here are the scripts that get called',
      'PreToolUse hooks can BLOCK Claude from running a command if the hook returns non-zero',
      'The most popular hook: run prettier/eslint before any git commit Claude makes',
      'Hooks receive the tool name and arguments as environment variables'
    ],
    commonMistakes: [
      'Making hooks slow — a 5-second hook runs on EVERY tool use',
      'Not handling errors — a crashing hook blocks Claude entirely',
      'Forgetting to make the script executable (chmod +x)',
      'Configuring hooks in settings.json incorrectly'
    ],
    exampleContent: `#!/bin/bash
# Pre-commit hook: format and lint
set -e
echo "Running formatter..."
npx prettier --write .
echo "Running linter..."
npx eslint --fix .
echo "Checks passed!"`,
    scope: 'Global — triggers on events across all projects. Configured in settings.json.',
    recommendation: 'Advanced — powerful but requires careful setup. Start simple.'
  },

  // ─── Project CLAUDE.md ───
  'CLAUDE.md': {
    displayName: 'Project Instructions',
    description:
      'The single most important file for any project using Claude Code. It gives Claude deep context about your project — architecture, conventions, key commands. This file is committed to git and shared with your team.',
    bestPractices: [
      'Start with a 2-3 sentence project overview',
      'List ALL important commands (dev, test, lint, build, deploy)',
      'Describe the project structure and where things live',
      'Document coding conventions specific to THIS project',
      'Note any gotchas, quirks, or non-obvious patterns',
      'Keep under 200 lines — be concise and scannable'
    ],
    proTips: [
      'This is the highest-impact file for code quality. A good CLAUDE.md = dramatically better Claude output',
      'The most valuable section: a list of commands. Claude needs to know "npm test" vs "pytest" vs "cargo test"',
      'Include your file naming convention — Claude will mirror it in new files',
      'If your project has a monorepo structure, describe the package layout',
      'Mention the git workflow (trunk-based, feature branches, PR conventions) — Claude will follow it',
      'List key dependencies and their purposes — Claude won\'t suggest alternatives if it knows your stack'
    ],
    commonMistakes: [
      'Leaving it empty or with just "# Project" — even a few lines help enormously',
      'Writing a novel — Claude reads this every message, so 500 lines wastes context',
      'Putting personal preferences here — those go in CLAUDE.local.md or global CLAUDE.md',
      'Not updating it when the project evolves — stale instructions are worse than none',
      'Being too generic — "use best practices" teaches nothing; "use Zod for validation" does'
    ],
    exampleContent: `# My App

React + Express + PostgreSQL web application for task management.

## Commands
- \`npm run dev\` — Start frontend (port 3000) and API (port 3001)
- \`npm test\` — Run Vitest test suite
- \`npm run build\` — Production build
- \`npm run lint\` — ESLint + Prettier check
- \`npm run db:migrate\` — Run Prisma migrations

## Project Structure
- \`src/app/\` — Next.js pages and layouts
- \`src/components/\` — React components (one per file)
- \`src/api/\` — Express API routes
- \`src/lib/\` — Shared utilities and helpers
- \`prisma/\` — Database schema and migrations

## Conventions
- TypeScript strict mode throughout
- Components use named exports, not default
- API routes return \`{ data, error }\` format
- Tests co-located with source (\`foo.ts\` → \`foo.test.ts\`)
- Commits follow conventional commits format`,
    scope: 'Project — committed to git, visible to all team members',
    recommendation: 'Essential — the single most impactful thing you can do for any project'
  },

  // ─── CLAUDE.local.md ───
  'CLAUDE.local.md': {
    displayName: 'Personal Project Instructions',
    description:
      'Your personal project-specific instructions that stay on YOUR machine (gitignored automatically). Use this for local environment details, personal preferences, or notes that shouldn\'t affect your team.',
    bestPractices: [
      'Put local environment specifics here (ports, Docker setup, local DB)',
      'Add personal workflow preferences that differ from team',
      'Include reminders or notes for yourself between sessions',
      'Override team conventions you personally disagree with (carefully!)'
    ],
    proTips: [
      'This is automatically gitignored — you don\'t need to add it manually',
      'Great for "I\'m working on feature X" context that changes frequently',
      'If you\'re debugging something, put your investigation notes here — Claude will pick them up next session',
      'This is the right place for "I prefer X" when the team uses Y — your global CLAUDE.md is for universal preferences'
    ],
    commonMistakes: [
      'Putting team info here — it won\'t be shared with teammates',
      'Not creating one at all — even a few lines of personal context helps',
      'Duplicating everything from CLAUDE.md — only put DIFFERENCES here'
    ],
    exampleContent: `# My Local Setup

## Environment
- API running on port 3001 (conflicts with other project on 3000)
- Local Postgres in Docker on port 5433
- Using my personal Stripe test key

## Current Focus
- Working on the payment integration (src/api/payments/)
- Need to refactor the webhook handler before merging

## Personal Preferences
- I like verbose test output — use --verbose flag
- Always format with prettier before I commit`,
    scope: 'Personal — gitignored, only for your machine. Overrides project CLAUDE.md.',
    recommendation: 'Recommended — especially useful for local environment details and personal workflow'
  },

  // ─── Project Settings ───
  '.claude/settings.json': {
    displayName: 'Project Settings',
    description:
      'Project-level permissions shared via git. Pre-approve project-specific commands so the whole team doesn\'t have to click "allow" every time.',
    bestPractices: [
      'Pre-approve your project\'s specific build/test/dev commands',
      'Include Docker commands if the project uses containers',
      'Keep permissions minimal but practical',
      'Let team members add personal overrides in settings.local.json'
    ],
    proTips: [
      'The single biggest quality-of-life improvement: allowing your project\'s test command. "Can I run npm test?" gets asked a LOT',
      'Use "Bash(npm run:*)" to allow ALL npm scripts — safer than it sounds since these are defined in your package.json',
      'If your project uses a Makefile, allow "Bash(make:*)" for all targets',
      'This is committed to git — your whole team benefits from good settings'
    ],
    commonMistakes: [
      'Being too restrictive — the point is to reduce friction, not add security theater',
      'Forgetting to allow your test runner — this is the #1 most-needed permission',
      'Not including read/write permissions for Claude\'s file operations'
    ],
    exampleContent: `{
  "permissions": {
    "allow": [
      "Bash(npm run:*)",
      "Bash(npx:*)",
      "Bash(docker compose:*)",
      "Bash(git:*)",
      "Read",
      "Write",
      "Edit"
    ],
    "deny": [
      "Bash(rm -rf /)",
      "Bash(sudo:*)"
    ]
  }
}`,
    scope: 'Project — committed to git, shared with team',
    recommendation: 'Recommended — saves everyone from repetitive permission prompts'
  },

  // ─── Personal Project Settings ───
  '.claude/settings.local.json': {
    displayName: 'Personal Project Settings',
    description:
      'Your personal project settings that override shared settings. Gitignored. Use for local tool permissions or MCP servers on your machine.',
    bestPractices: [
      'Use for local-only tool permissions (scripts only on your machine)',
      'Add MCP servers specific to your personal setup',
      'Override team settings that conflict with your environment'
    ],
    proTips: [
      'These merge with project settings — you don\'t need to duplicate everything',
      'Great for adding MCP servers that connect to your personal tools (DB clients, API testers)',
      'If you have custom scripts in your home directory, allow them here'
    ],
    commonMistakes: [
      'Putting shared permissions here — those should go in settings.json for the team',
      'Not realizing this overrides project settings — be careful with deny rules'
    ],
    exampleContent: `{
  "permissions": {
    "allow": [
      "Bash(~/scripts/deploy-staging.sh)"
    ]
  }
}`,
    scope: 'Personal — gitignored, overrides project settings',
    recommendation: 'Optional — only needed if you have personal tool/permission needs'
  },

  // ─── Project Rules ───
  '.claude/rules/*.md': {
    displayName: 'Project Rules',
    description:
      'Path-scoped rules for this project. The glob pattern in YAML frontmatter is the killer feature — rules only apply to matching files, so your React rules don\'t affect your API code.',
    bestPractices: [
      'Use specific glob patterns: "src/components/**/*.tsx" not "**/*"',
      'One concern per file: "react-components.md", "api-routes.md", "database-queries.md"',
      'Keep rules actionable — tell Claude exactly what to do, not just what\'s "good"',
      'Coordinate with CLAUDE.md — rules are for file-type specifics, CLAUDE.md is for project-wide context'
    ],
    proTips: [
      'Rules files are the best way to enforce per-file-type standards: "all API routes must validate input with Zod"',
      'Stack rules by specificity: a broad "*.ts" rule + a specific "src/api/**/*.ts" rule both apply to API TypeScript files',
      'Include anti-patterns: "Never use querySelector in React components" is very effective',
      'Great for onboarding — new team members get standards enforced automatically'
    ],
    commonMistakes: [
      'Making rules too broad without globs — they\'ll apply everywhere',
      'Contradicting CLAUDE.md or other rule files',
      'Being too detailed — 50 rules in one file is hard for Claude to prioritize'
    ],
    exampleContent: `---
globs: "src/components/**/*.tsx"
---

# React Component Rules

- Use functional components with named exports
- Define Props interface above the component
- Destructure props in the function signature
- Use useCallback for event handlers passed to children
- Keep components under 150 lines — extract if larger
- Co-locate tests: \`Button.tsx\` → \`Button.test.tsx\`
- Never use \`any\` in prop types`,
    scope: 'Project — committed to git, scoped by glob patterns',
    recommendation: 'Great for enforcing team standards per file type'
  },

  // ─── Project Skills ───
  '.claude/skills/*/SKILL.md': {
    displayName: 'Project Skills',
    description:
      'Project-specific slash commands shared with the team. Encode your team\'s workflows as reusable commands.',
    bestPractices: [
      'Create skills for common team tasks (/deploy, /review, /generate)',
      'Document expected input and output clearly',
      'Keep skills project-relevant — global skills go in ~/.claude/skills/'
    ],
    proTips: [
      'Skills can reference project-specific paths, tools, and conventions',
      'A /deploy skill that knows your specific CI/CD pipeline is incredibly valuable',
      'Skills with clear step-by-step instructions work better than vague ones'
    ],
    commonMistakes: [
      'Making skills too generic — they should leverage project-specific knowledge',
      'Forgetting the frontmatter with name and description',
      'Not testing the skill before committing it'
    ],
    exampleContent: `---
name: deploy
description: Deploy to staging environment
---

# Deploy to Staging

1. Run the full test suite: \`npm test\`
2. Build the production bundle: \`npm run build\`
3. Run the staging deploy: \`npm run deploy:staging\`
4. Verify the deployment at https://staging.example.com
5. Report back with the deploy URL and any errors`,
    scope: 'Project — committed to git, shared with team',
    recommendation: 'Useful once your team has established workflows to standardize'
  },

  // ─── Project Agents ───
  '.claude/agents/*.md': {
    displayName: 'Project Agents',
    description:
      'Project-specific subagents with domain knowledge about your codebase. Claude delegates to these for specialized analysis or generation tasks.',
    bestPractices: [
      'Create agents for project-specific review or analysis patterns',
      'Reference your project\'s architecture and conventions in the agent prompt',
      'Keep each agent focused on one domain'
    ],
    proTips: [
      'An agent that knows your API response format can review all API routes for consistency',
      'Documentation agents that know your README template produce much better output',
      'Test generation agents that know your testing patterns write tests that actually match your style'
    ],
    commonMistakes: [
      'Making agents too generic — they should know YOUR project deeply',
      'Not referencing specific project paths and patterns',
      'Creating agents for things Claude already does well without help'
    ],
    exampleContent: `# API Route Reviewer

You specialize in reviewing our Express.js API routes.

## Project Context
- Routes are in src/api/
- We use Zod for input validation
- Response format: { data, error, meta }
- Auth middleware: requireAuth() and requireRole()

## Review Checklist
- [ ] Input validated with Zod schema
- [ ] Auth middleware applied appropriately
- [ ] Error responses use standard format
- [ ] Database queries are parameterized
- [ ] Rate limiting applied to public endpoints`,
    scope: 'Project — committed to git, shared with team',
    recommendation: 'Advanced — most useful for teams with specific review/analysis needs'
  },

  // ─── Project Hooks ───
  '.claude/hooks/*': {
    displayName: 'Project Hooks',
    description:
      'Project-specific event hooks. Scripts that auto-run when Claude performs actions in this project, like formatting before commits.',
    bestPractices: [
      'Use for project-specific validations and formatting',
      'Keep hooks under 2 seconds — they run on every relevant action',
      'Make scripts executable (chmod +x)',
      'Test in isolation before adding to the project'
    ],
    proTips: [
      'The most common hook: run your project\'s formatter before Claude commits',
      'Hooks are defined in settings.json — the files here are the scripts referenced by those definitions',
      'PreToolUse hooks can prevent Claude from running commands that don\'t pass validation'
    ],
    commonMistakes: [
      'Slow hooks that add seconds to every operation',
      'Not handling errors gracefully — a crashing hook stops Claude',
      'Forgetting chmod +x on the script file'
    ],
    exampleContent: `#!/bin/bash
# Pre-commit: ensure code passes checks
set -e
npm run lint --quiet
npx tsc --noEmit
echo "All checks passed!"`,
    scope: 'Project — committed to git, runs for all team members',
    recommendation: 'Advanced — powerful for enforcing quality gates automatically'
  },

  // ─── Legacy Commands ───
  '.claude/commands/*.md': {
    displayName: 'Legacy Commands',
    description:
      'The original slash commands (before skills existed). Still supported but skills are the modern replacement with better features.',
    bestPractices: [
      'Consider migrating to skills for new commands',
      'Keep existing commands working during transition',
      'Use clear, short command names'
    ],
    proTips: [
      'Skills are strictly better — they support frontmatter metadata and are better organized',
      'If you have working commands, no rush to migrate — they still work fine',
      'The migration path: create a skill folder, move the markdown there, add frontmatter'
    ],
    commonMistakes: [
      'Creating new commands instead of skills',
      'Not realizing skills replace these',
      'Forgetting commands exist and recreating them as skills (causing duplicates)'
    ],
    exampleContent: `# Generate a React component

Create a new React component with:
- TypeScript Props interface
- Named export (not default)
- Co-located test file
- Storybook story if the project uses Storybook`,
    scope: 'Project — committed to git',
    recommendation: 'Legacy — use skills instead for new slash commands'
  },

  // ─── Claudeignore ───
  '.claudeignore': {
    displayName: 'Claude Ignore',
    description:
      'Like .gitignore but for Claude Code. Tells Claude which files to skip when building context. This directly improves response quality by keeping irrelevant files out of Claude\'s context window.',
    bestPractices: [
      'Exclude build artifacts (dist/, build/, .next/, out/)',
      'Ignore dependency directories (node_modules/, venv/)',
      'Block sensitive files (.env, secrets, credentials)',
      'Skip generated files (coverage/, *.min.js, *.map)',
      'Use standard gitignore glob syntax — same patterns work here'
    ],
    proTips: [
      'This is one of the highest-impact files for large projects. Without it, Claude wastes context reading node_modules and build output',
      'If Claude seems confused or gives irrelevant answers, check if it\'s reading files it shouldn\'t be',
      'Copy from your .gitignore as a starting point, then add Claude-specific ignores',
      'Lock files (package-lock.json, yarn.lock) should usually be ignored — they\'re huge and Claude rarely needs them',
      'If you have a monorepo, ignore packages you\'re not currently working on'
    ],
    commonMistakes: [
      'Not having one at all — this is a quick win for any project with node_modules',
      'Being too aggressive — don\'t ignore source code Claude needs to understand',
      'Forgetting .env files — Claude might try to read them and fail or expose secrets',
      'Not ignoring lock files — these can be tens of thousands of lines'
    ],
    exampleContent: `# Dependencies
node_modules/
.pnp.*

# Build output
dist/
build/
.next/
out/

# Test coverage
coverage/

# Environment & secrets
.env
.env.local
.env.*.local

# Generated / large files
*.min.js
*.bundle.js
*.map
package-lock.json

# IDE
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db`,
    scope: 'Project — committed to git, helps the whole team',
    recommendation: 'Highly recommended — quick setup, big impact on response quality'
  },

  // ─── Memory ───
  'memory/MEMORY.md': {
    displayName: 'Auto Memory',
    description:
      'Claude\'s persistent memory for this project. Claude automatically writes notes here about your project, preferences, and patterns it discovers across sessions.',
    bestPractices: [
      'Let Claude manage this file automatically — it writes what it needs',
      'Review periodically to ensure accuracy and remove stale info',
      'Delete entries that are outdated or wrong',
      'Keep under 200 lines — Claude truncates beyond that'
    ],
    proTips: [
      'You can ask Claude to "remember X" and it will add it to this file',
      'If Claude keeps making the same mistake, check if there\'s a wrong memory entry',
      'You can edit this file directly to correct Claude\'s understanding',
      'Memory is per-project — each project has its own MEMORY.md in ~/.claude/projects/'
    ],
    commonMistakes: [
      'Manually editing too aggressively — Claude may overwrite your changes',
      'Not reviewing it — stale memories lead to stale suggestions',
      'Expecting it to replace CLAUDE.md — memory is for discovered context, instructions should be explicit'
    ],
    exampleContent: `# Project Memory

## Architecture
- React frontend with Next.js 14 App Router
- Prisma ORM with PostgreSQL
- Auth via NextAuth.js with GitHub + email providers

## Patterns
- User prefers functional components with hooks
- Tests use Vitest + React Testing Library
- API responses always wrap in { data, error } format

## Key Decisions
- Chose Tailwind over CSS Modules for styling
- Using tRPC for type-safe API calls`,
    scope: 'Personal — stored in ~/.claude/projects/<id>/memory/. Not committed to git.',
    recommendation: 'Auto-managed — review periodically but let Claude do the writing'
  }
}

/**
 * Get file info by matching the file's relative or canonical path
 */
export function getFileInfo(relativePath: string): FileInfo | undefined {
  // Direct match
  if (fileInfoMap[relativePath]) return fileInfoMap[relativePath]

  // Pattern matching for glob-style entries
  for (const [pattern, info] of Object.entries(fileInfoMap)) {
    if (pattern.includes('*')) {
      const regex = new RegExp(
        '^' + pattern.replace(/\*/g, '[^/]+').replace(/\//g, '\\/') + '$'
      )
      if (regex.test(relativePath)) return info
    }
  }

  return undefined
}
