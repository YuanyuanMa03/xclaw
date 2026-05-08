import { describe, expect, test, beforeEach, afterEach } from 'bun:test'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { settingsMergeCustomizer } from '../utils/settings/settings'
import mergeWith from 'lodash-es/mergeWith.js'
import { loadMarkdownFilesForSubdir } from '../utils/markdownConfigLoader'

describe('xclaw overlay integration', () => {
  let tmpDir: string
  let origClaudeConfigDir: string | undefined
  let origXclawConfigDir: string | undefined
  let origNativeFileSearch: string | undefined

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'xclaw-integration-'))
    origClaudeConfigDir = process.env.CLAUDE_CONFIG_DIR
    origXclawConfigDir = process.env.XCLAW_CONFIG_DIR
    origNativeFileSearch = process.env.CLAUDE_CODE_USE_NATIVE_FILE_SEARCH
    process.env.CLAUDE_CONFIG_DIR = join(tmpDir, '.claude')
    process.env.XCLAW_CONFIG_DIR = join(tmpDir, '.xclaw')
    process.env.CLAUDE_CODE_USE_NATIVE_FILE_SEARCH = '1'
  })

  afterEach(() => {
    if (origClaudeConfigDir !== undefined) {
      process.env.CLAUDE_CONFIG_DIR = origClaudeConfigDir
    } else {
      delete process.env.CLAUDE_CONFIG_DIR
    }
    if (origXclawConfigDir !== undefined) {
      process.env.XCLAW_CONFIG_DIR = origXclawConfigDir
    } else {
      delete process.env.XCLAW_CONFIG_DIR
    }
    if (origNativeFileSearch !== undefined) {
      process.env.CLAUDE_CODE_USE_NATIVE_FILE_SEARCH = origNativeFileSearch
    } else {
      delete process.env.CLAUDE_CODE_USE_NATIVE_FILE_SEARCH
    }
    rmSync(tmpDir, { recursive: true, force: true })
  })

  test('settings merge: xclaw overlays on claude', () => {
    const base = {
      model: 'sonnet',
      permissions: { allow: ['Read'] },
      env: { FOO: 'bar' },
    }
    const overlay = {
      model: 'opus',
      permissions: { allow: ['Bash(git *)'] },
    }
    const result = mergeWith({}, base, overlay, settingsMergeCustomizer)
    expect(result.model).toBe('opus')
    expect(result.permissions.allow).toContain('Read')
    expect(result.permissions.allow).toContain('Bash(git *)')
    expect(result.env.FOO).toBe('bar')
  })

  test('skills dual-scan: loads from both directories', async () => {
    mkdirSync(join(tmpDir, '.claude', 'skills', 'claude-skill'), {
      recursive: true,
    })
    writeFileSync(
      join(tmpDir, '.claude', 'skills', 'claude-skill', 'SKILL.md'),
      '---\nname: claude-skill\n---\nClaude skill',
    )

    mkdirSync(join(tmpDir, '.xclaw', 'skills', 'xclaw-skill'), {
      recursive: true,
    })
    writeFileSync(
      join(tmpDir, '.xclaw', 'skills', 'xclaw-skill', 'SKILL.md'),
      '---\nname: xclaw-skill\n---\nXclaw skill',
    )

    const files = await loadMarkdownFilesForSubdir('skills', tmpDir)
    const names = files.map(f => f.frontmatter.name)
    expect(names).toContain('claude-skill')
    expect(names).toContain('xclaw-skill')
  })

  test('standalone: only .xclaw works without .claude', async () => {
    mkdirSync(join(tmpDir, '.xclaw', 'skills', 'standalone-skill'), {
      recursive: true,
    })
    writeFileSync(
      join(tmpDir, '.xclaw', 'skills', 'standalone-skill', 'SKILL.md'),
      '---\nname: standalone\n---\nStandalone skill',
    )

    const files = await loadMarkdownFilesForSubdir('skills', tmpDir)
    const names = files.map(f => f.frontmatter.name)
    expect(names).toContain('standalone')
  })

  test('name collision: xclaw skill wins over claude skill', async () => {
    mkdirSync(join(tmpDir, '.claude', 'skills', 'shared'), { recursive: true })
    writeFileSync(
      join(tmpDir, '.claude', 'skills', 'shared', 'SKILL.md'),
      '---\nname: shared\n---\nClaude version',
    )

    mkdirSync(join(tmpDir, '.xclaw', 'skills', 'shared'), { recursive: true })
    writeFileSync(
      join(tmpDir, '.xclaw', 'skills', 'shared', 'SKILL.md'),
      '---\nname: shared\n---\nXclaw version',
    )

    const files = await loadMarkdownFilesForSubdir('skills', tmpDir)
    const sharedFiles = files.filter(f => f.filePath.includes('shared'))
    expect(sharedFiles).toHaveLength(1)
    expect(sharedFiles[0]!.content).toContain('Xclaw version')
  })

  test('commands dual-scan: loads from both directories', async () => {
    mkdirSync(join(tmpDir, '.claude', 'commands'), { recursive: true })
    writeFileSync(
      join(tmpDir, '.claude', 'commands', 'claude-cmd.md'),
      '---\nname: claude-cmd\n---\nClaude command',
    )

    mkdirSync(join(tmpDir, '.xclaw', 'commands'), { recursive: true })
    writeFileSync(
      join(tmpDir, '.xclaw', 'commands', 'xclaw-cmd.md'),
      '---\nname: xclaw-cmd\n---\nXclaw command',
    )

    const files = await loadMarkdownFilesForSubdir('commands', tmpDir)
    const names = files.map(f => f.frontmatter.name)
    expect(names).toContain('claude-cmd')
    expect(names).toContain('xclaw-cmd')
  })
})
