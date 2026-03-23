# Context Cabinet - Development History

## The Idea

Context Cabinet was born from a simple frustration: Claude Code uses ~15 different configuration files scattered across global (`~/.claude/`) and project-level (`.claude/`) directories, and most developers don't even know half of them exist. Files like `CLAUDE.local.md`, `.claude/rules/*.md`, `settings.local.json`, and `.claude/agents/*.md` are powerful but invisible. There's no tool to discover, explain, create, or edit them in one place.

The vision: a beautiful macOS desktop app that makes Claude Code configuration visual and accessible — something that looks like Linear, feels native to macOS, and teaches you about every file while you work.

## How We Built It

### The Plan (Session 1)

We started with a comprehensive implementation plan broken into 9 phases, from scaffolding to polish. The plan was detailed enough to serve as a complete architectural specification:

- **Phase 1**: Electron + React + Vite + Tailwind scaffolding with macOS vibrancy
- **Phase 2**: Core data layer — file scanning, reading, writing, watching via IPC
- **Phase 3**: UI shell — sidebar, layout, navigation, dark theme
- **Phase 4**: File cards, info popovers, dashboard
- **Phase 5**: Template library with pre-built content
- **Phase 6**: Markdown/JSON editor with animated "Stash" save button
- **Phase 7**: Project scanner to discover Claude-configured repos
- **Phase 8**: Tree view, health check, command palette (Cmd+K)
- **Phase 9**: Polish — animations, transitions, empty states, toasts

The tech stack was chosen deliberately: `electron-vite` for fast builds, Zustand for lightweight state, CodeMirror for the editor (over MDXEditor, which was swapped out for better dark theme control), Framer Motion for animations, and Tailwind CSS v4 with `@theme` for the design system.

### Phase-by-Phase Construction (Sessions 1-3)

Each phase was built sequentially, with the build verified after every change. The approach was methodical: write the code, run `npm run build`, fix any TypeScript errors, verify in the running app, then move on.

**Key architectural decisions made during implementation:**

1. **Shared types** — `ClaudeFile` and `ClaudeProject` interfaces defined once in `src/shared/types.ts`, used by both main and renderer processes
2. **IPC bridge design** — All file system operations go through typed IPC channels. The renderer never touches the filesystem directly
3. **Lazy content loading** — Files are scanned for metadata first; content is only loaded when you open the editor
4. **Static metadata approach** — Display names, descriptions, icons, and educational content for every file type are defined in `data/file-info.ts`, not computed at runtime
5. **CodeMirror over MDXEditor** — We initially planned to use MDXEditor but switched to CodeMirror during Phase 6 for better dark theme support and simpler integration

### The Guidance Philosophy (Session 2)

A pivotal moment came when testing the app and realizing that just showing files wasn't enough. The user emphasized that **guidance is a KEY feature** — the app should teach users what each file does, when to use it, and how to write effective content.

This led to several guidance-focused features:

- **Info Popovers** on every file card with descriptions, best practices, example content, and scope explanations
- **GuidancePanel** in the editor that shows contextual tips while you're editing a specific file type
- **Template Library** with pre-built, well-commented content for every file category
- **"Ask Claude" Prompt Builder** — generates clipboard prompts that users can paste into claude.ai to get AI-written config content (zero API cost, uses the browser)

### The "Ask Claude" Feature (Session 3)

Rather than integrating an API directly (which would require API keys and add cost), we built a creative "clipboard prompt" pattern:

1. User clicks "Ask Claude" in the editor toolbar
2. A modal lets them describe what they want (e.g., "TypeScript coding standards for my React project")
3. The app generates a detailed prompt with full context (file type, project info, current content)
4. User copies the prompt, pastes it into claude.ai, gets a response, and pastes it back
5. The response is inserted directly into the editor

This was a deliberate architectural choice — it keeps the app free of API dependencies while still providing AI-powered content generation.

### Fixing Real Usage Issues (Session 3)

Testing revealed several UX issues that needed fixing:

- **Empty/missing file clicks did nothing** — When clicking a file card for a file that didn't exist yet, the app silently did nothing. We fixed this by creating the file on click and opening the editor, or showing the editor for empty files so users could start writing immediately.

- **No way to create missing files from the dashboard** — The app showed missing files with dashed borders but offered no path to create them. Fixed by making the card click create the file automatically.

### Simple Mode - A Second View (Session 4)

The biggest feature addition came from wanting two ways to experience the app:

**The request**: "I'd like to make 2 display modes — the one you've done and then a simple mode, which would be just boxes for all the different MD files that should be there — a simple, dummy mode."

This became a major feature — a completely different visual experience:

- **Warm taupe light theme** with SVG noise texture background (vs. the dark navy "Complete" mode)
- **Tree hierarchy layout** with sections: Core, Behaviors, Extensions, Knowledge
- **Inline card expansion** (accordion pattern) instead of navigating to separate pages
- **Animated pill toggle** centered in the title bar to switch between modes
- **Sidebar collapse animation** — the sidebar slides away when entering Simple mode
- **CSS class-based theming** — `.simple-mode-active` reskinned the title bar, toggle, scrollbars, and selection colors

**First iteration problem**: Clicking cards in Simple View navigated to the Complete View editor (which was invisible). The user caught this immediately: "clicking on a card does nothing visible." We redesigned the cards to expand inline with smooth Framer Motion height animations, showing description, content preview, best practices, and an "Open in Editor" button that explicitly switches modes.

**Second iteration**: Added project file visibility to Simple View. Each project shows as a collapsible card with its files listed, missing files shown as greyed-out placeholders, and a mini health progress bar. The file slot merging logic creates consistent 10-slot layouts combining real files with placeholder missing files.

## Design Decisions Worth Noting

### The "Stash" Save Button
Instead of a plain "Save" button, we built a 3-phase animated save experience:
1. **Idle** — Blue button labeled "Stash"
2. **Saving** — Compresses into a circle, shows a spinner
3. **Success** — Expands with a checkmark SVG path draw animation and green flash

This was intentionally not autosave — since CLAUDE.md directly affects Claude's behavior, we wanted saving to be deliberate and satisfying.

### Health Scoring
Each project gets a 0-100 health score based on weighted criteria:
- CLAUDE.md exists (+30)
- Under 200 lines (+10)
- .claudeignore exists (+10)
- Settings configured (+10)
- Rules defined (+15)
- Skills present (+10)
- Agents defined (+5)
- Has markdown headers (+10)

### File Categorization
Files are organized into meaningful categories:
- `instructions` — CLAUDE.md files (global, project, local, managed)
- `settings` — JSON config files
- `rules` — Path-scoped markdown rules with YAML frontmatter
- `skills` — Reusable skill definitions
- `agents` — Custom subagent configurations
- `hooks` — Automation scripts
- `commands` — Legacy slash commands
- `memory` — Auto-generated project memory
- `ignore` — File exclusion patterns

## The Human-AI Collaboration

The development process was a continuous conversation. The human provided:
- The overall vision and philosophy ("guidance is KEY")
- UX feedback from actually using the app ("clicking does nothing visible")
- Design direction ("make it AMAZING!", "warm taupe background")
- Feature priorities (Simple Mode came from wanting accessibility for newcomers)

The AI provided:
- Architecture and implementation
- Consistent code style across 48 source files
- CSS theme design (both dark navy and warm taupe)
- Animation choreography (Framer Motion sequences)
- Bug diagnosis and fixes
- Build verification after every change

Every feature went through the same cycle: discuss the idea, implement it, build, test visually, get feedback, iterate. No code was written without the build being verified. When bugs were found (like the Simple View navigation issue), they were fixed immediately with the root cause identified and explained.

### App Icon Design (Session 5)

With the app functionally complete, we turned to branding. We used AI image generation (nanobanana MCP tools) to explore three icon directions:

- **Direction A — Filing Cabinet**: Literal interpretation of "Context Cabinet." A 3D rendered dark filing cabinet with a glowing blue document emerging. Looked premium but was too detailed at small sizes.
- **Direction B — Stacked Code Layers**: Geometric stacked cards with `</>` code brackets. Modern, flat, very "developer tool" energy.
- **Direction C — Vault**: A safe door ajar with blue light radiating out. Dramatic but too heavy/sci-fi for a dev tool.

We explored a `{/}` curly braces variant (more accurate for config files) but the angle brackets were cleaner. The final choice: **a glowing electric blue rounded badge with `</>` brackets on a dark navy squircle** — it's crisp at every size from 16px to 1024px, immediately reads as "developer tool," and matches the app's #3A82FF accent color perfectly.

The icon was generated at all required macOS sizes, converted to `.icns` using `sips` + `iconutil`, and installed in `resources/icon.icns`. The PNG version was also added for dev mode dock display.

## Timeline

| Session | Focus | Key Deliverables |
|---------|-------|-----------------|
| 1 | Planning + Phases 1-4 | Project scaffolding, data layer, UI shell, file cards, dashboard |
| 2 | Phases 5-9 | Templates, editor, scanner, tree view, health check, command palette, polish |
| 3 | Guidance + Ask Claude | GuidancePanel, AskClaudeModal, prompt builder, empty/missing file fixes |
| 4 | Simple Mode + Projects | Dual view modes, warm taupe theme, inline expansion, project files in Simple View |
| 5 | Documentation + Branding | HISTORY.md, README.md, app icon design and generation, .icns creation |

## Source Statistics

- **48 source files** across main process, preload, and renderer
- **Tech stack**: Electron 33, React 18, TypeScript 5.7, Tailwind CSS 4, Zustand 5, Framer Motion 11, CodeMirror 6
- **7 main process services**: file-service, scanner-service, watcher-service, ipc-handlers, menu, utils, index
- **11 pages/views**: Dashboard, Editor, Global Files, Project Files, Scanner, Templates, Tree View, Health Check, Simple View, plus the main App and layout
- **3 Zustand stores**: file-store, project-store, ui-store
- **Zero external API dependencies** — all AI features work through clipboard prompt pattern
