#!/bin/bash
# Git hooksのセットアップスクリプト

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GIT_HOOKS_DIR="$(git rev-parse --git-dir)/hooks"

echo "🔧 Git hooksをセットアップします..."

# pre-commitフックをコピー
cp "$SCRIPT_DIR/pre-commit" "$GIT_HOOKS_DIR/pre-commit"
chmod +x "$GIT_HOOKS_DIR/pre-commit"

echo "✅ pre-commitフックをインストールしました"
echo ""
echo "📝 インストールされたフック:"
echo "  - pre-commit: コンフリクトマーカーの検出"
