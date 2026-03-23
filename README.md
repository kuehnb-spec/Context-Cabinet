# Context Cabinet

A macOS desktop app for discovering, creating, editing, and managing Claude Code configuration files. Makes the ~15 scattered config files visual, accessible, and well-documented.

## What It Does

Claude Code uses markdown and JSON files spread across `~/.claude/` (global) and `.claude/` (per-project) directories. Most developers don't know these files exist, don't understand their precedence hierarchy, and struggle to write effective content. Context Cabinet solves this by:

- **Discovering** all Claude config files across global and project scopes
- **Explaining** what each file does with info popovers, best practices, and examples
- **Creating** new files from pre-built templates with variable substitution
- **Editing** files in a syntax-highlighted CodeMirror editor with contextual guidance
- **Scanning** your filesystem to find all projects and their Claude configuration status
- **Health checking** projects with a scored analysis of their Claude setup

## App Icon

The app icon is a glowing electric blue `</>` code badge on a dark navy squircle — designed to be instantly recognizable as a developer tool at every size from 16px to 1024px. The `.icns` file and PNG source are in `resources/`.

## Display Modes

The app has two display modes:

- **Complete Mode** — Dark navy theme with sidebar navigation, file cards, editor, scanner, tree view, health check, and command palette
- **Simple Mode** — Warm taupe light theme with tree hierarchy layout, inline card expansion, and minimal chrome

## Tech Stack

| Layer | Technology |
|-------|-----------|
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

## Getting Started

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build

# Package as macOS app
npm run package
```

## Project Structure

```
src/
  main/                          # Electron main process
    index.ts                     # Window creation, vibrancy config
    ipc-handlers.ts              # IPC channel registration
    file-service.ts              # File scanning, reading, writing
    scanner-service.ts           # Project discovery via fast-glob
    watcher-service.ts           # chokidar file watchers
    menu.ts                      # macOS native menu bar
    utils.ts                     # Path helpers, ID generation

  preload/                       # Context bridge
    index.ts                     # Typed IPC API exposed to renderer
    index.d.ts                   # Type declarations

  shared/
    types.ts                     # ClaudeFile, ClaudeProject, enums

  renderer/src/
    main.tsx                     # React entry point
    App.tsx                      # Root component
    globals.css                  # Theme (dark + simple), glass effects, animations

    pages/
      DashboardPage.tsx          # Welcome view with file cards and stats
      EditorPage.tsx             # CodeMirror editor with toolbar and guidance
      GlobalFilesPage.tsx        # Global file grid
      ProjectFilesPage.tsx       # Project-scoped file grid
      ScannerPage.tsx            # Directory scanner with streaming results
      TemplatesPage.tsx          # Template library with preview
      TreeViewPage.tsx           # Hierarchical file tree with precedence
      HealthCheckPage.tsx        # Project health analysis with scoring
      SimpleView.tsx             # Simple mode — warm theme, inline expansion

    components/
      layout/
        AppShell.tsx             # CSS Grid shell, sidebar animation
        TitleBar.tsx             # Draggable bar, title, Cmd+K trigger
        ViewModeToggle.tsx       # Complete/Simple pill toggle
        Sidebar.tsx              # Notion-style tree navigation
        SidebarSection.tsx       # Collapsible nav section
        SidebarItem.tsx          # Nav item with status dot
        StatusBar.tsx            # File count, scan time
        ContentArea.tsx          # Page routing + transitions

      file-card/
        FileCard.tsx             # Interactive file representation
        InfoPopover.tsx          # Glassmorphic educational overlay

      editor/
        CodeEditor.tsx           # CodeMirror wrapper
        StashButton.tsx          # Animated 3-phase save button
        TemplatePicker.tsx       # Template insertion dialog
        GuidancePanel.tsx        # Contextual editing tips
        AskClaudeModal.tsx       # Clipboard prompt builder

      command-palette/
        CommandPalette.tsx       # Cmd+K fuzzy search overlay

      shared/
        Toast.tsx                # Notification system
        ErrorBoundary.tsx        # Error catch boundary

    stores/
      file-store.ts              # Global/project files state
      project-store.ts           # Discovered projects state
      ui-store.ts                # Navigation, view mode, modals

    data/
      file-info.ts               # Educational content per file type
      templates.ts               # Pre-built template content
      prompt-builder.ts          # AI prompt generation

    lib/
      constants.ts               # App-wide constants
      utils.ts                   # cn() helper, utilities

    types/
      claude-file.ts             # Re-exports from shared
      template.ts                # Template type definitions
```

## Files Managed

### Global (`~/.claude/`)

| File | Description |
|------|-------------|
| `CLAUDE.md` | Global instructions applied to all projects |
| `settings.json` | Permissions, tools, model preferences |
| `keybindings.json` | Custom keyboard shortcuts |
| `rules/*.md` | Scoped rules with optional YAML frontmatter |
| `skills/<name>/SKILL.md` | Reusable skill definitions |
| `hooks/*.py` | Automation hook scripts |
| `agents/*.md` | Custom subagent configurations |
| `projects/<id>/memory/MEMORY.md` | Auto-generated project memory |

### Project (`.claude/`)

| File | Description |
|------|-------------|
| `CLAUDE.md` (root or `.claude/`) | Team-shared project instructions |
| `CLAUDE.local.md` | Personal project instructions (gitignored) |
| `.claude/settings.json` | Shared project settings |
| `.claude/settings.local.json` | Personal project settings |
| `.claude/rules/*.md` | Path-scoped rules (YAML frontmatter with `globs`) |
| `.claude/skills/<name>/SKILL.md` | Project-specific skills |
| `.claude/hooks/*` | Project hooks |
| `.claude/agents/*.md` | Project subagents |
| `.claude/commands/*.md` | Legacy slash commands |
| `.claudeignore` | File exclusion patterns |

### Managed

| File | Description |
|------|-------------|
| `/Library/Application Support/ClaudeCode/CLAUDE.md` | Organization-wide managed policy |

## Current State

### What Works

- Full file discovery across global and project scopes
- Interactive file cards with status indicators (populated, empty, missing)
- Info popovers with educational content for every file type
- CodeMirror editor with markdown/JSON syntax highlighting
- Animated "Stash" save button (compress, spin, checkmark)
- Template library with pre-built content and variable substitution
- "Ask Claude" prompt builder (clipboard-based, zero API cost)
- Contextual guidance panel in the editor
- Project scanner with streaming discovery and health scoring
- Tree view with scope hierarchy and precedence visualization
- Health check with scored analysis and improvement suggestions
- Command palette (Cmd+K) with fuzzy search
- Dual display modes (Complete dark + Simple warm taupe)
- Simple mode with inline card expansion and project visibility
- macOS native vibrancy, traffic lights, menu bar
- File watching with automatic UI updates
- Toast notification system
- Error boundaries
- Custom app icon (`.icns` + PNG, all macOS sizes)

### Known Limitations

- **macOS only** — Uses Electron vibrancy and macOS-specific window chrome. Would need platform abstraction for Windows/Linux
- **No autosave** — Intentional (CLAUDE.md affects Claude behavior), but some users might expect it
- **No git integration** — Doesn't track which files are gitignored or show git status
- **Single-window** — Can't have multiple editor tabs open simultaneously
- **No search within editor** — CodeMirror supports it but it's not wired up
- **No file diffing** — Can't compare local vs shared versions of settings
- **Template variables are manual** — `{{PROJECT_NAME}}` etc. must be filled in by the user

## Future Considerations

### High Priority

1. **Multi-tab editor** — Open several files at once with a tab bar, like VS Code
2. **Drag-and-drop reordering** — Let users reorder rules and organize files visually
3. **File creation wizard** — Step-by-step guided flow for creating each file type, with explanations at each step
4. **Live preview** — Show how the current CLAUDE.md would be interpreted by Claude Code
5. **Search within files** — Full-text search across all Claude config files
6. **Import/export** — Share your Claude config as a portable bundle

### Medium Priority

7. **Settings form editor** — Structured form UI for `settings.json` instead of raw JSON (tag-style permission inputs, toggles for booleans)
8. **Diff view** — Compare `settings.json` vs `settings.local.json`, or `CLAUDE.md` vs `CLAUDE.local.md`
9. **Rule tester** — Enter a file path and see which rules would apply, visualizing the glob matching
10. **Precedence simulator** — Interactive diagram showing how global, project, and local settings merge
11. **Git-aware status** — Show which files are tracked, modified, or gitignored
12. **Undo/redo** — File-level version history with easy rollback
13. **Keyboard shortcuts** — Beyond Cmd+K, add shortcuts for common actions (Cmd+S save, Cmd+N new file, etc.)

### Nice to Have

14. **Theme customization** — Let users adjust the accent color, choose light/dark per mode
15. **Plugin system** — Let community members contribute templates and rules
16. **Stats dashboard** — Track file sizes, edit frequency, most-used templates
17. **Onboarding tour** — First-run walkthrough highlighting key features
18. **Notification center** — Alert when Claude Code updates change file formats or add new config options
19. **Cloud sync** — Optional sync of global config across machines
20. **Windows/Linux support** — Platform-agnostic window chrome, system tray, and file paths

### Architecture Improvements

21. **Test suite** — Unit tests for file-service, scanner-service; component tests for key UI flows
22. **E2E tests** — Playwright/Spectron tests for critical user journeys
23. **CI/CD pipeline** — Automated builds, signing, and DMG distribution
24. **Auto-updater** — Electron auto-update via electron-updater
25. **Performance profiling** — Audit large project scanning, React re-renders, animation frame rates
26. **Accessibility** — Full keyboard navigation, screen reader support, ARIA labels
27. **i18n** — Internationalization support for non-English users

## License

Private project.
