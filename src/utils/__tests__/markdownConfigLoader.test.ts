import { describe, expect, test, beforeEach, afterEach } from 'bun:test'
import { mkdirSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { getProjectDirsUpToHome } from '../markdownConfigLoader'

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
