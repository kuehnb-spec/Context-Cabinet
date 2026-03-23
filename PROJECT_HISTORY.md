# Context Cabinet — Project History

## The Problem

Claude Code uses a constellation of configuration files scattered across two locations — a global scope (`~/.claude/`) and per-project scope (`.claude/`). There are roughly 15 different file types: CLAUDE.md, settings.json, rules, skills, hooks, agents, and more. Most developers don't know these files exist, and the ones who do often struggle to find them, understand what they do, or figure out how they interact.

Context Cabinet was built to make this invisible infrastructure visible.

## How It Was Built

The project was developed across five focused sessions, each building on the last.

### Session 1: Scaffolding Through Dashboard

The first session covered planning and the first four development phases. The tech stack was chosen deliberately: **Electron** for native macOS integration (vibrancy, traffic lights, titlebar styling), **React 18** with **TypeScript** for the UI, **Tailwind CSS 4** for styling, and **electron-vite** as the build tool. The state management choice was **Zustand** — lightweight and well-suited to the app's file-centric data flow.

The core data layer was built in this session: file scanning across both scopes, reading and writing via IPC channels bridging main and renderer processes, and file watchers using chokidar with debouncing so the UI updates automatically when files change on disk. A scanner service using fast-glob discovers Claude-enabled projects on the machine.

The dashboard, file cards, and basic navigation were all working by the end of this session.

### Session 2: Templates Through Polish

The second session was the most feature-dense. It added the template library (pre-built, well-commented starter content for every file type), the **CodeMirror 6** editor with markdown/JSON syntax highlighting, the project scanner with streaming discovery, the tree view showing file scope hierarchy and precedence rules, a health check system with weighted scoring (CLAUDE.md +30, rules +15, settings +10), a **command palette** (Cmd+K) with fuzzy search via cmdk, and general UI polish.

### Session 3: Guidance as a Feature

A key design insight crystallized in the third session: **the app should teach, not just show**. This led to the guidance panel — contextual help that appears alongside the editor explaining what each file does, best practices, common mistakes, and examples. An "Ask Claude" modal was added: a prompt builder that generates a well-structured Claude prompt for creating file content, copies it to the clipboard (zero API cost), and lets the user paste it into any Claude interface.

Empty and missing file states got dedicated handling — instead of just showing "file not found," the UI explains what the file would do and offers to create it from a template.

### Session 4: Simple Mode

The fourth session introduced a second display mode. **Complete Mode** is the full dark navy interface with sidebar navigation. **Simple Mode** is a warmer, lighter alternative with a taupe color palette and a tree-based layout where file cards expand inline. Same data, different experience — letting users choose which approach feels more natural.

### Session 5: Documentation and Branding

The final session focused on documentation, the app icon design, and branding. A custom .icns icon was created with PNGs for all macOS sizes.

## Architecture

The app is roughly 8,400 lines of TypeScript/TSX across 49 source files. The largest files are the template content (879 lines), the Simple Mode view (869 lines), the file metadata/educational content (770 lines), and the prompt builder (480 lines) — reflecting the emphasis on guidance and content over raw functionality.

The main process runs seven services (window management, IPC handlers, file service, scanner, watcher, menu, utilities). The renderer has nine pages, eighteen components, three Zustand stores, and a rich data layer.

## Design Philosophy

Context Cabinet's core belief is that **configuration files are an educational opportunity**. Every file card has an info popover. Every editor session has a guidance panel. Every missing file is a chance to explain what could be there. The app doesn't just manage files — it helps users understand a system they didn't know existed.

## Where It Stands

The app is functionally complete and usable. It's macOS-only (by design — Electron vibrancy is macOS-specific). Future considerations include multi-tab editing, drag-and-drop reordering, live preview, diff view, and eventually cross-platform support, but the current version accomplishes its primary mission.

## Technical Notes

- **Runtime**: Electron 33
- **UI**: React 18, TypeScript 5.7, Tailwind CSS 4
- **Editor**: CodeMirror 6
- **State**: Zustand 5
- **Animations**: Framer Motion 11
- **UI Primitives**: Radix UI
- **Build**: electron-vite 5, electron-builder for DMG/ZIP packaging
- **App ID**: com.contextcabinet.app
- **Category**: Developer Tools
