#!/bin/bash
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
echo "📦 从源码安装 xclaw (macOS)..."
echo ""

# Check for Git
if ! command -v git &> /dev/null; then
  echo "❌ 需要 Git"
  echo "   安装方式: brew install git"
  echo "   或: xcode-select --install"
  exit 1
fi

# Check for Bun (preferred) or Node.js
HAS_BUN=false
if command -v bun &> /dev/null; then
  HAS_BUN=true
  echo "✅ 检测到 Bun $(bun --version)"
fi

if ! command -v node &> /dev/null && [ "$HAS_BUN" = false ]; then
  echo "❌ 需要 Node.js >= 18 或 Bun"
  echo "   安装 Node: brew install node"
  echo "   安装 Bun: curl -fsSL https://bun.sh/install | bash"
  exit 1
fi

if command -v node &> /dev/null; then
  NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VER" -lt 18 ] && [ "$HAS_BUN" = false ]; then
    echo "❌ Node.js 版本过低 (需要 >= 18, 当前: $(node -v))"
    exit 1
  fi
  echo "✅ Node.js $(node -v)"
fi

# Clone repo
INSTALL_DIR="$HOME/xclaw"
echo ""
echo "📥 克隆仓库到 $INSTALL_DIR..."

if [ -d "$INSTALL_DIR" ]; then
  echo "   目录已存在，更新中..."
  cd "$INSTALL_DIR"
  git pull
else
  git clone https://github.com/YuanyuanMa03/xclaw.git "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

# Install dependencies
echo ""
echo "📥 安装依赖..."
if [ "$HAS_BUN" = true ]; then
  bun install
else
  npm install
fi

# Build
echo ""
echo "🔨 构建..."
if [ "$HAS_BUN" = true ]; then
  bun run build
else
  node build.ts
fi

# Verify
if [ ! -f "dist/cli-node.js" ]; then
  echo "❌ 构建失败: dist/cli-node.js 不存在"
  exit 1
fi

# Global install
echo ""
echo "🔗 全局安装..."

INSTALL_BIN="/usr/local/bin"
ln -sf "$INSTALL_DIR/dist/cli-node.js" "$INSTALL_BIN/xclaw"
chmod +x "$INSTALL_DIR/dist/cli-node.js"

echo ""
echo "✅ xclaw 已全局安装!"
echo ""
echo "🚀 开始使用:"
echo "   xclaw              # 启动"
echo "   xclaw --version    # 查看版本"
echo ""
echo "📝 首次配置:"
echo "   启动后输入 /login 配置 API"
echo ""
echo "🔄 更新:"
echo "   cd $INSTALL_DIR"
echo "   git pull"
if [ "$HAS_BUN" = true ]; then
  echo "   bun install && bun run build"
else
  echo "   npm install && node build.ts"
fi
echo ""
