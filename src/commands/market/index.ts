import type { Command } from '../../commands.js'

const market = {
  type: 'local',
  name: 'market',
  description: 'Plugin marketplace — browse, search, install plugins',
  supportsNonInteractive: false,
  argumentHint: '[browse|search|install|uninstall|info|installed|toggle]',
  load: () => import('./market.js'),
} satisfies Command

export default market
