# AGENTS.md — Context Cabinet

Single entry point for any coding agent (Claude Code, Codex, Cursor) dropped into this repo.

## What this project is

**Context Cabinet** — Electron + React macOS desktop app for discovering, creating, editing, and managing Claude Code configuration files. Makes the ~15 scattered Claude config file types (in `~/.claude/` global and `.claude/` per-project) visual, accessible, and well-documented.

Features: file discovery across global/project scopes, per-file info popovers with best practices, template-based file creation with variable substitution, syntax-highlighted CodeMirror editor, filesystem scanner with project health-check scoring.

Two display modes: **Complete Mode** (dark navy, sidebar nav, full feature set) and **Simple Mode** (warm taupe light theme, tree hierarchy, minimal chrome).

## Source of truth

1. **[README.md](README.md)** — features, tech stack, getting started, project structure.
2. **[CLAUDE.md](CLAUDE.md)** — project rules, design pillars, hard constraints. **Read in full before making changes.**
3. **Vault page:** `wiki/projects/context-cabinet` in the Obsidian vault.

## Tech stack

| Layer | Technology |
|---|---|
| Desktop | Electron 33 via electron-vite 5 |
| Renderer | React 18 + TypeScript 5.7 |
| Styling | Tailwind CSS 4 |
| State | Zustand 5 |
| Editor | CodeMirror 6 |
| Animations | Framer Motion 11 |
| Components | Radix UI primitives |
| Command Palette | cmdk |
| File Watching | chokidar |
| File Scanning | fast-glob |
| Frontmatter | gray-matter |

## Build & verify

```bash
npm install
npm run dev       # development
npm run build     # production build
npm run package   # package as macOS app
```

## Key paths

- See `README.md` "Project Structure" section.
- `resources/` — `.icns` app icon and PNG source (electric blue `</>` on dark navy squircle).

## Working rules

- **Two display modes are both maintained** — changes that improve one should not regress the other.
- The app icon is the visual identity — don't change without explicit instruction.
- Templates and info popovers are content as much as code — vet copy carefully.
- No emojis in UI per global design rules.

## Related work elsewhere

- Context Cabinet operates on Claude config files used by every other code project in `~/Projects/`. Be careful when editing config files in ways that could affect ongoing work elsewhere.
- The `templates/` directory in `~/Projects/project-sync-toolkit/` includes templates relevant to knowledge-work repos that Context Cabinet may want to surface.
