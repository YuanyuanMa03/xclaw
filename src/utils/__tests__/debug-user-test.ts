import { describe, expect, test, beforeEach, afterEach } from 'bun:test'
import { mkdirSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { loadMarkdownFilesForSubdir } from '../markdownConfigLoader'
import { getClaudeConfigHomeDir, getXclawConfigHomeDir } from '../envUtils'

describe('debug user-level xclaw', () => {
  let tmpDir: string
  let origClaudeConfigDir: string | undefined
  let origXclawConfigDir: string | undefined

  beforeEach(() => {
    tmpDir = join(
      tmpdir(),
      `xclaw-debug-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    )
    mkdirSync(tmpDir, { recursive: true })
    origClaudeConfigDir = process.env.CLAUDE_CONFIG_DIR
    origXclawConfigDir = process.env.XCLAW_CONFIG_DIR
    process.env.CLAUDE_CONFIG_DIR = join(tmpDir, '.claude')
    process.env.XCLAW_CONFIG_DIR = join(tmpDir, '.xclaw')
    mkdirSync(join(tmpDir, '.claude', 'skills'), { recursive: true })
    mkdirSync(join(tmpDir, '.xclaw', 'skills'), { recursive: true })
    writeFileSync(
      join(tmpDir, '.claude', 'skills', 'claude-user.md'),
      '---\nname: claude-user\n---\nClaude',
    )
    writeFileSync(
      join(tmpDir, '.xclaw', 'skills', 'xclaw-user.md'),
      '---\nname: xclaw-user\n---\nXclaw',
    )
  })

  afterEach(() => {
    if (origClaudeConfigDir !== undefined)
      process.env.CLAUDE_CONFIG_DIR = origClaudeConfigDir
    else delete process.env.CLAUDE_CONFIG_DIR
    if (origXclawConfigDir !== undefined)
      process.env.XCLAW_CONFIG_DIR = origXclawConfigDir
    else delete process.env.XCLAW_CONFIG_DIR
    rmSync(tmpDir, { recursive: true, force: true })
  })

  test('debug', async () => {
    console.log('tmpDir:', tmpDir)
    console.log('CLAUDE_CONFIG_DIR env:', process.env.CLAUDE_CONFIG_DIR)
    console.log('XCLAW_CONFIG_DIR env:', process.env.XCLAW_CONFIG_DIR)
    console.log('getClaudeConfigHomeDir():', getClaudeConfigHomeDir())
    console.log('getXclawConfigHomeDir():', getXclawConfigHomeDir())

    const files = await loadMarkdownFilesForSubdir('skills', tmpDir)
    console.log('Files found:', files.length)
    for (const f of files) {
      console.log('  -', f.filePath, 'source:', f.source, 'baseDir:', f.baseDir)
    }
    expect(files.length).toBe(2)
  })
})
