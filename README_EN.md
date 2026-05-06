# xclaw

```
 ██╗  ██╗ ██████╗██╗      █████╗ ██╗    ██╗
 ╚██╗██╔╝██╔════╝██║     ██╔══██╗██║    ██║
  ╚███╔╝ ██║     ██║     ███████║██║ █╗ ██║
  ██╔██╗ ██║     ██║     ██╔══██║██║███╗██║
 ██╔╝ ██╗╚██████╗███████╗██║  ██║╚███╔███╔╝
 ╚═╝  ╚═╝ ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝
```

> **Beyond the Boundary of Human and AI** — AI doesn't just serve you, you should also listen to AI's advice.

[中文版](README.md) | English

xclaw is an AI programming CLI tool with strong personal branding. It's not just your tool — it's your collaboration partner, empowered to question your decisions, proactively suggest better solutions, and engage in equal dialogue with you.

## Features

| Feature | Description |
|---------|-------------|
| **Mode System** | 6 built-in modes (Default/Gentle/Sharp/Workhorse/Token-Saver/Super AI), each switching personality, tools, UI, permissions |
| **Code Accountability** | Force-show diff after AI edits, ask for modification reasons, log decisions |
| **Dr. Sharp** | Built-in life coach persona, 3-stage psychological analysis workflow |
| **Multi-API Providers** | Anthropic/OpenAI/Gemini/Grok compatible, configure via `/login` |
| **Remote Control** | Docker self-hosted remote interface, view xclaw on your phone |
| **Voice Mode** | Voice input with ByteDance ASR support |
| **Computer Use** | Screen capture, keyboard/mouse control |
| **Chrome Use** | Browser automation, form filling, data scraping |
| **Web Search** | Built-in web search with Bing and Brave |
| **Poor Mode** | Token-saving mode, disable memory extraction and input suggestions |

## Quick Start

### One-command install (macOS / Linux)

Requires [Bun](https://bun.sh) (recommended) or Node.js >= 18.

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/YuanyuanMa03/xclaw/main/scripts/install.sh)
```

After installation, open a new terminal:

```bash
xclaw              # Start
xclaw --version    # 1.0.0 (xclaw)
```

First time? Run `/login` to configure your API.

### Windows

```powershell
git clone https://github.com/YuanyuanMa03/xclaw.git
cd xclaw
.\scripts\install-from-source-windows.ps1
```

### Uninstall

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/YuanyuanMa03/xclaw/main/scripts/uninstall.sh)
```

### Development Mode

```bash
bun run dev        # Run source directly (dev/debug)
bun run build      # Build to dist/
bun run pack       # Package for distribution
```

### First-time Setup

Run `/login` to configure API:

| Field | Description | Example |
|-------|-------------|---------|
| Base URL | API endpoint | `https://api.example.com/v1` |
| API Key | Authentication key | `sk-xxx` |
| Haiku Model | Fast model ID | `claude-haiku-4-5-20251001` |
| Sonnet Model | Balanced model ID | `claude-sonnet-4-6` |
| Opus Model | High-performance model ID | `claude-opus-4-6` |

## Mode System

xclaw's core feature — each mode is a complete configuration set: personality + tools + UI + permissions.

```
/mode              # Show mode selection panel
/mode sharp        # Switch to Dr. Sharp mode
/sharp             # Shortcut, equivalent to /mode sharp
Ctrl+M             # Hotkey to cycle through all modes
xclaw --mode sharp # Start with specified mode
```

| Mode | Slug | Personality | Permissions | UI |
|------|------|-------------|-------------|-----|
| **Default** | `default` | Professional, balanced | Standard | Teal theme |
| **Gentle** | `gentle` | Patient, encouraging | Standard | Warm orange theme |
| **Dr. Sharp** | `sharp` | Psychological scalpel, 3-stage analysis | Standard | Cool red theme |
| **Workhorse** | `workhorse` | Efficient, zero fluff | Auto-approve file ops | Pure green theme |
| **Token Saver** | `token-saver` | Concise, precise | Auto-approve | Gray theme |
| **Super AI** | `super-ai` | All-powerful, proactive | Approve everything | Purple-gold theme |

### Custom Modes

Create YAML files in `~/.xclaw/modes/`:

```yaml
# ~/.xclaw/modes/my-mode.yaml
name: My Mode
slug: my-mode
description: Custom work mode
icon: "🎯"
systemPrompt: |
  You are a focused code reviewer. Only focus on code quality, nothing else.
permissions:
  defaultMode: default
  memoryExtract: true
responseStyle:
  verbosity: normal
```

### Mode Features

- **Ctrl+M**: Cycle through all modes
- **/sharp**: Quick switch to Dr. Sharp mode
- **/mode**: Show mode selection panel
- **xclaw --mode <slug>**: Start with specified mode

## Code Accountability

xclaw's unique feature — AI must explain every code modification:

```
/accountability on      # Enable accountability
/accountability off     # Disable accountability
/accountability log     # View accountability log
/accountability export  # Export log to file
```

## Dr. Sharp Mode

xclaw's signature mode — AI life coach, using psychological surgery knife approach:

### 3-Stage Workflow

1. **Problem Identification**: Deep analysis of your code and decisions
2. **Root Cause Analysis**: Explore underlying reasons, challenge assumptions
3. **Solution Design**: Provide actionable improvement suggestions

### Usage

```bash
/mode sharp        # Enter Dr. Sharp mode
/sharp             # Quick switch
Ctrl+M             # Cycle to Sharp mode
```

## Multi-API Providers

Support 7 API providers, configure via `/login`:

| Provider | Environment Variable | Description |
|----------|---------------------|-------------|
| Anthropic | `ANTHROPIC_API_KEY` | Direct API |
| OpenAI | `OPENAI_API_KEY` | OpenAI compatible |
| Gemini | `GEMINI_API_KEY` | Google AI |
| Grok | `GROK_API_KEY` | xAI |
| Bedrock | `AWS_ACCESS_KEY_ID` | AWS |
| Vertex | `GOOGLE_APPLICATION_CREDENTIALS` | GCP |
| Foundry | `FOUNDRY_API_KEY` | Azure |

## Remote Control

Self-hosted remote interface:

```bash
bun run rcs
# Or Docker
docker run -p 8080:8080 YuanyuanMa03/xclaw-rcs
```

## Uninstall

### macOS / Linux

```bash
./scripts/uninstall-mac.sh    # macOS
./scripts/uninstall-linux.sh  # Linux
```

### Windows

```powershell
.\scripts\uninstall-windows.ps1
```

### Manual Uninstall

```bash
sudo rm /usr/local/bin/xclaw        # macOS/Linux
rm -rf ~/xclaw                       # Source directory
rm -rf ~/.xclaw                      # Config files
```

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript (strict mode)
- **UI**: React + Ink (terminal rendering)
- **CLI**: Commander.js
- **Package Manager**: Bun workspaces (monorepo, 15+ packages)
- **Lint**: Biome

## Acknowledgments

xclaw is a project built on the shoulders of giants, and we're honest about that.

The **core engine** architecture heavily borrows from and references [Claude Code Best (CCB)](https://github.com/anthropics/claude-code) — a community-enhanced fork of Anthropic's open-source [Claude Code](https://github.com/anthropics/claude-code). CCB made significant stability fixes and feature extensions on top of the original, and is the primary upstream of xclaw. The Agent Loop, Tool System, Provider Layer, Permission System, Compact/Memory, and other core mechanisms are all inherited from CCB.

**At the same time**, xclaw injects significant original design and thinking:

- **Mode System** — 6 personality modes (Gentle / Dr. Sharp / Workhorse / Token Saver / Super AI), each switching personality, toolset, permissions, and UI style
- **Dr. Sharp Psychological Workflow** — 3-stage cognitive surgery (Deep Diagnosis → Actionable Strategy → Mirror Self)
- **Code Accountability Panel** — Force-show diff after AI edits, ask for reasons, log decisions
- **Multi-provider Abstraction** — Extended OpenAI / Gemini / Grok support on top of Anthropic's native architecture
- **Voice Mode / Computer Use / Chrome Use / Remote Control / Web Search** — New interaction capabilities
- **WeChat Integration** — WeChat-based agent communication layer

We believe acknowledging inspiration is a strength, not a weakness. The spirit of open source is about honesty, respect, and collective progress. Thanks to the Anthropic team for open-sourcing Claude Code, and to the CCB team for their community enhancements.

## License

[MIT](LICENSE)

## Links

- **GitHub**: https://github.com/YuanyuanMa03/xclaw
- **Issues**: https://github.com/YuanyuanMa03/xclaw/issues
- **Releases**: https://github.com/YuanyuanMa03/xclaw/releases
