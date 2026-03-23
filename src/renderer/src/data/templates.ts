import type { FileCategory } from '../types/claude-file'

export interface Template {
  id: string
  name: string
  description: string
  category: FileCategory
  targetFile: string
  content: string
  variables?: TemplateVariable[]
  tags: string[]
}

export interface TemplateVariable {
  name: string
  label: string
  placeholder: string
  defaultValue?: string
}

export const templates: Template[] = [
  // ─── CLAUDE.md Templates ───
  {
    id: 'claude-md-project-overview',
    name: 'Project Overview',
    description: 'Comprehensive project context for Claude with architecture, commands, and conventions.',
    category: 'instructions',
    targetFile: 'CLAUDE.md',
    content: `# {{PROJECT_NAME}}

## Overview
{{PROJECT_DESCRIPTION}}

## Tech Stack
- **Frontend**: {{FRONTEND}}
- **Backend**: {{BACKEND}}
- **Database**: {{DATABASE}}

## Commands
- \`{{DEV_CMD}}\` — Start development server
- \`{{TEST_CMD}}\` — Run test suite
- \`{{BUILD_CMD}}\` — Production build
- \`{{LINT_CMD}}\` — Lint and format

## Project Structure
- \`src/\` — Application source code
- \`tests/\` — Test files
- \`docs/\` — Documentation

## Coding Conventions
- Use TypeScript with strict mode
- Follow existing patterns in the codebase
- Write tests for new features
- Keep functions small and focused

## Important Notes
- Always run tests before committing
- Follow the existing git commit message format
- Ask before making large architectural changes`,
    variables: [
      { name: 'PROJECT_NAME', label: 'Project Name', placeholder: 'My App' },
      { name: 'PROJECT_DESCRIPTION', label: 'Description', placeholder: 'A web application that...' },
      { name: 'FRONTEND', label: 'Frontend', placeholder: 'React + TypeScript', defaultValue: 'React + TypeScript' },
      { name: 'BACKEND', label: 'Backend', placeholder: 'Node.js + Express', defaultValue: 'Node.js + Express' },
      { name: 'DATABASE', label: 'Database', placeholder: 'PostgreSQL', defaultValue: 'PostgreSQL' },
      { name: 'DEV_CMD', label: 'Dev Command', placeholder: 'npm run dev', defaultValue: 'npm run dev' },
      { name: 'TEST_CMD', label: 'Test Command', placeholder: 'npm test', defaultValue: 'npm test' },
      { name: 'BUILD_CMD', label: 'Build Command', placeholder: 'npm run build', defaultValue: 'npm run build' },
      { name: 'LINT_CMD', label: 'Lint Command', placeholder: 'npm run lint', defaultValue: 'npm run lint' }
    ],
    tags: ['project', 'overview', 'starter']
  },
  {
    id: 'claude-md-coding-standards',
    name: 'Coding Standards',
    description: 'Detailed coding style guide for consistent code across the project.',
    category: 'instructions',
    targetFile: 'CLAUDE.md',
    content: `# Coding Standards

## TypeScript
- Use strict TypeScript (no \`any\` unless absolutely necessary)
- Prefer \`interface\` over \`type\` for object shapes
- Use explicit return types on exported functions
- Use \`const\` assertions for literal types

## Naming
- **Components**: PascalCase (\`UserProfile.tsx\`)
- **Functions/Variables**: camelCase (\`getUserData\`)
- **Constants**: UPPER_SNAKE_CASE (\`MAX_RETRY_COUNT\`)
- **Files**: kebab-case (\`user-profile.ts\`)
- **Types/Interfaces**: PascalCase with descriptive names

## Code Organization
- One component per file
- Co-locate tests with source (\`foo.ts\` + \`foo.test.ts\`)
- Group imports: external → internal → types → styles
- Keep files under 300 lines; split if larger

## Error Handling
- Always handle Promise rejections
- Use try/catch for async operations
- Provide meaningful error messages
- Never silently swallow errors

## Comments
- Write self-documenting code; minimize comments
- Use JSDoc for public APIs
- TODO comments must include context and author`,
    tags: ['standards', 'style', 'typescript']
  },
  {
    id: 'claude-md-personal-global',
    name: 'Personal Global Instructions',
    description: 'Personal preferences for Claude across all projects.',
    category: 'instructions',
    targetFile: '~/.claude/CLAUDE.md',
    content: `# My Claude Preferences

## Communication Style
- Be concise and direct
- Show code examples when explaining
- Ask before making large refactors
- Prefer practical solutions over theoretical perfection

## Coding Preferences
- I prefer {{LANGUAGE}} with {{FRAMEWORK}}
- Use functional programming patterns when practical
- Prefer composition over inheritance
- Keep things simple — avoid over-engineering

## Workflow
- I use {{EDITOR}} as my editor
- I prefer {{PACKAGE_MANAGER}} for package management
- Always run tests before suggesting commits
- Format code with the project's formatter

## Don't Do
- Don't add unnecessary comments or docstrings
- Don't create files I didn't ask for
- Don't refactor code unless asked
- Don't add error handling for impossible scenarios`,
    variables: [
      { name: 'LANGUAGE', label: 'Language', placeholder: 'TypeScript', defaultValue: 'TypeScript' },
      { name: 'FRAMEWORK', label: 'Framework', placeholder: 'React', defaultValue: 'React' },
      { name: 'EDITOR', label: 'Editor', placeholder: 'VS Code', defaultValue: 'VS Code' },
      { name: 'PACKAGE_MANAGER', label: 'Package Manager', placeholder: 'npm', defaultValue: 'npm' }
    ],
    tags: ['personal', 'global', 'preferences']
  },

  // ─── Settings Templates ───
  {
    id: 'settings-permissive',
    name: 'Permissive Settings',
    description: 'Allow common development commands without prompting.',
    category: 'settings',
    targetFile: '.claude/settings.json',
    content: `{
  "permissions": {
    "allow": [
      "Bash(npm:*)",
      "Bash(npx:*)",
      "Bash(git:*)",
      "Bash(node:*)",
      "Bash(cat:*)",
      "Bash(ls:*)",
      "Bash(find:*)",
      "Bash(grep:*)",
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
    tags: ['settings', 'permissive', 'dev']
  },
  {
    id: 'settings-restrictive',
    name: 'Restrictive Settings',
    description: 'Minimal permissions — Claude asks before running most commands.',
    category: 'settings',
    targetFile: '.claude/settings.json',
    content: `{
  "permissions": {
    "allow": [
      "Read",
      "Bash(git status)",
      "Bash(git diff:*)",
      "Bash(git log:*)"
    ],
    "deny": [
      "Bash(rm:*)",
      "Bash(sudo:*)",
      "Bash(curl:*)",
      "Bash(wget:*)"
    ]
  }
}`,
    tags: ['settings', 'restrictive', 'safe']
  },
  {
    id: 'settings-web-dev',
    name: 'Web Development Settings',
    description: 'Permissions tuned for web development workflows.',
    category: 'settings',
    targetFile: '.claude/settings.json',
    content: `{
  "permissions": {
    "allow": [
      "Bash(npm:*)",
      "Bash(npx:*)",
      "Bash(node:*)",
      "Bash(git:*)",
      "Bash(docker compose:*)",
      "Bash(curl -s:*)",
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
    tags: ['settings', 'web', 'frontend', 'backend']
  },

  // ─── Rules Templates ───
  {
    id: 'rules-typescript',
    name: 'TypeScript Rules',
    description: 'Enforce TypeScript best practices for .ts and .tsx files.',
    category: 'rules',
    targetFile: '.claude/rules/typescript.md',
    content: `---
globs: "**/*.{ts,tsx}"
---

# TypeScript Rules

- Use explicit return types on all exported functions
- Prefer \`interface\` over \`type\` for object shapes
- Never use \`any\` — use \`unknown\` and narrow types
- Use \`const\` assertions for literal types
- Prefer \`Record<K, V>\` over index signatures
- Use discriminated unions for state management
- Always handle all cases in switch statements (add \`default: never\` check)`,
    tags: ['rules', 'typescript', 'strict']
  },
  {
    id: 'rules-react',
    name: 'React Component Rules',
    description: 'Standards for React components and hooks.',
    category: 'rules',
    targetFile: '.claude/rules/react.md',
    content: `---
globs: "src/components/**/*.tsx"
---

# React Component Rules

- Use functional components exclusively
- Export components as named exports (not default)
- Define Props interface above the component
- Destructure props in the function signature
- Use \`useCallback\` for event handlers passed to children
- Use \`useMemo\` for expensive computations only
- Keep components under 150 lines — extract sub-components if larger
- Co-locate styles, tests, and stories with components`,
    tags: ['rules', 'react', 'components']
  },
  {
    id: 'rules-testing',
    name: 'Testing Rules',
    description: 'Standards for writing tests.',
    category: 'rules',
    targetFile: '.claude/rules/testing.md',
    content: `---
globs: "**/*.{test,spec}.{ts,tsx,js,jsx}"
---

# Testing Rules

- Use descriptive test names: \`it('should return user when ID is valid')\`
- Follow Arrange-Act-Assert pattern
- One assertion per test when practical
- Mock external dependencies, not internal modules
- Test behavior, not implementation details
- Include edge cases: null, undefined, empty, boundary values
- Keep test files under 200 lines
- Use \`describe\` blocks to group related tests`,
    tags: ['rules', 'testing', 'tests']
  },

  // ─── Ignore Templates ───
  {
    id: 'ignore-node',
    name: 'Node.js Ignore',
    description: 'Common ignore patterns for Node.js/JavaScript projects.',
    category: 'ignore',
    targetFile: '.claudeignore',
    content: `# Dependencies
node_modules/
.pnp.*

# Build output
dist/
build/
.next/
out/

# Test coverage
coverage/

# Environment
.env
.env.local
.env.*.local

# Generated
*.min.js
*.bundle.js
*.map

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db`,
    tags: ['ignore', 'node', 'javascript']
  },
  {
    id: 'ignore-python',
    name: 'Python Ignore',
    description: 'Common ignore patterns for Python projects.',
    category: 'ignore',
    targetFile: '.claudeignore',
    content: `# Virtual environments
venv/
.venv/
env/

# Build
dist/
build/
*.egg-info/
__pycache__/
*.pyc

# Test
.pytest_cache/
htmlcov/
.coverage

# Environment
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db`,
    tags: ['ignore', 'python']
  },

  // ─── Skills Templates ───
  {
    id: 'skill-code-review',
    name: 'Code Review Skill',
    description: 'A skill that performs thorough code reviews.',
    category: 'skills',
    targetFile: '.claude/skills/review/SKILL.md',
    content: `---
name: review
description: Perform a thorough code review
---

# Code Review

When reviewing code, follow this checklist:

## Correctness
- Does the code do what it's supposed to?
- Are edge cases handled?
- Are there off-by-one errors?

## Security
- Is user input validated and sanitized?
- Are there injection vulnerabilities?
- Are secrets properly handled?

## Performance
- Are there N+1 query problems?
- Are expensive operations cached?
- Are there unnecessary re-renders?

## Maintainability
- Is the code readable and well-organized?
- Are functions focused and small?
- Is the naming clear and consistent?

Rate each finding as: **Critical**, **Major**, **Minor**, or **Style**.`,
    tags: ['skills', 'review', 'code-review']
  },

  // ─── Agents Templates ───
  {
    id: 'agent-doc-writer',
    name: 'Documentation Writer',
    description: 'A subagent specialized in writing technical documentation.',
    category: 'agents',
    targetFile: '.claude/agents/doc-writer.md',
    content: `# Documentation Writer Agent

You are a technical documentation specialist. Your role is to create clear, comprehensive documentation.

## Guidelines
- Write for the target audience (developers, users, or operators)
- Include code examples for every concept
- Use consistent formatting and terminology
- Add a table of contents for documents over 100 lines
- Include troubleshooting sections where relevant

## Documentation Types
- **README**: Project overview, setup, usage
- **API Reference**: Endpoints, parameters, responses
- **Architecture**: System design, data flow, decisions
- **Guides**: Step-by-step tutorials and how-tos

## Quality Checklist
- [ ] All code examples are tested and correct
- [ ] Links are valid and point to the right targets
- [ ] Formatting is consistent throughout
- [ ] No jargon without explanation`,
    tags: ['agents', 'documentation', 'writing']
  },

  // ─── Hooks Templates ───
  {
    id: 'hooks-pre-commit-lint',
    name: 'Pre-Commit Lint Hook',
    description: 'Run linting before Claude commits code.',
    category: 'hooks',
    targetFile: '.claude/hooks/pre-commit-lint.sh',
    content: `#!/bin/bash
# Pre-commit hook: ensure code passes linting
# This runs before Claude creates any git commit

set -e

echo "Running linter..."
npm run lint --quiet

echo "Running type check..."
npx tsc --noEmit

echo "All checks passed!"`,
    tags: ['hooks', 'lint', 'pre-commit']
  },

  // ─── More Instruction Templates ───
  {
    id: 'claude-md-full-stack',
    name: 'Full-Stack Project Guide',
    description: 'Complete context for a full-stack web application with frontend, backend, and database.',
    category: 'instructions',
    targetFile: 'CLAUDE.md',
    content: `# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## Tech Stack
- **Frontend**: {{FRONTEND_STACK}}
- **Backend**: {{BACKEND_STACK}}
- **Database**: {{DATABASE}}
- **Auth**: {{AUTH_METHOD}}
- **Deployment**: {{DEPLOY_TARGET}}

## Commands
- \`{{DEV_CMD}}\` — Start development (frontend + backend)
- \`{{TEST_CMD}}\` — Run all tests
- \`{{LINT_CMD}}\` — Lint and format
- \`{{BUILD_CMD}}\` — Production build
- \`npm run db:migrate\` — Run database migrations
- \`npm run db:seed\` — Seed test data

## Project Structure
\`\`\`
src/
  app/         — Pages and layouts (Next.js App Router)
  components/  — React components (one per file, named exports)
  api/         — API route handlers
  lib/         — Shared utilities and helpers
  db/          — Database models and queries
  types/       — TypeScript type definitions
\`\`\`

## Conventions
- TypeScript strict mode — no \`any\`
- Components: functional, named exports, Props interface above component
- API responses: always \`{ data, error }\` format
- Tests: co-located with source, using Vitest + Testing Library
- Commits: conventional commits format (feat:, fix:, chore:)

## Environment
- Development runs on port {{DEV_PORT}}
- Database connection in .env (never committed)
- Required env vars: DATABASE_URL, AUTH_SECRET

## Important Notes
- Always run tests before committing
- Never modify migration files after they've been applied
- Ask before changing shared types in src/types/`,
    variables: [
      { name: 'PROJECT_NAME', label: 'Project Name', placeholder: 'My App' },
      { name: 'PROJECT_DESCRIPTION', label: 'Description', placeholder: 'A task management web application.' },
      { name: 'FRONTEND_STACK', label: 'Frontend', placeholder: 'Next.js 14 + React + Tailwind', defaultValue: 'Next.js 14 + React + Tailwind' },
      { name: 'BACKEND_STACK', label: 'Backend', placeholder: 'Next.js API Routes + tRPC', defaultValue: 'Next.js API Routes + tRPC' },
      { name: 'DATABASE', label: 'Database', placeholder: 'PostgreSQL + Prisma', defaultValue: 'PostgreSQL + Prisma' },
      { name: 'AUTH_METHOD', label: 'Auth', placeholder: 'NextAuth.js', defaultValue: 'NextAuth.js' },
      { name: 'DEPLOY_TARGET', label: 'Deploy Target', placeholder: 'Vercel', defaultValue: 'Vercel' },
      { name: 'DEV_CMD', label: 'Dev Command', placeholder: 'npm run dev', defaultValue: 'npm run dev' },
      { name: 'TEST_CMD', label: 'Test Command', placeholder: 'npm test', defaultValue: 'npm test' },
      { name: 'LINT_CMD', label: 'Lint Command', placeholder: 'npm run lint', defaultValue: 'npm run lint' },
      { name: 'BUILD_CMD', label: 'Build Command', placeholder: 'npm run build', defaultValue: 'npm run build' },
      { name: 'DEV_PORT', label: 'Dev Port', placeholder: '3000', defaultValue: '3000' }
    ],
    tags: ['project', 'fullstack', 'starter', 'comprehensive']
  },
  {
    id: 'claude-md-dont-list',
    name: '"Don\'t Do" Boundaries',
    description: 'A focused list of things Claude should NOT do. Surprisingly effective for preventing common annoyances.',
    category: 'instructions',
    targetFile: 'CLAUDE.md',
    content: `## Don't Do

These are things I explicitly do NOT want Claude to do:

### Code Style
- Don't add comments to self-explanatory code
- Don't add JSDoc unless I explicitly ask for it
- Don't add type annotations that TypeScript can infer
- Don't wrap simple operations in try/catch "just in case"
- Don't add unused imports or variables "for later"

### Files & Structure
- Don't create README files or documentation I didn't ask for
- Don't create helper/utility files for one-off operations
- Don't add index.ts barrel files unless the project uses them
- Don't create .env.example or config templates unprompted

### Behavior
- Don't refactor surrounding code when fixing a bug
- Don't "improve" code that isn't part of the current task
- Don't suggest installing new dependencies without asking first
- Don't add error handling for scenarios that can't happen
- Don't add backwards-compatibility shims when changing code
- Don't apologize for mistakes — just fix them and move on

### Communication
- Don't explain what you're about to do before doing it
- Don't summarize what you just did unless asked
- Don't ask "shall I proceed?" — just do it unless it's destructive
- Don't add emoji to commit messages or comments`,
    tags: ['instructions', 'dont', 'boundaries', 'preferences']
  },
  {
    id: 'claude-md-python-project',
    name: 'Python Project Guide',
    description: 'Project context optimized for Python/Django/Flask projects.',
    category: 'instructions',
    targetFile: 'CLAUDE.md',
    content: `# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## Tech Stack
- **Language**: Python {{PYTHON_VERSION}}
- **Framework**: {{FRAMEWORK}}
- **Database**: {{DATABASE}}
- **Package Manager**: {{PACKAGE_MANAGER}}

## Commands
- \`{{DEV_CMD}}\` — Start development server
- \`{{TEST_CMD}}\` — Run test suite
- \`{{LINT_CMD}}\` — Run linting
- \`{{FORMAT_CMD}}\` — Format code

## Project Structure
\`\`\`
{{PROJECT_NAME}}/
  models/      — Database models
  views/       — Request handlers / API views
  services/    — Business logic
  utils/       — Helper functions
  tests/       — Test files (mirror src structure)
\`\`\`

## Conventions
- Use type hints on all function signatures
- Docstrings: Google style for public functions only
- Tests: pytest with fixtures, parametrize for edge cases
- Imports: stdlib → third-party → local (isort handles this)
- Max line length: 88 (Black default)

## Environment
- Virtual environment in .venv/
- Environment variables in .env (never committed)
- Required: DATABASE_URL, SECRET_KEY`,
    variables: [
      { name: 'PROJECT_NAME', label: 'Project Name', placeholder: 'my_app' },
      { name: 'PROJECT_DESCRIPTION', label: 'Description', placeholder: 'A REST API for...' },
      { name: 'PYTHON_VERSION', label: 'Python Version', placeholder: '3.12', defaultValue: '3.12' },
      { name: 'FRAMEWORK', label: 'Framework', placeholder: 'FastAPI', defaultValue: 'FastAPI' },
      { name: 'DATABASE', label: 'Database', placeholder: 'PostgreSQL + SQLAlchemy', defaultValue: 'PostgreSQL + SQLAlchemy' },
      { name: 'PACKAGE_MANAGER', label: 'Package Manager', placeholder: 'uv', defaultValue: 'uv' },
      { name: 'DEV_CMD', label: 'Dev Command', placeholder: 'uv run uvicorn main:app --reload', defaultValue: 'uv run uvicorn main:app --reload' },
      { name: 'TEST_CMD', label: 'Test Command', placeholder: 'uv run pytest', defaultValue: 'uv run pytest' },
      { name: 'LINT_CMD', label: 'Lint Command', placeholder: 'uv run ruff check .', defaultValue: 'uv run ruff check .' },
      { name: 'FORMAT_CMD', label: 'Format Command', placeholder: 'uv run ruff format .', defaultValue: 'uv run ruff format .' }
    ],
    tags: ['python', 'project', 'starter']
  },

  // ─── More Settings Templates ───
  {
    id: 'settings-python-dev',
    name: 'Python Development Settings',
    description: 'Permissions tuned for Python development workflows.',
    category: 'settings',
    targetFile: '.claude/settings.json',
    content: `{
  "permissions": {
    "allow": [
      "Bash(python:*)",
      "Bash(python3:*)",
      "Bash(pip:*)",
      "Bash(uv:*)",
      "Bash(pytest:*)",
      "Bash(ruff:*)",
      "Bash(mypy:*)",
      "Bash(git:*)",
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
    tags: ['settings', 'python', 'dev']
  },

  // ─── More Rules Templates ───
  {
    id: 'rules-api-routes',
    name: 'API Route Rules',
    description: 'Standards for API route handlers — validation, error handling, response format.',
    category: 'rules',
    targetFile: '.claude/rules/api-routes.md',
    content: `---
globs: "src/api/**/*.{ts,js}"
---

# API Route Rules

## Request Handling
- Always validate input at the route level (use Zod or similar)
- Return consistent response shape: \`{ data, error, meta }\`
- Use appropriate HTTP status codes (don't return 200 for errors)

## Error Handling
- Catch and transform all errors to structured responses
- Never expose internal error details to clients
- Log errors with context (request ID, user, route)

## Authentication
- Apply auth middleware to all non-public routes
- Check permissions at the route level, not in business logic
- Return 401 for missing auth, 403 for insufficient permissions

## Performance
- Add pagination to all list endpoints (default: 20, max: 100)
- Use database-level filtering, not in-memory filtering
- Include \`X-Request-Id\` header for tracing`,
    tags: ['rules', 'api', 'routes', 'backend']
  },
  {
    id: 'rules-database',
    name: 'Database Query Rules',
    description: 'Rules for writing safe, performant database queries.',
    category: 'rules',
    targetFile: '.claude/rules/database.md',
    content: `---
globs: "src/{db,models,repositories}/**/*.{ts,js}"
---

# Database Rules

- Always use parameterized queries — never interpolate user input into SQL
- Use transactions for operations that modify multiple tables
- Add indexes for columns used in WHERE and JOIN clauses
- Prefer \`findFirst\` over \`findUnique\` when the field isn't guaranteed unique
- Always include \`select\` to fetch only needed columns
- Use \`take\` / \`limit\` on all queries that could return large result sets
- Never use \`deleteMany\` without a WHERE clause
- Wrap bulk operations in transactions with error rollback`,
    tags: ['rules', 'database', 'sql', 'queries']
  },

  // ─── More Skills Templates ───
  {
    id: 'skill-test-generator',
    name: 'Test Generator Skill',
    description: 'A skill that generates comprehensive test suites for your code.',
    category: 'skills',
    targetFile: '.claude/skills/test/SKILL.md',
    content: `---
name: test
description: Generate comprehensive tests for a file or function
---

# Test Generator

When asked to generate tests:

1. **Read the source file** and understand its API surface
2. **Generate tests** covering:
   - Happy path (normal usage)
   - Edge cases (empty, null, undefined, boundary values)
   - Error cases (invalid input, missing data, network failures)
   - Integration scenarios (if applicable)
3. **Follow these conventions**:
   - Use the project's existing test framework and patterns
   - Co-locate test files with source (\`foo.ts\` → \`foo.test.ts\`)
   - Use descriptive test names: "should return X when given Y"
   - Arrange-Act-Assert structure
   - Mock external dependencies, not internal modules
   - Keep each test focused on one behavior

Output the complete test file, ready to run.`,
    tags: ['skills', 'testing', 'generator']
  },
  {
    id: 'skill-explain',
    name: 'Code Explainer Skill',
    description: 'A skill that explains code in plain language with visual diagrams.',
    category: 'skills',
    targetFile: '.claude/skills/explain/SKILL.md',
    content: `---
name: explain
description: Explain code in plain language
---

# Code Explainer

When asked to explain code:

1. **Start with a one-sentence summary** of what the code does
2. **Walk through the logic step by step**, using simple language
3. **Highlight key patterns**: design patterns, algorithms, important decisions
4. **Note potential issues**: edge cases, performance concerns, security risks
5. **Suggest improvements** if any are obvious (but keep it brief)

Format:
- Use markdown headers for sections
- Use code blocks for referencing specific lines
- Keep explanations concise — aim for understanding, not documentation`,
    tags: ['skills', 'explain', 'documentation']
  },

  // ─── More Agents Templates ───
  {
    id: 'agent-test-writer',
    name: 'Test Writer Agent',
    description: 'A subagent that specializes in writing comprehensive tests.',
    category: 'agents',
    targetFile: '.claude/agents/test-writer.md',
    content: `# Test Writer Agent

You are a testing specialist. You write thorough, maintainable tests.

## Your Approach
1. Read the source code carefully to understand all behaviors
2. Identify the complete test surface: public API, edge cases, error paths
3. Write tests that cover behavior, not implementation
4. Use the project's existing test patterns and frameworks

## Test Quality Standards
- Each test tests exactly one behavior
- Tests should be readable without reading the implementation
- Use meaningful test names: "should reject expired tokens"
- Avoid testing implementation details (private methods, internal state)
- Mock sparingly — prefer real objects where practical

## Output Format
- Complete test file with imports and setup
- Organized with describe blocks for logical grouping
- Include comments only for non-obvious test setups`,
    tags: ['agents', 'testing', 'writer']
  },

  // ─── More Ignore Templates ───
  {
    id: 'ignore-monorepo',
    name: 'Monorepo Ignore',
    description: 'Ignore patterns for monorepo projects — focus Claude on the active package.',
    category: 'ignore',
    targetFile: '.claudeignore',
    content: `# Dependencies (all packages)
**/node_modules/
**/.pnp.*

# Build output (all packages)
**/dist/
**/build/
**/.next/
**/out/

# Test coverage
**/coverage/

# Environment & secrets
.env
.env.*
**/.env
**/.env.*

# Lock files (huge, not useful for Claude)
package-lock.json
yarn.lock
pnpm-lock.yaml

# IDE & OS
.vscode/
.idea/
.DS_Store
Thumbs.db

# Generated files
**/*.min.js
**/*.bundle.js
**/*.map

# Docker volumes
docker-data/`,
    tags: ['ignore', 'monorepo', 'node']
  }
]

export function getTemplatesByCategory(category: FileCategory): Template[] {
  return templates.filter((t) => t.category === category)
}

export function searchTemplates(query: string): Template[] {
  const lower = query.toLowerCase()
  return templates.filter(
    (t) =>
      t.name.toLowerCase().includes(lower) ||
      t.description.toLowerCase().includes(lower) ||
      t.tags.some((tag) => tag.includes(lower))
  )
}
