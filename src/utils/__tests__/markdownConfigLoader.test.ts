import { describe, expect, test, beforeEach, afterEach } from 'bun:test'
import { mkdirSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import {
  getProjectDirsUpToHome,
  loadMarkdownFilesForSubdir,
} from '../markdownConfigLoader'

describe('getProjectDirsUpToHome with xclaw overlay', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = join(
      tmpdir(),
      `xclaw-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    )
    mkdirSync(tmpDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true })
  })

  test('returns both .claude and .xclaw dirs when both exist', () => {
    mkdirSync(join(tmpDir, '.claude', 'skills'), { recursive: true })
    mkdirSync(join(tmpDir, '.xclaw', 'skills'), { recursive: true })

    const dirs = getProjectDirsUpToHome('skills', tmpDir)
    const hasClaude = dirs.some(d => d.includes('.claude'))
    const hasXclaw = dirs.some(d => d.includes('.xclaw'))
    expect(hasClaude).toBe(true)
    expect(hasXclaw).toBe(true)
  })

  test('returns only .claude when .xclaw does not exist', () => {
    mkdirSync(join(tmpDir, '.claude', 'skills'), { recursive: true })

    const dirs = getProjectDirsUpToHome('skills', tmpDir)
    const hasClaude = dirs.some(d => d.includes('.claude'))
    const hasXclaw = dirs.some(d => d.includes('.xclaw'))
    expect(hasClaude).toBe(true)
    expect(hasXclaw).toBe(false)
  })

  test('returns only .xclaw when .claude does not exist', () => {
    mkdirSync(join(tmpDir, '.xclaw', 'skills'), { recursive: true })

    const dirs = getProjectDirsUpToHome('skills', tmpDir)
    const hasClaude = dirs.some(d => d.includes('.claude'))
    const hasXclaw = dirs.some(d => d.includes('.xclaw'))
    expect(hasClaude).toBe(false)
    expect(hasXclaw).toBe(true)
  })

  test('returns empty array when neither .claude nor .xclaw exist', () => {
    const dirs = getProjectDirsUpToHome('skills', tmpDir)
    expect(dirs).toEqual([])
  })
})

describe('loadMarkdownFilesForSubdir user-level xclaw', () => {
  let tmpDir: string
  let origClaudeConfigDir: string | undefined
  let origXclawConfigDir: string | undefined
  let origNativeFileSearch: string | undefined

  beforeEach(() => {
    tmpDir = join(
      tmpdir(),
      `xclaw-user-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    )
    mkdirSync(tmpDir, { recursive: true })
    origClaudeConfigDir = process.env.CLAUDE_CONFIG_DIR
    origXclawConfigDir = process.env.XCLAW_CONFIG_DIR
    origNativeFileSearch = process.env.CLAUDE_CODE_USE_NATIVE_FILE_SEARCH
    process.env.CLAUDE_CONFIG_DIR = join(tmpDir, '.claude')
    process.env.XCLAW_CONFIG_DIR = join(tmpDir, '.xclaw')
    // Use native file search in tests — ripgrep subprocess can hang in bun test
    process.env.CLAUDE_CODE_USE_NATIVE_FILE_SEARCH = '1'
    mkdirSync(join(tmpDir, '.claude', 'skills'), { recursive: true })
    mkdirSync(join(tmpDir, '.xclaw', 'skills'), { recursive: true })
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

  test('loads skills from both user-level directories', async () => {
    writeFileSync(
      join(tmpDir, '.claude', 'skills', 'claude-user.md'),
      '---\nname: claude-user\n---\nClaude user skill',
    )
    writeFileSync(
      join(tmpDir, '.xclaw', 'skills', 'xclaw-user.md'),
      '---\nname: xclaw-user\n---\nXclaw user skill',
    )

    const files = await loadMarkdownFilesForSubdir('skills', tmpDir)
    const filePaths = files.map(f => f.filePath)
    expect(filePaths.some(p => p.includes('claude-user.md'))).toBe(true)
    expect(filePaths.some(p => p.includes('xclaw-user.md'))).toBe(true)
  })
})
