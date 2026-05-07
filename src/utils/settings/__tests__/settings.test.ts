import { describe, expect, test } from 'bun:test'
import {
  getSettingsFilePathForSource,
  getRelativeSettingsFilePathForSource,
} from '../settings'

describe('xclaw settings file paths', () => {
  test('getRelativeSettingsFilePathForSource returns xclaw project path', () => {
    expect(getRelativeSettingsFilePathForSource('xclawProjectSettings')).toBe(
      '.xclaw/settings.json',
    )
  })

  test('getRelativeSettingsFilePathForSource returns xclaw local path', () => {
    expect(getRelativeSettingsFilePathForSource('xclawLocalSettings')).toBe(
      '.xclaw/settings.local.json',
    )
  })

  test('getSettingsFilePathForSource returns xclaw user settings path', () => {
    const path = getSettingsFilePathForSource('xclawUserSettings')
    expect(path).toContain('.xclaw')
    expect(path).toContain('settings.json')
  })

  test('getSettingsFilePathForSource returns path for xclaw project settings', () => {
    const path = getSettingsFilePathForSource('xclawProjectSettings')
    expect(path).toContain('.xclaw')
    expect(path).toContain('settings.json')
  })

  test('getSettingsFilePathForSource returns path for xclaw local settings', () => {
    const path = getSettingsFilePathForSource('xclawLocalSettings')
    expect(path).toContain('.xclaw')
    expect(path).toContain('settings.local.json')
  })
})
