import type { Command } from '../../types/command.js'

const sharp = {
  type: 'local',
  name: 'sharp',
  description: 'Switch to Dr. Sharp mode (犀利模式)',
  supportsNonInteractive: false,
  load: () => import('./sharp.js'),
} satisfies Command

export default sharp
