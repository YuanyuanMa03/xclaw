# xclaw Overlay Design Spec

## Overview

xclaw layers on top of Claude Code's configuration. When both `.claude/` and `.xclaw/` exist, xclaw reads Claude's config as the base and overlays xclaw-specific customizations on top. xclaw can also run standalone when no Claude Code config exists.

**Key principle**: xclaw is a delta layer, not a fork. Users put only their customizations in `.xclaw/`; everything else falls through to `.claude/`.

## Directory Structure

### Project Level

```
project/
  .claude/              ← Claude Code base (if exists)
    settings.json
    settings.local.json
    skills/
    commands/
    agents/
  .xclaw/               ← xclaw overlay (if exists)
    settings.json
    settings.local.json
    skills/
    commands/
    agents/
```

### User Level

```
~/.claude/              ← Claude Code global base
  settings.json
  skills/
  commands/
  agents/
~/.xclaw/               ← xclaw global overlay
  settings.json
  settings.local.json
  skills/
  commands/
  agents/
```

`~/.xclaw/` is for user-authored config only. Auth tokens, session data, analytics stay in `~/.claude/`.

## Design: Settings Overlay

### Priority Order (low to high)

```
userSettings            ~/.claude/settings.json
xclawUserSettings       ~/.xclaw/settings.json         NEW
projectSettings         .claude/settings.json
xclawProjectSettings    .xclaw/settings.json            NEW
localSettings           .claude/settings.local.json
xclawLocalSettings      .xclaw/settings.local.json      NEW
flagSettings            --settings CLI flag
policySettings          managed/remote settings
```

### Merge Strategy

Deep merge using existing `settingsMergeCustomizer`:
- Objects: merge field-by-field (xclaw fields override Claude fields, rest preserved)
- Arrays: concatenate + deduplicate
- Scalars: xclaw value wins

`.xclaw/settings.json` is a delta file. Example:

```json
// .claude/settings.json (base)
{ "permissions": { "allow": ["Read", "Edit"] }, "model": "sonnet" }

// .xclaw/settings.json (overlay)
{ "permissions": { "allow": ["Bash(git *)"] }, "model": "opus" }

// Merged result
{ "permissions": { "allow": ["Read", "Edit", "Bash(git *)"] }, "model": "opus" }
```

### Implementation Changes

- `src/utils/settings/constants.ts`: Add `xclawUserSettings`, `xclawProjectSettings`, `xclawLocalSettings` to `SETTING_SOURCES`; update display name functions
- `src/utils/settings/settings.ts`: `getRelativeSettingsFilePathForSource()` handles new sources with hardcoded `.xclaw` paths; `getSettingsForSourceUncached()` returns `{}` if `.xclaw/settings.json` doesn't exist (no error)
- No changes to `loadSettingsFromDisk()` — it iterates all enabled sources automatically

## Design: Skills / Commands / Agents Dual-Scan

### Scan Order

When both directories exist, scan in this order (later wins on collision):

```
managed (policy)
user    (~/.claude/{subdir}/)       Claude base
user    (~/.xclaw/{subdir}/)        xclaw overlay
project (.claude/{subdir}/)         Claude base (walk up to home)
project (.xclaw/{subdir}/)          xclaw overlay (walk up to home)
```

### Collision Resolution

Two-pass deduplication:
1. **Inode dedup** (existing): catches symlinks/hardlinks
2. **Name dedup** (new): same relative path (e.g. `foo/SKILL.md`) → keep `.xclaw/` version

Name dedup uses the path relative to the base directory. If `.claude/skills/foo/SKILL.md` and `.xclaw/skills/foo/SKILL.md` both exist, the `.xclaw/` version wins.

### Implementation Changes

- `src/utils/markdownConfigLoader.ts`:
  - `loadMarkdownFilesForSubdir()`: Add parallel load from `getXclawConfigHomeDir()/{subdir}` for user-level; add `.xclaw/` project dirs to scan list
  - `getProjectDirsUpToHome()`: At each directory level, check both `.claude/{subdir}` and `.xclaw/{subdir}`, push both if they exist
  - After existing inode dedup, add name-based dedup pass (xclaw wins)
- No changes to `getProjectDotDir()` — backward compatible

### File Change Monitoring

`src/utils/skills/skillChangeDetector.ts` `getWatchablePaths()`: Already uses `getProjectDotDir()` for project dirs. Add `getXclawConfigHomeDir()/skills` and `getXclawConfigHomeDir()/commands` to the watch list.

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Only `.claude/` exists | Identical to today, no overlay |
| Only `.xclaw/` exists | Works standalone, no dependency on Claude |
| Both exist | Overlay activates: xclaw merges on top of Claude |
| `.xclaw/` has empty `skills/` | Only Claude skills loaded |
| Same skill name in both | xclaw version wins |
| `.xclaw/settings.json` missing keys | Falls through to `.claude/` values |
| `~/.xclaw/` doesn't exist | Skip user-level xclaw overlay, use `~/.claude/` only |

## Testing Strategy

### Unit Tests: Settings Merge
- Temp dir with both `.claude/settings.json` and `.xclaw/settings.json`
- Verify deep merge: xclaw overrides matching fields, preserves others
- Verify array concat + dedupe for `allowedTools`
- Regression: only `.claude/` → identical behavior
- Standalone: only `.xclaw/` → works independently

### Unit Tests: Skills/Commands/Agents Dual-Scan
- Temp dir: `.claude/skills/foo/SKILL.md` + `.xclaw/skills/bar/SKILL.md` → both loaded
- Collision: `.claude/skills/foo/SKILL.md` + `.xclaw/skills/foo/SKILL.md` → xclaw wins
- Empty `.xclaw/skills/` → only Claude skills
- Standalone: only `.xclaw/skills/` → works independently

### Integration Tests
- Full overlay scenario: existing `.claude/` config + new `.xclaw/` layer
- Verify settings, skills, commands, agents all merge correctly
- Verify `skillChangeDetector` monitors `.xclaw/` directories
