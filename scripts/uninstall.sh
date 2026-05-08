#!/bin/bash
set -e

echo ""
echo "🗑️  Uninstalling xclaw..."
echo ""

INSTALL_DIR="${XCLAW_DIR:-$HOME/.xclaw-src}"
BIN_DIR="$HOME/.local/bin"

# Remove global link
rm -f "$BIN_DIR/xclaw"
echo "✅ Removed $BIN_DIR/xclaw"

# Ask to remove source
read -p "Remove source directory ($INSTALL_DIR)? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  rm -rf "$INSTALL_DIR"
  echo "✅ Removed $INSTALL_DIR"
fi

# Ask to remove config
read -p "Remove config (~/.xclaw)? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  rm -rf "$HOME/.xclaw"
  echo "✅ Removed ~/.xclaw"
fi

echo ""
echo "Done. Remove PATH entry from ~/.zshrc or ~/.bashrc manually if needed."
echo ""
