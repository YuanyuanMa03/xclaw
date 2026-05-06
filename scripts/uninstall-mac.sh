#!/bin/bash
set -e

echo ""
echo "🐾 卸载 xclaw (macOS)..."
echo ""

# Remove global link
INSTALL_BIN="/usr/local/bin"
LINK_PATH="$INSTALL_BIN/xclaw"

if [ -L "$LINK_PATH" ]; then
  rm "$LINK_PATH"
  echo "✅ 已移除 $LINK_PATH"
elif [ -f "$LINK_PATH" ]; then
  rm "$LINK_PATH"
  echo "✅ 已移除 $LINK_PATH"
else
  echo "⚠️  $LINK_PATH 不存在"
fi

# Ask about source directory
SOURCE_DIR="$HOME/xclaw"
if [ -d "$SOURCE_DIR" ]; then
  echo ""
  read -p "是否删除源码目录 $SOURCE_DIR? (y/N): " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf "$SOURCE_DIR"
    echo "✅ 已删除 $SOURCE_DIR"
  else
    echo "⏭  保留 $SOURCE_DIR"
  fi
fi

# Ask about config
CONFIG_DIR="$HOME/.claude"
XCLAW_DIR="$HOME/.xclaw"

echo ""
read -p "是否删除配置文件? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  if [ -d "$XCLAW_DIR" ]; then
    rm -rf "$XCLAW_DIR"
    echo "✅ 已删除 $XCLAW_DIR"
  fi
  echo "⚠️  ~/.claude 是 Claude Code 共享配置，未删除"
  echo "   如需删除: rm -rf ~/.claude"
else
  echo "⏭  保留配置文件"
fi

echo ""
echo "✅ xclaw 卸载完成!"
echo ""
