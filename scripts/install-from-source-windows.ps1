# xclaw Windows Installer (from source)
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
Write-Host "📦 从源码安装 xclaw (Windows)..."
Write-Host ""

# Check for Git
try {
    $gitVer = git --version
    Write-Host "✅ $gitVer"
} catch {
    Write-Host "❌ 需要 Git"
    Write-Host "   下载: https://git-scm.com/download/win"
    Write-Host "   或运行: winget install Git.Git"
    exit 1
}

# Check for Bun (preferred) or Node.js
$HAS_BUN = $false
try {
    $bunVer = bun --version
    $HAS_BUN = $true
    Write-Host "✅ Bun $bunVer"
} catch {
    # Bun not found, check Node.js
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 需要 Node.js >= 18 或 Bun"
    Write-Host "   安装 Node: https://nodejs.org"
    Write-Host "   或运行: winget install OpenJS.NodeJS.LTS"
    Write-Host "   安装 Bun: powershell -c `"irm bun.sh/install.ps1 | iex`""
    exit 1
}

$nodeVer = node -v
$major = [int]($nodeVer -replace 'v(\d+).*', '$1')
if ($major -lt 18 -and -not $HAS_BUN) {
    Write-Host "❌ Node.js 版本过低 (需要 >= 18, 当前: $nodeVer)"
    exit 1
}
Write-Host "✅ Node.js $nodeVer"

# Clone repo
$INSTALL_DIR = "$env:USERPROFILE\xclaw"
Write-Host ""
Write-Host "📥 克隆仓库到 $INSTALL_DIR..."

if (Test-Path $INSTALL_DIR) {
    Write-Host "   目录已存在，更新中..."
    Set-Location $INSTALL_DIR
    git pull
} else {
    git clone https://github.com/YuanyuanMa03/xclaw.git $INSTALL_DIR
    Set-Location $INSTALL_DIR
}

# Install dependencies
Write-Host ""
Write-Host "📥 安装依赖..."
if ($HAS_BUN) {
    bun install
} else {
    npm install
}

# Build
Write-Host ""
Write-Host "🔨 构建..."
if ($HAS_BUN) {
    bun run build
} else {
    node build.ts
}

# Verify
if (-not (Test-Path "dist\cli-node.js")) {
    Write-Host "❌ 构建失败: dist\cli-node.js 不存在"
    exit 1
}

# Global install
Write-Host ""
Write-Host "🔗 全局安装..."

$installBin = "$env:LOCALAPPDATA\xclaw"
if (-not (Test-Path $installBin)) {
    New-Item -ItemType Directory -Path $installBin -Force | Out-Null
}

# Create batch wrapper
$batchContent = "@echo off`nnode `"$INSTALL_DIR\dist\cli-node.js`" %*"
Set-Content -Path "$installBin\xclaw.cmd" -Value $batchContent

# Add to PATH if not already there
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$installBin*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$installBin", "User")
    $env:Path = "$env:Path;$installBin"
    Write-Host "✅ 已添加到 PATH（重启终端生效）"
}

Write-Host ""
Write-Host "✅ xclaw 已全局安装!"
Write-Host ""
Write-Host "🚀 开始使用:"
Write-Host "   xclaw              # 启动"
Write-Host "   xclaw --version    # 查看版本"
Write-Host ""
Write-Host "📝 首次配置:"
Write-Host "   启动后输入 /login 配置 API"
Write-Host ""
Write-Host "🔄 更新:"
Write-Host "   cd $INSTALL_DIR"
Write-Host "   git pull"
if ($HAS_BUN) {
    Write-Host "   bun install && bun run build"
} else {
    Write-Host "   npm install && node build.ts"
}
Write-Host ""
