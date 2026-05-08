# xclaw Overlay Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement xclaw overlay system — settings merge, skills/commands/agents dual-scan, user-level `~/.xclaw/` directory.

**Architecture:** Add xclaw settings sources to existing priority chain; extend `loadMarkdownFilesForSubdir` to scan `.xclaw/` alongside `.claude/`; name-based dedup with xclaw winning on collision.

**Tech Stack:** TypeScript, bun:test, lodash mergeWith, chokidar

**Spec:** `docs/superpowers/specs/2026-05-07-xclaw-overlay-design.md`

---

## Chunk 0: Prerequisites

### Task 0: Add XCLAW_CONFIG_DIR env var support and update external callers

**Files:**
- Modify: `src/utils/envUtils.ts`
- Modify: `src/utils/permissions/filesystem.ts`
- Modify: `src/utils/sandbox/sandbox-adapter.ts`

- [ ] **Step 1: Add XCLAW_CONFIG_DIR env var to getXclawConfigHomeDir**

In `src/utils/envUtils.ts`, update `getXclawConfigHomeDir`:

```typescript
export const getXclawConfigHomeDir = memoize(
  (): string => {
    return (
      process.env.XCLAW_CONFIG_DIR ?? join(homedir(), '.xclaw')
    ).normalize('NFC')
  },
  () => process.env.XCLAW_CONFIG_DIR,
)
```

This mirrors `getClaudeConfigHomeDir` which respects `CLAUDE_CONFIG_DIR`. Enables testability by allowing tests to override the xclaw config directory.

- [ ] **Step 2: Update filesystem.ts to handle xclaw sources**

In `src/utils/permissions/filesystem.ts`, find the switch on `SettingSource` (around line 756) and add xclaw cases:

```typescript
case 'xclawUserSettings':
case 'xclawProjectSettings':
case 'xclawLocalSettings':
  return getSettingsRootPathForSource(source)
```

- [ ] **Step 3: Update sandbox-adapter.ts to handle xclaw sources**

In `src/utils/sandbox/sandbox-adapter.ts`, find any switch on `SettingSource` and add xclaw cases:

```typescript
case 'xclawUserSettings':
case 'xclawProjectSettings':
case 'xclawLocalSettings':
  return getSettingsRootPathForSource(source)
```

- [ ] **Step 4: Commit**

```bash
git add src/utils/envUtils.ts src/utils/permissions/filesystem.ts src/utils/sandbox/sandbox-adapter.ts
git commit -m "feat: add XCLAW_CONFIG_DIR env var and update external callers for xclaw sources"
```

---

## Chunk 1: Settings Overlay

### Task 1: Add xclaw setting sources to constants

**Files:**
- Modify: `src/utils/settings/constants.ts`
- Test: `src/utils/settings/__tests__/config.test.ts`

- [ ] **Step 1: Write failing test for new setting sources**

```typescript
// Add to src/utils/settings/__tests__/config.test.ts

describe('xclaw setting sources', () => {
  test('SETTING_SOURCES includes xclaw sources in correct order', () => {
    const sources = Array.from(SETTING_SOURCES)
    const userIdx = sources.indexOf('userSettings')
    const xclawUserIdx = sources.indexOf('xclawUserSettings')
    const projIdx = sources.indexOf('projectSettings')
    const xclawProjIdx = sources.indexOf('xclawProjectSettings')
    const localIdx = sources.indexOf('localSettings')
    const xclawLocalIdx = sources.indexOf('xclawLocalSettings')

    // xclaw comes after its Claude counterpart
    expect(xclawUserIdx).toBeGreaterThan(userIdx)
    expect(xclawProjIdx).toBeGreaterThan(projIdx)
    expect(xclawLocalIdx).toBeGreaterThan(localIdx)
    // xclaw comes before the next Claude source
    expect(xclawUserIdx).toBeLessThan(projIdx)
    expect(xclawProjIdx).toBeLessThan(localIdx)
  })

  test('getSettingSourceName returns correct names for xclaw sources', () => {
    expect(getSettingSourceName('xclawUserSettings')).toBe('xclaw user')
    expect(getSettingSourceName('xclawProjectSettings')).toBe('xclaw project')
    expect(getSettingSourceName('xclawLocalSettings')).toBe('xclaw project, gitignored')
  })

  test('getSourceDisplayName returns correct names for xclaw sources', () => {
    expect(getSourceDisplayName('xclawUserSettings')).toBe('Xclaw User')
    expect(getSourceDisplayName('xclawProjectSettings')).toBe('Xclaw Project')
    expect(getSourceDisplayName('xclawLocalSettings')).toBe('Xclaw Local')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/utils/settings/__tests__/config.test.ts`
Expected: FAIL — `xclawUserSettings` not in SETTING_SOURCES

- [ ] **Step 3: Implement xclaw setting sources**

In `src/utils/settings/constants.ts`, update `SETTING_SOURCES`:

```typescript
export const SETTING_SOURCES = [
  'userSettings',
  'xclawUserSettings',      // NEW
  'projectSettings',
  'xclawProjectSettings',   // NEW
  'localSettings',
  'xclawLocalSettings',     // NEW
  'flagSettings',
  'policySettings',
] as const
```

Update `getSettingSourceName`:

```typescript
export function getSettingSourceName(source: SettingSource): string {
  switch (source) {
    case 'userSettings': return 'user'
    case 'xclawUserSettings': return 'xclaw user'
    case 'projectSettings': return 'project'
    case 'xclawProjectSettings': return 'xclaw project'
    case 'localSettings': return 'project, gitignored'
    case 'xclawLocalSettings': return 'xclaw project, gitignored'
    case 'flagSettings': return 'cli flag'
    case 'policySettings': return 'managed'
  }
}
```

Update `getSourceDisplayName`:

```typescript
export function getSourceDisplayName(source: SettingSource | 'plugin' | 'built-in'): string {
  switch (source) {
    case 'userSettings': return 'User'
    case 'xclawUserSettings': return 'Xclaw User'
    case 'projectSettings': return 'Project'
    case 'xclawProjectSettings': return 'Xclaw Project'
    case 'localSettings': return 'Local'
    case 'xclawLocalSettings': return 'Xclaw Local'
    case 'flagSettings': return 'Flag'
    case 'policySettings': return 'Managed'
    case 'plugin': return 'Plugin'
    case 'built-in': return 'Built-in'
  }
}
```

Update `getSettingSourceDisplayNameLowercase`:

```typescript
export function getSettingSourceDisplayNameLowercase(source: SettingSource | 'cliArg' | 'command' | 'session'): string {
  switch (source) {
    case 'userSettings': return 'user settings'
    case 'xclawUserSettings': return 'xclaw user settings'
    case 'projectSettings': return 'shared project settings'
    case 'xclawProjectSettings': return 'xclaw project settings'
    case 'localSettings': return 'project local settings'
    case 'xclawLocalSettings': return 'xclaw project local settings'
    case 'flagSettings': return 'command line arguments'
    case 'policySettings': return 'enterprise managed settings'
    case 'cliArg': return 'CLI argument'
    case 'command': return 'command configuration'
    case 'session': return 'current session'
  }
}
```

Update `getSettingSourceDisplayNameCapitalized`:

```typescript
export function getSettingSourceDisplayNameCapitalized(source: SettingSource | 'cliArg' | 'command' | 'session'): string {
  switch (source) {
    case 'userSettings': return 'User settings'
    case 'xclawUserSettings': return 'Xclaw user settings'
    case 'projectSettings': return 'Shared project settings'
    case 'xclawProjectSettings': return 'Xclaw project settings'
    case 'localSettings': return 'Project local settings'
    case 'xclawLocalSettings': return 'Xclaw project local settings'
    case 'flagSettings': return 'Command line arguments'
    case 'policySettings': return 'Enterprise managed settings'
    case 'cliArg': return 'CLI argument'
    case 'command': return 'Command configuration'
    case 'session': return 'Current session'
  }
}
```

Update `EditableSettingSource`:

```typescript
export type EditableSettingSource = Exclude<
  SettingSource,
  'policySettings' | 'flagSettings'
>
```

**Note on `SOURCES` and `parseSettingSourcesFlag`:** xclaw sources are auto-detected (file exists → enable), not CLI-specified. `SOURCES` (used by permission-rule UI) stays unchanged — xclaw settings are editable through the same UI as project settings. `parseSettingSourcesFlag` stays unchanged — `--setting-sources` flag only controls Claude sources. This is intentional; xclaw overlay activates automatically.

Also update the existing test at `src/utils/settings/__tests__/config.test.ts` that asserts exact 5-element array:

```typescript
// Update this existing test (around line 272):
test('contains all sources in order', () => {
  expect(SETTING_SOURCES).toEqual([
    'userSettings', 'xclawUserSettings', 'projectSettings', 'xclawProjectSettings',
    'localSettings', 'xclawLocalSettings', 'flagSettings', 'policySettings',
  ])
})
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/utils/settings/__tests__/config.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/settings/constants.ts src/utils/settings/__tests__/config.test.ts
git commit -m "feat(settings): add xclaw setting sources to priority chain"
```

---

### Task 2: Wire xclaw settings file paths

**Files:**
- Modify: `src/utils/settings/settings.ts`
- Create: `src/utils/settings/__tests__/settings.test.ts`

- [ ] **Step 1: Create test file and write failing test for xclaw settings file paths**

```typescript
// Create src/utils/settings/__tests__/settings.test.ts

import { describe, expect, test, beforeEach } from 'bun:test'
import { getSettingsFilePathForSource, getRelativeSettingsFilePathForSource } from '../settings'

describe('xclaw settings file paths', () => {
  test('getRelativeSettingsFilePathForSource returns xclaw paths', () => {
    expect(getRelativeSettingsFilePathForSource('xclawProjectSettings')).toBe('.xclaw/settings.json')
    expect(getRelativeSettingsFilePathForSource('xclawLocalSettings')).toBe('.xclaw/settings.local.json')
  })

  test('getSettingsFilePathForSource returns xclaw user settings path', () => {
    const path = getSettingsFilePathForSource('xclawUserSettings')
    expect(path).toContain('.xclaw')
    expect(path).toContain('settings.json')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/utils/settings/__tests__/settings.test.ts`
Expected: FAIL — `xclawProjectSettings` not handled in switch

- [ ] **Step 3: Implement xclaw settings file path resolution**

In `src/utils/settings/settings.ts`, update `getRelativeSettingsFilePathForSource`:

```typescript
export function getRelativeSettingsFilePathForSource(
  source: 'projectSettings' | 'localSettings' | 'xclawProjectSettings' | 'xclawLocalSettings',
): string {
  switch (source) {
    case 'projectSettings':
      return join(getProjectDotDir(getOriginalCwd()), 'settings.json')
    case 'localSettings':
      return join(getProjectDotDir(getOriginalCwd()), 'settings.local.json')
    case 'xclawProjectSettings':
      return join('.xclaw', 'settings.json')
    case 'xclawLocalSettings':
      return join('.xclaw', 'settings.local.json')
  }
}
```

Update `getSettingsFilePathForSource` to handle xclaw sources:

```typescript
export function getSettingsFilePathForSource(source: SettingSource): string | undefined {
  switch (source) {
    case 'userSettings':
      return join(getSettingsRootPathForSource(source), getUserSettingsFilePath())
    case 'xclawUserSettings':
      return join(getXclawConfigHomeDir(), 'settings.json')
    case 'projectSettings':
    case 'localSettings':
    case 'xclawProjectSettings':
    case 'xclawLocalSettings':
      return join(getSettingsRootPathForSource(source), getRelativeSettingsFilePathForSource(source))
    case 'policySettings':
      return getManagedSettingsFilePath()
    case 'flagSettings':
      return getFlagSettingsPath()
  }
}
```

Update `getSettingsRootPathForSource` to handle xclaw sources:

```typescript
export function getSettingsRootPathForSource(source: SettingSource): string {
  switch (source) {
    case 'userSettings':
      return resolve(getClaudeConfigHomeDir())
    case 'xclawUserSettings':
      return resolve(getXclawConfigHomeDir())
    case 'policySettings':
    case 'projectSettings':
    case 'localSettings':
    case 'xclawProjectSettings':
    case 'xclawLocalSettings': {
      return resolve(getOriginalCwd())
    }
    case 'flagSettings': {
      const path = getFlagSettingsPath()
      return path ? dirname(resolve(path)) : resolve(getOriginalCwd())
    }
  }
}
```

**Note:** `policySettings` is grouped with project/local sources (all use `getOriginalCwd()`). The existing behavior is preserved exactly — only new xclaw cases are added.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/utils/settings/__tests__/settings.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/settings/settings.ts src/utils/settings/__tests__/settings.test.ts
git commit -m "feat(settings): wire xclaw settings file paths"
```

---

### Task 3: Test settings deep merge with xclaw overlay

**Files:**
- Test: `src/utils/settings/__tests__/overlay.test.ts` (create)

- [ ] **Step 1: Write integration test for settings merge**

```typescript
// Create src/utils/settings/__tests__/overlay.test.ts

import { describe, expect, test, beforeEach, afterEach } from 'bun:test'
import { mkdtempSync, writeFileSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
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
```

- [ ] **Step 2: Run test to verify it passes**

Run: `bun test src/utils/settings/__tests__/overlay.test.ts`
Expected: PASS (merge logic already exists, we're testing it works for overlay scenarios)

- [ ] **Step 3: Commit**

```bash
git add src/utils/settings/__tests__/overlay.test.ts
git commit -m "test(settings): add overlay merge tests"
```

---

## Chunk 2: Skills / Commands / Agents Dual-Scan

### Task 4: Extend getProjectDirsUpToHome to scan .xclaw/

**Files:**
- Modify: `src/utils/markdownConfigLoader.ts`
- Test: `src/utils/__tests__/markdown.test.ts`

- [ ] **Step 1: Write failing test for dual-scan**

```typescript
// Add to src/utils/__tests__/markdown.test.ts

import { describe, expect, test, beforeEach, afterEach } from 'bun:test'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { getProjectDirsUpToHome } from '../markdownConfigLoader'

describe('getProjectDirsUpToHome with xclaw overlay', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'xclaw-test-'))
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
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/utils/__tests__/markdown.test.ts`
Expected: FAIL — only `.claude` dir returned when both exist

- [ ] **Step 3: Implement dual-scan in getProjectDirsUpToHome**

In `src/utils/markdownConfigLoader.ts`, update `getProjectDirsUpToHome`:

```typescript
export function getProjectDirsUpToHome(
  subdir: ClaudeConfigDirectory,
  cwd: string,
): string[] {
  const home = resolve(homedir()).normalize('NFC')
  const gitRoot = resolveStopBoundary(cwd)
  let current = resolve(cwd)
  const dirs: string[] = []

  while (true) {
    if (normalizePathForComparison(current) === normalizePathForComparison(home)) {
      break
    }

    // Check .claude/ (or .xclaw/ via getProjectDotDir)
    const claudeSubdir = join(current, getProjectDotDir(current), subdir)
    try {
      statSync(claudeSubdir)
      dirs.push(claudeSubdir)
    } catch (e: unknown) {
      if (!isFsInaccessible(e)) throw e
    }

    // Also check the OTHER dot dir (overlay)
    const otherDotDir = getProjectDotDir(current) === '.claude' ? '.xclaw' : '.claude'
    const otherSubdir = join(current, otherDotDir, subdir)
    if (otherSubdir !== claudeSubdir) {
      try {
        statSync(otherSubdir)
        dirs.push(otherSubdir)
      } catch (e: unknown) {
        if (!isFsInaccessible(e)) throw e
      }
    }

    if (gitRoot && normalizePathForComparison(current) === normalizePathForComparison(gitRoot)) {
      break
    }

    const parent = dirname(current)
    if (parent === current) break
    current = parent
  }

  return dirs
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/utils/__tests__/markdown.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/markdownConfigLoader.ts src/utils/__tests__/markdown.test.ts
git commit -m "feat(loader): extend getProjectDirsUpToHome for .xclaw/ overlay"
```

---

### Task 5: Add user-level xclaw dir to loadMarkdownFilesForSubdir

**Files:**
- Modify: `src/utils/markdownConfigLoader.ts`

- [ ] **Step 1: Write failing test for user-level xclaw loading**

```typescript
// Add to src/utils/__tests__/markdown.test.ts

describe('loadMarkdownFilesForSubdir user-level xclaw', () => {
  let tmpDir: string
  let origClaudeConfigDir: string | undefined
  let origXclawConfigDir: string | undefined

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'xclaw-user-test-'))
    origClaudeConfigDir = process.env.CLAUDE_CONFIG_DIR
    origXclawConfigDir = process.env.XCLAW_CONFIG_DIR
    process.env.CLAUDE_CONFIG_DIR = join(tmpDir, '.claude')
    process.env.XCLAW_CONFIG_DIR = join(tmpDir, '.xclaw')
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
    rmSync(tmpDir, { recursive: true, force: true })
  })

  test('loads skills from both user-level directories', async () => {
    writeFileSync(join(tmpDir, '.claude', 'skills', 'claude-user.md'), 'Claude user skill')
    writeFileSync(join(tmpDir, '.xclaw', 'skills', 'xclaw-user.md'), 'Xclaw user skill')

    const files = await loadMarkdownFilesForSubdir('skills', tmpDir)
    const filePaths = files.map(f => f.filePath)
    expect(filePaths.some(p => p.includes('claude-user.md'))).toBe(true)
    expect(filePaths.some(p => p.includes('xclaw-user.md'))).toBe(true)
  })
})
```

- [ ] **Step 2: Implement user-level xclaw loading**

In `src/utils/markdownConfigLoader.ts`, update `loadMarkdownFilesForSubdir`. Find the `Promise.all` block (around line 337) and add xclaw user dir loading:

```typescript
const userDir = join(getClaudeConfigHomeDir(), subdir)
const xclawUserDir = join(getXclawConfigHomeDir(), subdir)

const [managedFiles, userFiles, xclawUserFiles, projectFilesNested] = await Promise.all([
  // Always load managed (policy settings)
  loadMarkdownFiles(managedDir).then(_ =>
    _.map(file => ({
      ...file,
      baseDir: managedDir,
      source: 'policySettings' as const,
    })),
  ),
  // Conditionally load user files
  isSettingSourceEnabled('userSettings') &&
  !(subdir === 'agents' && isRestrictedToPluginOnly('agents'))
    ? loadMarkdownFiles(userDir).then(_ =>
        _.map(file => ({
          ...file,
          baseDir: userDir,
          source: 'userSettings' as const,
        })),
      )
    : Promise.resolve([]),
  // xclaw user files
  isSettingSourceEnabled('userSettings')
    ? loadMarkdownFiles(xclawUserDir).then(_ =>
        _.map(file => ({
          ...file,
          baseDir: xclawUserDir,
          source: 'xclawUserSettings' as const,
        })),
      ).catch(() => []) // xclaw dir may not exist
    : Promise.resolve([]),
  // Conditionally load project files from all directories up to home
  isSettingSourceEnabled('projectSettings') &&
  !(subdir === 'agents' && isRestrictedToPluginOnly('agents'))
    ? Promise.all(
        projectDirs.map(projectDir =>
          loadMarkdownFiles(projectDir).then(_ =>
            _.map(file => ({
              ...file,
              baseDir: projectDir,
              source: 'projectSettings' as const,
            })),
          ),
        ),
      )
    : Promise.resolve([]),
])

const projectFiles = projectFilesNested.flat()
const allFiles = [...managedFiles, ...userFiles, ...xclawUserFiles, ...projectFiles]
```

- [ ] **Step 3: Run test to verify it passes**

Run: `bun test src/utils/__tests__/markdown.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/utils/markdownConfigLoader.ts
git commit -m "feat(loader): add user-level xclaw dir to markdown loader"
```

---

### Task 6: Add name-based dedup (xclaw wins)

**Files:**
- Modify: `src/utils/markdownConfigLoader.ts`
- Test: `src/utils/__tests__/markdown.test.ts`

- [ ] **Step 1: Write failing test for name-based dedup**

```typescript
// Add to src/utils/__tests__/markdown.test.ts

describe('name-based deduplication', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'xclaw-test-'))
  })

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true })
  })

  test('xclaw skill overrides claude skill with same name', async () => {
    // Create .claude/skills/foo/SKILL.md
    mkdirSync(join(tmpDir, '.claude', 'skills', 'foo'), { recursive: true })
    writeFileSync(join(tmpDir, '.claude', 'skills', 'foo', 'SKILL.md'), '---\nname: foo\n---\nClaude version')

    // Create .xclaw/skills/foo/SKILL.md
    mkdirSync(join(tmpDir, '.xclaw', 'skills', 'foo'), { recursive: true })
    writeFileSync(join(tmpDir, '.xclaw', 'skills', 'foo', 'SKILL.md'), '---\nname: foo\n---\nXclaw version')

    const files = await loadMarkdownFilesForSubdir('skills', tmpDir)
    const fooFiles = files.filter(f => f.filePath.includes('foo'))
    expect(fooFiles).toHaveLength(1)
    expect(fooFiles[0].content).toContain('Xclaw version')
  })

  test('both skills loaded when names differ', async () => {
    mkdirSync(join(tmpDir, '.claude', 'skills', 'alpha'), { recursive: true })
    writeFileSync(join(tmpDir, '.claude', 'skills', 'alpha', 'SKILL.md'), '---\nname: alpha\n---\nAlpha')

    mkdirSync(join(tmpDir, '.xclaw', 'skills', 'beta'), { recursive: true })
    writeFileSync(join(tmpDir, '.xclaw', 'skills', 'beta', 'SKILL.md'), '---\nname: beta\n---\nBeta')

    const files = await loadMarkdownFilesForSubdir('skills', tmpDir)
    const names = files.map(f => f.frontmatter.name)
    expect(names).toContain('alpha')
    expect(names).toContain('beta')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/utils/__tests__/markdown.test.ts`
Expected: FAIL — both foo files returned instead of just xclaw

- [ ] **Step 3: Implement name-based dedup**

In `src/utils/markdownConfigLoader.ts`, after the existing inode dedup, add name-based dedup:

```typescript
// After existing inode dedup (around line 407), add:

// Name-based dedup: when same relative path exists in both .claude/ and .xclaw/,
// keep the .xclaw/ version (xclaw wins on collision).
const nameSeen = new Map<string, number>() // relativePath -> index in deduplicatedFiles
const nameDedupedFiles: MarkdownFile[] = []

for (const [i, file] of deduplicatedFiles.entries()) {
  // Compute relative path from baseDir (e.g. "foo/SKILL.md")
  const relativePath = file.filePath.slice(file.baseDir.length).replace(/^\//, '')
  const existingIdx = nameSeen.get(relativePath)

  if (existingIdx !== undefined) {
    const existing = nameDedupedFiles[existingIdx]
    // If current file is from .xclaw and existing is from .claude, replace
    if (file.baseDir.includes('.xclaw') && existing && !existing.baseDir.includes('.xclaw')) {
      nameDedupedFiles[existingIdx] = file
      logForDebugging(`Name dedup: .xclaw '${relativePath}' overrides .claude version`)
    }
    // Otherwise skip (existing wins)
    continue
  }

  nameSeen.set(relativePath, nameDedupedFiles.length)
  nameDedupedFiles.push(file)
}

return nameDedupedFiles
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/utils/__tests__/markdown.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/markdownConfigLoader.ts src/utils/__tests__/markdown.test.ts
git commit -m "feat(loader): add name-based dedup with xclaw winning on collision"
```

---

## Chunk 3: File Monitoring & Integration

### Task 7: Watch xclaw directories for changes

**Files:**
- Modify: `src/utils/skills/skillChangeDetector.ts`
- Test: `src/utils/skills/__tests__/skillChangeDetector.test.ts`

- [ ] **Step 1: Write failing test for xclaw watch paths**

```typescript
// Add to src/utils/skills/__tests__/skillChangeDetector.test.ts

import { describe, expect, test, beforeEach, afterEach } from 'bun:test'
import { mkdtempSync, mkdirSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { getWatchablePaths } from '../skillChangeDetector'

describe('skillChangeDetector xclaw support', () => {
  let tmpDir: string
  let origClaudeConfigDir: string | undefined
  let origXclawConfigDir: string | undefined

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'xclaw-watch-test-'))
    origClaudeConfigDir = process.env.CLAUDE_CONFIG_DIR
    origXclawConfigDir = process.env.XCLAW_CONFIG_DIR
    process.env.CLAUDE_CONFIG_DIR = join(tmpDir, '.claude')
    process.env.XCLAW_CONFIG_DIR = join(tmpDir, '.xclaw')
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
    rmSync(tmpDir, { recursive: true, force: true })
  })

  test('getWatchablePaths includes xclaw user skills dir when it exists', async () => {
    mkdirSync(join(tmpDir, '.xclaw', 'skills'), { recursive: true })
    const paths = await getWatchablePaths()
    expect(paths.some(p => p.includes('.xclaw') && p.includes('skills'))).toBe(true)
  })

  test('getWatchablePaths skips xclaw user skills dir when it does not exist', async () => {
    // No .xclaw dir created
    const paths = await getWatchablePaths()
    expect(paths.some(p => p.includes('.xclaw') && p.includes('skills'))).toBe(false)
  })
})
```

- [ ] **Step 2: Implement xclaw watch paths**

In `src/utils/skills/skillChangeDetector.ts`, update `getWatchablePaths`:

```typescript
async function getWatchablePaths(): Promise<string[]> {
  const fs = getFsImplementation()
  const paths: string[] = []

  // User skills directory (~/.claude/skills)
  const userSkillsPath = getSkillsPath('userSettings', 'skills')
  if (userSkillsPath) {
    try {
      await fs.stat(userSkillsPath)
      paths.push(userSkillsPath)
    } catch {
      // Path doesn't exist, skip it
    }
  }

  // xclaw user skills directory (~/.xclaw/skills)
  const xclawUserSkillsPath = join(getXclawConfigHomeDir(), 'skills')
  try {
    await fs.stat(xclawUserSkillsPath)
    paths.push(xclawUserSkillsPath)
  } catch {
    // Path doesn't exist, skip it
  }

  // User commands directory (~/.claude/commands)
  const userCommandsPath = getSkillsPath('userSettings', 'commands')
  if (userCommandsPath) {
    try {
      await fs.stat(userCommandsPath)
      paths.push(userCommandsPath)
    } catch {
      // Path doesn't exist, skip it
    }
  }

  // xclaw user commands directory (~/.xclaw/commands)
  const xclawUserCommandsPath = join(getXclawConfigHomeDir(), 'commands')
  try {
    await fs.stat(xclawUserCommandsPath)
    paths.push(xclawUserCommandsPath)
  } catch {
    // Path doesn't exist, skip it
  }

  // ... rest of function (project skills/commands with getProjectDotDir) stays the same
  // ...

  return paths
}
```

- [ ] **Step 3: Run test to verify it passes**

Run: `bun test src/utils/skills/__tests__/skillChangeDetector.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/utils/skills/skillChangeDetector.ts
git commit -m "feat(detector): watch xclaw user directories for changes"
```

---

### Task 8: End-to-end integration test

**Files:**
- Test: `src/__tests__/overlay-integration.test.ts` (create)

- [ ] **Step 1: Write integration test**

```typescript
// Create src/__tests__/overlay-integration.test.ts

import { describe, expect, test, beforeEach, afterEach } from 'bun:test'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

describe('xclaw overlay integration', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'xclaw-integration-'))
  })

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true })
  })

  test('settings merge: xclaw overlays on claude', async () => {
    mkdirSync(join(tmpDir, '.claude'))
    writeFileSync(join(tmpDir, '.claude', 'settings.json'), JSON.stringify({
      model: 'sonnet',
      permissions: { allow: ['Read'] },
    }))
    mkdirSync(join(tmpDir, '.xclaw'))
    writeFileSync(join(tmpDir, '.xclaw', 'settings.json'), JSON.stringify({
      model: 'opus',
      permissions: { allow: ['Bash(git *)'] },
    }))

    // Test merge logic directly using settingsMergeCustomizer
    const { settingsMergeCustomizer } = await import('../../utils/settings/settings')
    const mergeWith = (await import('lodash-es/mergeWith.js')).default
    const base = JSON.parse(await import('fs').then(fs => fs.readFileSync(join(tmpDir, '.claude', 'settings.json'), 'utf-8')))
    const overlay = JSON.parse(await import('fs').then(fs => fs.readFileSync(join(tmpDir, '.xclaw', 'settings.json'), 'utf-8')))
    const result = mergeWith({}, base, overlay, settingsMergeCustomizer)
    expect(result.model).toBe('opus')
    expect(result.permissions.allow).toContain('Read')
    expect(result.permissions.allow).toContain('Bash(git *)')
  })

  test('skills dual-scan: loads from both directories', async () => {
    mkdirSync(join(tmpDir, '.claude', 'skills', 'claude-skill'), { recursive: true })
    writeFileSync(join(tmpDir, '.claude', 'skills', 'claude-skill', 'SKILL.md'),
      '---\nname: claude-skill\n---\nClaude skill')

    mkdirSync(join(tmpDir, '.xclaw', 'skills', 'xclaw-skill'), { recursive: true })
    writeFileSync(join(tmpDir, '.xclaw', 'skills', 'xclaw-skill', 'SKILL.md'),
      '---\nname: xclaw-skill\n---\nXclaw skill')

    const { loadMarkdownFilesForSubdir } = await import('../../utils/markdownConfigLoader')
    const files = await loadMarkdownFilesForSubdir('skills', tmpDir)
    const names = files.map(f => f.frontmatter.name)
    expect(names).toContain('claude-skill')
    expect(names).toContain('xclaw-skill')
  })

  test('standalone: only .xclaw works without .claude', async () => {
    mkdirSync(join(tmpDir, '.xclaw', 'skills', 'standalone-skill'), { recursive: true })
    writeFileSync(join(tmpDir, '.xclaw', 'skills', 'standalone-skill', 'SKILL.md'),
      '---\nname: standalone\n---\nStandalone skill')

    const { loadMarkdownFilesForSubdir } = await import('../../utils/markdownConfigLoader')
    const files = await loadMarkdownFilesForSubdir('skills', tmpDir)
    const names = files.map(f => f.frontmatter.name)
    expect(names).toContain('standalone')
  })
})
```

- [ ] **Step 2: Run test to verify it passes**

Run: `bun test src/__tests__/overlay-integration.test.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/overlay-integration.test.ts
git commit -m "test: add xclaw overlay integration tests"
```

---

### Task 9: Final commit and verification

- [ ] **Step 1: Run full test suite**

Run: `bun test`
Expected: All tests pass, no regressions

- [ ] **Step 2: Verify TypeScript compilation**

Run: `bun run typecheck`
Expected: No type errors

- [ ] **Step 3: Final commit if needed**

```bash
git add -A
git commit -m "feat: complete xclaw overlay system"
```
