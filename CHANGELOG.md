# Changelog

All notable changes to xclaw will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## About xclaw

[xclaw](https://github.com/YuanyuanMa03/xclaw) is based on [Claude Code](https://github.com/anthropics/claude-code) by Anthropic.

This changelog tracks **xclaw-specific changes**. Upstream changes from Claude Code are tracked separately and displayed in the TUI with "(Claude Code upstream)" attribution.

---

## [1.0.1] - 2025-01-13

### Changed
- Bumped version to 1.0.1 for npm release

### Fixed
- Feedback links now correctly point to xclaw GitHub issues instead of claude-code
- "What's new" feed now shows "(Claude Code upstream)" attribution for upstream changes

---

## [1.0.0] - 2025-01-10

### Added
- **xclaw overlay settings system**: User-level settings now override built-in defaults
  - `~/.xclaw/settings.json` for user configurations
  - `XCLAW_CONFIG_DIR` environment variable for custom config directory
  - Dual-source markdown loading (project + xclaw user directories)
  - Name-based deduplication with xclaw sources taking priority

- **Cross-platform install scripts**: Improved installation experience for npm global install

- **Branding**: Published to npm as `xclaw-cli` package with xclaw branding

### Changed
- MCP Chrome Bridge package references updated for xclaw distribution

### Technical
- Settings loader now includes xclaw user directory in priority chain
- Settings detector watches xclaw user directories for changes
- Added integration tests for overlay merge functionality

---

## Upstream Tracking

xclaw stays updated with Claude Code upstream changes. To see the latest upstream updates:

1. Check the "What's new" section in the TUI (marked with "Claude Code upstream")
2. Visit [Claude Code's CHANGELOG.md](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
3. Use `/release-notes` command in xclaw for more details

---

[Unreleased]: https://github.com/YuanyuanMa03/xclaw/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/YuanyuanMa03/xclaw/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/YuanyuanMa03/xclaw/releases/tag/v1.0.0
