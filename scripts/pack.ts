#!/usr/bin/env bun
import { $ } from 'bun'
import { join } from 'path'

const ROOT = join(import.meta.dir, '..')
const DIST = join(ROOT, 'dist')
const VERSION = '1.0.0'
const NAME = `xclaw-${VERSION}`

async function main() {
  console.log('📦 Packing xclaw distribution...')

  // Ensure dist exists
  await $`ls ${DIST}/cli.js`.quiet()

  // Create temp directory for packaging
  const tmpDir = `/tmp/${NAME}`
  await $`rm -rf ${tmpDir}`.quiet()
  await $`mkdir -p ${tmpDir}/dist`

  // Copy dist files
  console.log('  Copying dist/...')
  await $`cp -R ${DIST}/* ${tmpDir}/dist/`

  // Copy package.json (for bin entry)
  await $`cp ${ROOT}/package.json ${tmpDir}/`

  // macOS install script
  const macScript = `#!/bin/bash
set -e

echo ""
echo " ██╗  ██╗ ██████╗██╗      █████╗ ██╗    ██╗"
echo " ╚██╗██╔╝██╔════╝██║     ██╔══██╗██║    ██║"
echo "  ╚███╔╝ ██║     ██║     ███████║██║ █╗ ██║"
echo "  ██╔██╗ ██║     ██║     ██╔══██║██║███╗██║"
echo " ██╔╝ ██╗╚██████╗███████╗██║  ██║╚███╔███╔╝"
echo " ╚═╝  ╚═╝ ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝"
echo ""
echo "  超越人类与 AI 的边界"
echo ""

# Check for node
if ! command -v node &> /dev/null; then
  echo "❌ 需要 Node.js"
  echo "   安装方式: brew install node"
  echo "   或访问: https://nodejs.org"
  exit 1
fi

NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo "❌ Node.js 版本过低 (需要 >= 18, 当前: $(node -v))"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INSTALL_DIR="/usr/local/bin"

echo "📁 安装目录: $INSTALL_DIR"
echo ""

# Create symlink
ln -sf "$SCRIPT_DIR/dist/cli-node.js" "$INSTALL_DIR/xclaw"
chmod +x "$INSTALL_DIR/xclaw"

echo "✅ xclaw ${VERSION} 安装成功!"
echo ""
echo "🚀 开始使用:"
echo "   xclaw              # 启动"
echo "   xclaw --version    # 查看版本"
echo ""
echo "📝 首次配置:"
echo "   启动后输入 /login 配置 API"
echo ""
`

  // Linux install script
  const linuxScript = `#!/bin/bash
set -e

echo ""
echo " ██╗  ██╗ ██████╗██╗      █████╗ ██╗    ██╗"
echo " ╚██╗██╔╝██╔════╝██║     ██╔══██╗██║    ██║"
echo "  ╚███╔╝ ██║     ██║     ███████║██║ █╗ ██║"
echo "  ██╔██╗ ██║     ██║     ██╔══██║██║███╗██║"
echo " ██╔╝ ██╗╚██████╗███████╗██║  ██║╚███╔███╔╝"
echo " ╚═╝  ╚═╝ ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝"
echo ""
echo "  超越人类与 AI 的边界"
echo ""

# Check for node
if ! command -v node &> /dev/null; then
  echo "❌ 需要 Node.js"
  echo "   Ubuntu/Debian: sudo apt install nodejs"
  echo "   Fedora: sudo dnf install nodejs"
  echo "   或访问: https://nodejs.org"
  exit 1
fi

NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo "❌ Node.js 版本过低 (需要 >= 18, 当前: $(node -v))"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Try /usr/local/bin, fallback to ~/.local/bin
if [ -w "/usr/local/bin" ]; then
  INSTALL_DIR="/usr/local/bin"
else
  INSTALL_DIR="$HOME/.local/bin"
  mkdir -p "$INSTALL_DIR"
  echo "⚠️  /usr/local/bin 无写入权限，安装到 $INSTALL_DIR"
  echo "   请确保 $INSTALL_DIR 在 PATH 中"
fi

echo "📁 安装目录: $INSTALL_DIR"
echo ""

# Create symlink
ln -sf "$SCRIPT_DIR/dist/cli-node.js" "$INSTALL_DIR/xclaw"
chmod +x "$INSTALL_DIR/xclaw"

echo "✅ xclaw ${VERSION} 安装成功!"
echo ""
echo "🚀 开始使用:"
echo "   xclaw              # 启动"
echo "   xclaw --version    # 查看版本"
echo ""
echo "📝 首次配置:"
echo "   启动后输入 /login 配置 API"
echo ""
`

  // Windows install script (PowerShell)
  const winScript = `# xclaw Windows Installer
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host " ██╗  ██╗ ██████╗██╗      █████╗ ██╗    ██╗"
Write-Host " ╚██╗██╔╝██╔════╝██║     ██╔══██╗██║    ██║"
Write-Host "  ╚███╔╝ ██║     ██║     ███████║██║ █╗ ██║"
Write-Host "  ██╔██╗ ██║     ██║     ██╔══██║██║███╗██║"
Write-Host " ██╔╝ ██╗╚██████╗███████╗██║  ██║╚███╔███╔╝"
Write-Host " ╚═╝  ╚═╝ ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝"
Write-Host ""
Write-Host "  超越人类与 AI 的边界"
Write-Host ""

# Check for node
try {
    $nodeVer = node -v
    $major = [int]($nodeVer -replace 'v(\\d+).*', '$1')
    if ($major -lt 18) {
        Write-Host "❌ Node.js 版本过低 (需要 >= 18, 当前: $nodeVer)"
        exit 1
    }
} catch {
    Write-Host "❌ 需要 Node.js"
    Write-Host "   下载: https://nodejs.org"
    Write-Host "   或运行: winget install OpenJS.NodeJS.LTS"
    exit 1
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$installDir = "$env:LOCALAPPDATA\\xclaw"

# Create install directory
if (!(Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
}

# Copy files
Write-Host "📁 安装目录: $installDir"
Write-Host ""

# Create batch wrapper
$batchContent = @"@echo off
node "$scriptDir\\dist\\cli-node.js" %*
"@
Set-Content -Path "$installDir\\xclaw.cmd" -Value $batchContent

# Add to PATH if not already there
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$installDir*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$installDir", "User")
    $env:Path = "$env:Path;$installDir"
    Write-Host "✅ 已添加到 PATH（重启终端生效）"
}

Write-Host ""
Write-Host "✅ xclaw ${VERSION} 安装成功!"
Write-Host ""
Write-Host "🚀 开始使用:"
Write-Host "   xclaw              # 启动"
Write-Host "   xclaw --version    # 查看版本"
Write-Host ""
Write-Host "📝 首次配置:"
Write-Host "   启动后输入 /login 配置 API"
Write-Host ""
`

  // Copy source install scripts
  await $`cp ${ROOT}/scripts/install-from-source-mac.sh ${tmpDir}/`.quiet()
  await $`cp ${ROOT}/scripts/install-from-source-linux.sh ${tmpDir}/`.quiet()
  await $`cp ${ROOT}/scripts/install-from-source-windows.ps1 ${tmpDir}/`.quiet()

  // Write install scripts
  await Bun.write(join(tmpDir, 'install-mac.sh'), macScript)
  await Bun.write(join(tmpDir, 'install-linux.sh'), linuxScript)
  await Bun.write(join(tmpDir, 'install-windows.ps1'), winScript)
  await $`chmod +x ${tmpDir}/install-mac.sh ${tmpDir}/install-linux.sh ${tmpDir}/install-from-source-mac.sh ${tmpDir}/install-from-source-linux.sh`

  // Create README
  const readme = `# xclaw ${VERSION}

> 超越人类与 AI 的边界

## 快速安装（预编译包）

### macOS

\`\`\`bash
tar xzf ${NAME}.tar.gz
cd ${NAME}
./install-mac.sh
\`\`\`

### Linux

\`\`\`bash
tar xzf ${NAME}.tar.gz
cd ${NAME}
./install-linux.sh
\`\`\`

### Windows

\`\`\`powershell
# 解压后运行
.\\install-windows.ps1
\`\`\`

如果遇到权限问题:
\`\`\`powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
.\\install-windows.ps1
\`\`\`

---

## 从源码安装（开发者）

如果你想从源码安装（方便更新和调试）：

### macOS

\`\`\`bash
# 一键安装
curl -fsSL https://raw.githubusercontent.com/YuanyuanMa03/xclaw/main/scripts/install-from-source-mac.sh | bash

# 或手动安装
git clone https://github.com/YuanyuanMa03/xclaw.git
cd xclaw
./scripts/install-from-source-mac.sh
\`\`\`

### Linux

\`\`\`bash
# 一键安装
curl -fsSL https://raw.githubusercontent.com/YuanyuanMa03/xclaw/main/scripts/install-from-source-linux.sh | bash

# 或手动安装
git clone https://github.com/YuanyuanMa03/xclaw.git
cd xclaw
./scripts/install-from-source-linux.sh
\`\`\`

### Windows

\`\`\`powershell
# 克隆仓库
git clone https://github.com/YuanyuanMa03/xclaw.git
cd xclaw

# 运行安装脚本
.\\scripts\\install-from-source-windows.ps1
\`\`\`

### 手动安装（任意平台）

\`\`\`bash
# 1. 克隆仓库
git clone https://github.com/YuanyuanMa03/xclaw.git
cd xclaw

# 2. 安装依赖（需要 Bun 或 Node.js）
bun install    # 或 npm install

# 3. 构建
bun run build  # 或 node build.ts

# 4. 全局链接
bun link       # 或 npm link
\`\`\`

---

## 使用

\`\`\`bash
xclaw              # 启动
xclaw --version    # 查看版本
xclaw --help       # 查看帮助
\`\`\`

## 首次配置

启动后输入 \`/login\` 配置 API:

| 字段 | 说明 |
|------|------|
| Base URL | API 地址 |
| API Key | 密钥 |
| Model | 模型 ID |

## 系统要求

- **Node.js** >= 18 或 **Bun** >= 1.3
- **终端** 支持 ANSI 颜色
- **操作系统** macOS / Linux / Windows

## 更新

### 预编译包安装的用户
下载新版本，重新运行安装脚本即可。

### 源码安装的用户
\`\`\`bash
cd xclaw
git pull
bun install && bun run build  # 或 npm install && node build.ts
\`\`\`

## 更多信息

- GitHub: https://github.com/YuanyuanMa03/xclaw
`

  await Bun.write(join(tmpDir, 'README.md'), readme)

  // Create tar.gz
  const tarFile = join(ROOT, `${NAME}.tar.gz`)
  console.log('  Creating tar.gz...')
  await $`tar -czf ${tarFile} -C /tmp ${NAME}`

  // Cleanup
  await $`rm -rf ${tmpDir}`

  const size = (await $`ls -lh ${tarFile} | awk '{print $5}'`).text().trim()
  console.log(`\n✅ Done! ${tarFile} (${size})`)
  console.log('\n📦 包含:')
  console.log('   install-mac.sh      # macOS 安装脚本')
  console.log('   install-linux.sh    # Linux 安装脚本')
  console.log('   install-windows.ps1 # Windows 安装脚本')
  console.log('   README.md           # 使用说明')
}

main().catch(console.error)
