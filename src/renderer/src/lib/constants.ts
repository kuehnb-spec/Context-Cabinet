// Layout
export const SIDEBAR_WIDTH = 240
export const TITLEBAR_HEIGHT = 48
export const STATUSBAR_HEIGHT = 32

// Colors (also defined in globals.css @theme)
export const colors = {
  background: '#0C1120',
  surface: '#151D2E',
  elevated: '#1A2540',
  border: '#243044',
  primary: '#3A82FF',
  success: '#22C55E',
  warning: '#F59E0B',
  destructive: '#EF4444',
  muted: '#7A8BA0'
} as const

// File category display config
export const categoryConfig: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  instructions: { label: 'Instructions', icon: 'FileText', color: '#3A82FF' },
  settings: { label: 'Settings', icon: 'Settings', color: '#8B5CF6' },
  keybindings: { label: 'Keybindings', icon: 'Keyboard', color: '#EC4899' },
  rules: { label: 'Rules', icon: 'Scale', color: '#F59E0B' },
  skills: { label: 'Skills', icon: 'Wand2', color: '#22C55E' },
  hooks: { label: 'Hooks', icon: 'Webhook', color: '#EF4444' },
  agents: { label: 'Agents', icon: 'Bot', color: '#06B6D4' },
  commands: { label: 'Commands', icon: 'Terminal', color: '#F97316' },
  ignore: { label: 'Ignore', icon: 'EyeOff', color: '#6B7280' },
  memory: { label: 'Memory', icon: 'Brain', color: '#A855F7' },
  policy: { label: 'Policy', icon: 'Shield', color: '#14B8A6' }
} as const
