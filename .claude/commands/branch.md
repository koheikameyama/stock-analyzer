# 新しいブランチを作成

## ブランチ運用ルール

このプロジェクトでは以下のブランチ構成を使用します：

- **main**: 本番環境
- **develop**: 開発環境
- **feature/***: 新機能・改善（developから切る → developへPR）
- **hotfix/***: 緊急修正（mainから切る → mainへPR）

## 手順

1. **変更内容を確認**
   - 「変更内容を教えてください」と質問
   - 変更内容からブランチタイプを自動判定：
     - 通常の開発作業 → `feature/`
     - 本番環境の緊急修正 → `hotfix/`

2. **ブランチ名の自動生成**
   - 変更内容から適切なブランチ名を生成
   - 例：
     - 「リリースノート機能を追加」→ `feature/release-note-feature`
     - 「本番のログインバグを修正」→ `hotfix/login-bug-fix`
     - 「パフォーマンス改善」→ `feature/performance-improvement`

3. **baseブランチの自動決定**
   - `feature/*` → developから切る
   - `hotfix/*` → mainから切る
   - ユーザーに確認せず、自動的に決定

4. **ブランチ作成**
   ```bash
   git checkout <base-branch>
   git pull origin <base-branch>
   git checkout -b <branch-name>
   ```

5. **確認メッセージ**
   - 作成したブランチ名を表示
   - baseブランチを表示
   - PR作成先を表示（feature → develop、hotfix → main）
   - 「作業を開始できます。ブランチをpushすると自動的にPRが作成されます」

## 重要なルール

- **既にマージされたブランチは絶対に使わない**
- 常に最新のbaseブランチから作成する
- ブランチ名は英語のケバブケース（lowercase-with-hyphens）
- **feature/とhotfix/のみ使用可能**（他のプレフィックスは使用禁止）
- ブランチをpushすると自動的にPRが作成されます
