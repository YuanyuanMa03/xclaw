import type { Command } from '../../commands.js'
import { getCurrentMode } from '../../modes/store.js'

export default {
  type: 'local-jsx',
  name: 'mode',
  get description() {
    return `Switch xclaw mode (currently: ${getCurrentMode().icon} ${getCurrentMode().name})`
  },
  argumentHint: '[mode-slug]',
  load: () => import('./mode.js'),
} satisfies Command
