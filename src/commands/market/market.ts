import type { LocalCommandCall } from '../../types/command.js'
import {
  getAvailablePlugins,
  getInstalledPlugins,
  getPluginInfo,
  installPlugin,
  searchPlugins,
  togglePlugin,
  uninstallPlugin,
} from '../../plugins/marketplace/registry.js'

function formatTable(
  plugins: {
    name: string
    description: string
    author?: string
    version?: string
    tags?: string[]
  }[],
): string {
  if (plugins.length === 0) return '  (none)'
  const maxName = Math.max(...plugins.map(p => p.name.length), 4)
  return plugins
    .map(p => {
      const ver = p.version ? ` v${p.version}` : ''
      const tags = p.tags?.length ? ` [${p.tags.join(', ')}]` : ''
      return `  ${p.name.padEnd(maxName)}${ver.padEnd(8)} ${p.description}${tags}`
    })
    .join('\n')
}

export const call: LocalCommandCall = async args => {
  const parts = (args || '').trim().split(/\s+/)
  const sub = parts[0] || 'browse'
  const arg = parts[1]

  switch (sub) {
    case 'browse':
    case 'list': {
      const available = getAvailablePlugins()
      const installed = getInstalledPlugins()
      const installedNames = new Set(installed.map(p => p.name))

      const lines = available.map(p => {
        const status = installedNames.has(p.name) ? ' [installed]' : ''
        return `  ${p.name.padEnd(16)} ${p.version.padEnd(8)} ${p.description}  (${p.author})${status}`
      })

      return {
        type: 'text',
        value: [
          'xclaw Plugin Marketplace',
          '',
          'Available plugins:',
          ...lines,
          '',
          `Installed: ${installed.length} | Available: ${available.length}`,
          '',
          'Commands:',
          '  /market info <name>     — Plugin details',
          '  /market install <name>  — Install a plugin',
          '  /market uninstall <name> — Remove a plugin',
          '  /market installed       — List installed plugins',
          '  /market search <query>  — Search plugins',
        ].join('\n'),
      }
    }

    case 'installed': {
      const installed = getInstalledPlugins()
      if (installed.length === 0) {
        return {
          type: 'text',
          value:
            'No plugins installed.\n\nUse /market browse to see available plugins.',
        }
      }
      const lines = installed.map(
        p =>
          `  ${p.name.padEnd(16)} v${p.version.padEnd(8)} ${p.enabled ? 'enabled' : 'disabled'}  installed: ${p.installedAt.slice(0, 10)}`,
      )
      return {
        type: 'text',
        value: [
          'Installed Plugins:',
          '',
          ...lines,
          '',
          'Use /market toggle <name> to enable/disable',
        ].join('\n'),
      }
    }

    case 'search': {
      if (!arg) {
        return { type: 'text', value: 'Usage: /market search <query>' }
      }
      const results = searchPlugins(arg)
      if (results.length === 0) {
        return {
          type: 'text',
          value: `No plugins matching "${arg}". Try /market browse to see all available plugins.`,
        }
      }
      return {
        type: 'text',
        value: [`Search results for "${arg}":`, '', formatTable(results)].join(
          '\n',
        ),
      }
    }

    case 'info': {
      if (!arg) {
        return { type: 'text', value: 'Usage: /market info <plugin-name>' }
      }
      const info = getPluginInfo(arg)
      if (!info.available && !info.installed) {
        return {
          type: 'text',
          value: `Plugin "${arg}" not found. Use /market browse to see available plugins.`,
        }
      }
      const lines: string[] = [`Plugin: ${arg}`, '']
      if (info.available) {
        const p = info.available
        lines.push(`  Description: ${p.description}`)
        lines.push(`  Author:      ${p.author}`)
        lines.push(`  Version:     ${p.version}`)
        lines.push(`  Tags:        ${p.tags.join(', ')}`)
        lines.push(`  Source:      ${p.source}`)
      }
      if (info.installed) {
        const p = info.installed
        lines.push('')
        lines.push('  Status:      installed')
        lines.push(`  Enabled:     ${p.enabled ? 'yes' : 'no'}`)
        lines.push(`  Installed:   ${p.installedAt}`)
        lines.push('')
        lines.push(`  /market uninstall ${arg} — Remove`)
        lines.push(
          `  /market toggle ${arg}   — ${p.enabled ? 'Disable' : 'Enable'}`,
        )
      } else {
        lines.push('')
        lines.push(`  /market install ${arg} — Install this plugin`)
      }
      return { type: 'text', value: lines.join('\n') }
    }

    case 'install': {
      if (!arg) {
        return { type: 'text', value: 'Usage: /market install <plugin-name>' }
      }
      const result = installPlugin(arg)
      return { type: 'text', value: result.message }
    }

    case 'uninstall':
    case 'remove': {
      if (!arg) {
        return { type: 'text', value: 'Usage: /market uninstall <plugin-name>' }
      }
      const result = uninstallPlugin(arg)
      return { type: 'text', value: result.message }
    }

    case 'toggle': {
      if (!arg) {
        return { type: 'text', value: 'Usage: /market toggle <plugin-name>' }
      }
      const result = togglePlugin(arg)
      return { type: 'text', value: result.message }
    }

    default:
      return {
        type: 'text',
        value: [
          `Unknown market subcommand: "${sub}"`,
          '',
          'Available subcommands:',
          '  /market browse          — Browse available plugins',
          '  /market installed       — List installed plugins',
          '  /market search <query>  — Search plugins',
          '  /market info <name>     — Plugin details',
          '  /market install <name>  — Install a plugin',
          '  /market uninstall <name> — Remove a plugin',
          '  /market toggle <name>   — Enable/disable a plugin',
        ].join('\n'),
      }
  }
}
