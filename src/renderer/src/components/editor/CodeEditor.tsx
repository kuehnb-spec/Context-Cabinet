import { useEffect, useRef, useCallback } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: 'markdown' | 'json'
  readOnly?: boolean
}

// Custom dark theme matching our app colors
const appTheme = EditorView.theme({
  '&': {
    backgroundColor: '#0C1120',
    color: '#E8ECF4',
    fontSize: '13px',
    fontFamily: "'SF Mono', 'JetBrains Mono', ui-monospace, monospace"
  },
  '.cm-content': {
    padding: '16px 0',
    caretColor: '#3A82FF'
  },
  '.cm-cursor': {
    borderLeftColor: '#3A82FF'
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(58, 130, 255, 0.05)'
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(58, 130, 255, 0.05)'
  },
  '.cm-gutters': {
    backgroundColor: '#0C1120',
    color: '#7A8BA0',
    border: 'none',
    paddingRight: '8px'
  },
  '.cm-selectionBackground': {
    backgroundColor: 'rgba(58, 130, 255, 0.2) !important'
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(58, 130, 255, 0.3) !important'
  },
  '.cm-selectionMatch': {
    backgroundColor: 'rgba(58, 130, 255, 0.15)'
  },
  '.cm-scroller': {
    overflow: 'auto'
  }
}, { dark: true })

export function CodeEditor({
  value,
  onChange,
  language = 'markdown',
  readOnly = false
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const createState = useCallback(
    (doc: string) => {
      const langExt = language === 'json' ? json() : markdown()

      return EditorState.create({
        doc,
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          highlightActiveLineGutter(),
          highlightSelectionMatches(),
          history(),
          syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
          langExt,
          keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
          appTheme,
          oneDark,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString())
            }
          }),
          EditorState.readOnly.of(readOnly),
          EditorView.lineWrapping
        ]
      })
    },
    [language, readOnly]
  )

  useEffect(() => {
    if (!containerRef.current) return

    const state = createState(value)
    const view = new EditorView({
      state,
      parent: containerRef.current
    })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync external value changes (but not when the user is typing)
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const currentValue = view.state.doc.toString()
    if (currentValue !== value) {
      view.dispatch({
        changes: { from: 0, to: currentValue.length, insert: value }
      })
    }
  }, [value])

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden rounded-lg border border-border"
    />
  )
}
