import { describe, expect, test, beforeEach, afterEach } from 'bun:test'
import { mkdirSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { getWatchablePaths } from '../skillChangeDetector'

describe('skillChangeDetector xclaw support', () => {
  let tmpDir: string
  let origClaudeConfigDir: string | undefined
  let origXclawConfigDir: string | undefined
  let origCwd: string

  beforeEach(() => {
    tmpDir = join(
      tmpdir(),
      `xclaw-watch-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    )
    mkdirSync(tmpDir, { recursive: true })
    origClaudeConfigDir = process.env.CLAUDE_CONFIG_DIR
    origXclawConfigDir = process.env.XCLAW_CONFIG_DIR
    origCwd = process.cwd()
    process.env.CLAUDE_CONFIG_DIR = join(tmpDir, '.claude')
    process.env.XCLAW_CONFIG_DIR = join(tmpDir, '.xclaw')
    // Change cwd to tmpDir so project-level scan doesn't find real .xclaw/
    process.chdir(tmpDir)
  })

  afterEach(() => {
    process.chdir(origCwd)
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
    rmSync(tmpDir, { recursive: true, force: true })
  })

  test('getWatchablePaths includes xclaw user skills dir when it exists', async () => {
    mkdirSync(join(tmpDir, '.xclaw', 'skills'), { recursive: true })
    const paths = await getWatchablePaths()
    expect(paths.some(p => p.includes('.xclaw') && p.includes('skills'))).toBe(
      true,
    )
  })

  test('getWatchablePaths includes xclaw user commands dir when it exists', async () => {
    mkdirSync(join(tmpDir, '.xclaw', 'commands'), { recursive: true })
    const paths = await getWatchablePaths()
    expect(
      paths.some(p => p.includes('.xclaw') && p.includes('commands')),
    ).toBe(true)
  })

  test('getWatchablePaths skips xclaw user skills dir when it does not exist', async () => {
    const paths = await getWatchablePaths()
    expect(paths.some(p => p.includes('.xclaw') && p.includes('skills'))).toBe(
      false,
    )
  })
})
