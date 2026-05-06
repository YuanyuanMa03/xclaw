/**
 * xclaw Plugin Marketplace Registry
 *
 * Manages the local plugin marketplace: available plugins index,
 * installation, uninstallation, and discovery.
 *
 * Plugin lifecycle:
 * 1. Available plugins are listed in a bundled index
 * 2. `install` copies plugin files to ~/.xclaw/plugins/<name>/
 * 3. Installed plugins are registered with the plugin system
 * 4. `uninstall` removes the plugin directory
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs'
import { join } from 'path'
import { getXclawConfigHomeDir } from '../../utils/envUtils.js'

export interface MarketplacePlugin {
  name: string
  description: string
  author: string
  version: string
  tags: string[]
  /** Where to get the plugin: 'bundled' or 'git:<url>' */
  source: 'bundled' | `git:${string}`
  /** Entry point relative to plugin root */
  entryPoint: string
  /** Optional hooks configuration */
  hooks?: Record<string, unknown>
  /** Optional MCP server configuration */
  mcpServers?: Record<string, unknown>
}

export interface InstalledPlugin {
  name: string
  version: string
  installedAt: string
  source: string
  enabled: boolean
}

function getMarketplaceDir(): string {
  return join(getXclawConfigHomeDir(), 'marketplace')
}

function getPluginsDir(): string {
  return join(getXclawConfigHomeDir(), 'plugins')
}

function getInstalledIndexPath(): string {
  return join(getMarketplaceDir(), 'installed.json')
}

function ensureDirs(): void {
  const dirs = [getMarketplaceDir(), getPluginsDir()]
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
  }
}

/**
 * Curated list of available marketplace plugins.
 * In a real implementation, this would be fetched from a remote registry.
 */
const BUNDLED_INDEX: MarketplacePlugin[] = [
  {
    name: 'code-review',
    description:
      'Automated code review on commit — checks style, bugs, and security',
    author: 'xclaw',
    version: '1.0.0',
    tags: ['git', 'review', 'quality'],
    source: 'bundled',
    entryPoint: 'index.js',
  },
  {
    name: 'test-gen',
    description: 'Generate unit tests from function signatures and docstrings',
    author: 'community',
    version: '0.9.0',
    tags: ['testing', 'generation'],
    source: 'bundled',
    entryPoint: 'index.js',
  },
  {
    name: 'doc-writer',
    description: 'Auto-generate and maintain documentation from code comments',
    author: 'community',
    version: '0.8.0',
    tags: ['docs', 'generation'],
    source: 'bundled',
    entryPoint: 'index.js',
  },
  {
    name: 'git-flow',
    description:
      'Git workflow automation — branch naming, PR templates, merge strategies',
    author: 'xclaw',
    version: '1.1.0',
    tags: ['git', 'workflow', 'automation'],
    source: 'bundled',
    entryPoint: 'index.js',
  },
  {
    name: 'perf-analyzer',
    description:
      'Performance profiling — detect bottlenecks, suggest optimizations',
    author: 'community',
    version: '0.7.0',
    tags: ['performance', 'profiling'],
    source: 'bundled',
    entryPoint: 'index.js',
  },
  {
    name: 'commit-ai',
    description:
      'AI-powered conventional commit message generation from staged changes',
    author: 'xclaw',
    version: '1.0.0',
    tags: ['git', 'commit', 'ai'],
    source: 'bundled',
    entryPoint: 'index.js',
  },
  {
    name: 'dep-audit',
    description:
      'Dependency audit — check for vulnerabilities, outdated packages, license issues',
    author: 'community',
    version: '0.6.0',
    tags: ['security', 'dependencies'],
    source: 'bundled',
    entryPoint: 'index.js',
  },
  {
    name: 'changelog-gen',
    description:
      'Generate changelogs from git history with conventional commit parsing',
    author: 'xclaw',
    version: '1.0.0',
    tags: ['git', 'changelog', 'docs'],
    source: 'bundled',
    entryPoint: 'index.js',
  },
]

/**
 * Get the list of all available plugins from the marketplace index.
 */
export function getAvailablePlugins(): MarketplacePlugin[] {
  return [...BUNDLED_INDEX]
}

/**
 * Search available plugins by query string (matches name, description, tags).
 */
export function searchPlugins(query: string): MarketplacePlugin[] {
  const q = query.toLowerCase()
  return BUNDLED_INDEX.filter(
    p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.includes(q)),
  )
}

/**
 * Get a specific available plugin by name.
 */
export function getAvailablePlugin(
  name: string,
): MarketplacePlugin | undefined {
  return BUNDLED_INDEX.find(p => p.name === name)
}

/**
 * Get installed plugins from the local index.
 */
export function getInstalledPlugins(): InstalledPlugin[] {
  ensureDirs()
  const path = getInstalledIndexPath()
  if (!existsSync(path)) return []
  try {
    const data = readFileSync(path, 'utf-8')
    return JSON.parse(data) as InstalledPlugin[]
  } catch {
    return []
  }
}

/**
 * Save installed plugins index.
 */
function saveInstalledIndex(plugins: InstalledPlugin[]): void {
  ensureDirs()
  writeFileSync(getInstalledIndexPath(), JSON.stringify(plugins, null, 2))
}

/**
 * Check if a plugin is installed.
 */
export function isPluginInstalled(name: string): boolean {
  return getInstalledPlugins().some(p => p.name === name)
}

/**
 * Install a plugin from the marketplace.
 *
 * For bundled plugins, creates a plugin directory with a manifest.
 * For git plugins, would clone the repo (not yet implemented).
 */
export function installPlugin(name: string): {
  success: boolean
  message: string
} {
  ensureDirs()

  const available = getAvailablePlugin(name)
  if (!available) {
    return {
      success: false,
      message: `Plugin "${name}" not found in marketplace. Use /market browse to see available plugins.`,
    }
  }

  if (isPluginInstalled(name)) {
    return {
      success: false,
      message: `Plugin "${name}" is already installed. Use /market uninstall ${name} to remove it first.`,
    }
  }

  const pluginDir = join(getPluginsDir(), name)
  if (existsSync(pluginDir)) {
    rmSync(pluginDir, { recursive: true })
  }
  mkdirSync(pluginDir, { recursive: true })

  // Write plugin manifest
  const manifest = {
    name: available.name,
    description: available.description,
    author: available.author,
    version: available.version,
    entryPoint: available.entryPoint,
    hooks: available.hooks ?? {},
    mcpServers: available.mcpServers ?? {},
    installedAt: new Date().toISOString(),
  }
  writeFileSync(
    join(pluginDir, 'plugin.json'),
    JSON.stringify(manifest, null, 2),
  )

  // Write a stub entry point
  writeFileSync(
    join(pluginDir, available.entryPoint),
    `// xclaw plugin: ${available.name}\n// ${available.description}\n// Installed via xclaw marketplace\n\nexport default {\n  name: '${available.name}',\n  version: '${available.version}',\n  activate: () => {\n    console.log('[${available.name}] Plugin activated')\n  },\n}\n`,
  )

  // Update installed index
  const installed = getInstalledPlugins()
  installed.push({
    name: available.name,
    version: available.version,
    installedAt: new Date().toISOString(),
    source: available.source,
    enabled: true,
  })
  saveInstalledIndex(installed)

  return {
    success: true,
    message: `Plugin "${name}" v${available.version} installed successfully.\nLocation: ${pluginDir}\nRestart xclaw to activate.`,
  }
}

/**
 * Uninstall a plugin.
 */
export function uninstallPlugin(name: string): {
  success: boolean
  message: string
} {
  ensureDirs()

  if (!isPluginInstalled(name)) {
    return {
      success: false,
      message: `Plugin "${name}" is not installed.`,
    }
  }

  // Remove plugin directory
  const pluginDir = join(getPluginsDir(), name)
  if (existsSync(pluginDir)) {
    rmSync(pluginDir, { recursive: true })
  }

  // Update installed index
  const installed = getInstalledPlugins().filter(p => p.name !== name)
  saveInstalledIndex(installed)

  return {
    success: true,
    message: `Plugin "${name}" uninstalled. Restart xclaw to take effect.`,
  }
}

/**
 * Toggle plugin enabled/disabled state.
 */
export function togglePlugin(name: string): {
  success: boolean
  message: string
} {
  const installed = getInstalledPlugins()
  const plugin = installed.find(p => p.name === name)
  if (!plugin) {
    return { success: false, message: `Plugin "${name}" is not installed.` }
  }
  plugin.enabled = !plugin.enabled
  saveInstalledIndex(installed)
  return {
    success: true,
    message: `Plugin "${name}" ${plugin.enabled ? 'enabled' : 'disabled'}. Restart xclaw to take effect.`,
  }
}

/**
 * Get detailed info about a plugin (available or installed).
 */
export function getPluginInfo(name: string): {
  available?: MarketplacePlugin
  installed?: InstalledPlugin
} {
  return {
    available: getAvailablePlugin(name),
    installed: getInstalledPlugins().find(p => p.name === name),
  }
}

/**
 * List installed plugin directories (for integration with plugin loader).
 */
export function getInstalledPluginPaths(): string[] {
  const pluginsDir = getPluginsDir()
  if (!existsSync(pluginsDir)) return []
  return readdirSync(pluginsDir)
    .filter(f => {
      const manifestPath = join(pluginsDir, f, 'plugin.json')
      return existsSync(manifestPath)
    })
    .map(f => join(pluginsDir, f))
}
