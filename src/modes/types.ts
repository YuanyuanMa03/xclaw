import type { PermissionMode } from '../types/permissions.js'

export interface XclawMode {
  name: string
  slug: string
  description: string
  icon: string
  systemPrompt: string
  ui: {
    accentColor: string
    promptPrefix: string
  }
  companionSpecies?: string
  permissions: {
    defaultMode: PermissionMode
    memoryExtract: boolean
  }
  responseStyle: {
    verbosity: 'minimal' | 'normal' | 'verbose'
  }
}
