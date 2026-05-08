import { describe, expect, test } from 'bun:test'
import { settingsMergeCustomizer } from '../settings'
import mergeWith from 'lodash-es/mergeWith.js'

describe('xclaw settings overlay merge', () => {
  test('deep merge: xclaw overrides matching fields, preserves others', () => {
    const base = {
      model: 'sonnet',
      permissions: { allow: ['Read', 'Edit'] },
      env: { FOO: 'bar' },
    }
    const overlay = {
      model: 'opus',
      permissions: { allow: ['Bash(git *)'] },
    }
    const result = mergeWith({}, base, overlay, settingsMergeCustomizer)
    expect(result.model).toBe('opus')
    expect(result.permissions.allow).toContain('Read')
    expect(result.permissions.allow).toContain('Edit')
    expect(result.permissions.allow).toContain('Bash(git *)')
    expect(result.env.FOO).toBe('bar')
  })

  test('array concat + dedupe', () => {
    const base = { permissions: { allow: ['Read', 'Edit'] } }
    const overlay = { permissions: { allow: ['Edit', 'Bash(git *)'] } }
    const result = mergeWith({}, base, overlay, settingsMergeCustomizer)
    const allow = result.permissions.allow as string[]
    expect(allow.filter((v: string) => v === 'Edit')).toHaveLength(1)
    expect(allow).toContain('Read')
    expect(allow).toContain('Bash(git *)')
  })

  test('scalar override', () => {
    const base = { model: 'sonnet' }
    const overlay = { model: 'opus' }
    const result = mergeWith({}, base, overlay, settingsMergeCustomizer)
    expect(result.model).toBe('opus')
  })

  test('overlay adds new keys without removing base keys', () => {
    const base = { model: 'sonnet', env: { A: '1' } }
    const overlay = { env: { B: '2' } }
    const result = mergeWith({}, base, overlay, settingsMergeCustomizer)
    expect(result.model).toBe('sonnet')
    expect(result.env.A).toBe('1')
    expect(result.env.B).toBe('2')
  })
})
