import type { FileCategory } from './claude-file'

export interface Template {
  id: string
  name: string
  description: string
  category: FileCategory
  subcategory: string
  content: string
  variables: TemplateVariable[]
  tags: string[]
  isStarter: boolean
}

export interface TemplateVariable {
  key: string
  label: string
  placeholder: string
  required: boolean
}
