import type { Command } from '../../commands.js'

const accountability = {
  type: 'local',
  name: 'accountability',
  description:
    'Toggle code accountability tracking — log all AI file modifications',
  supportsNonInteractive: false,
  argumentHint: '[on|off|log|clear]',
  load: () => import('./accountability.js'),
} satisfies Command

export default accountability
