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
echo "📦 从源码安装 xclaw (Linux)..."
echo ""

# Check for Git
if ! command -v git &> /dev/null; then
  echo "❌ 需要 Git"
  echo "   Ubuntu/Debian: sudo apt install git"
  echo "   Fedora: sudo dnf install git"
  echo "   Arch: sudo pacman -S git"
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
  echo "   安装 Node:"
  echo "     Ubuntu/Debian: sudo apt install nodejs npm"
  echo "     Fedora: sudo dnf install nodejs npm"
  echo "     Arch: sudo pacman -S nodejs npm"
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

# Try /usr/local/bin first, fallback to ~/.local/bin
if [ -w "/usr/local/bin" ]; then
  INSTALL_BIN="/usr/local/bin"
else
  INSTALL_BIN="$HOME/.local/bin"
  mkdir -p "$INSTALL_BIN"
  echo "⚠️  /usr/local/bin 无写入权限，安装到 $INSTALL_BIN"

  # Ensure PATH
  SHELL_RC=""
  if [ -n "$ZSH_VERSION" ] || [ -f "$HOME/.zshrc" ]; then
    SHELL_RC="$HOME/.zshrc"
  elif [ -f "$HOME/.bashrc" ]; then
    SHELL_RC="$HOME/.bashrc"
  fi

  if [[ ":$PATH:" != *":$INSTALL_BIN:"* ]]; then
    if [ -n "$SHELL_RC" ]; then
      echo '' >> "$SHELL_RC"
      echo '# xclaw' >> "$SHELL_RC"
      echo "export PATH=\"$INSTALL_BIN:\$PATH\"" >> "$SHELL_RC"
    fi
    export PATH="$INSTALL_BIN:$PATH"
    echo "✅ 已添加 $INSTALL_BIN 到 PATH（重启终端生效）"
  fi
fi

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
