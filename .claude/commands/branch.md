# 新しいブランチを作成

## 手順

1. **どこから切るか確認**
   - 「どのブランチから切りますか？」
     - main（本番環境の最新）
     - develop（開発環境の最新）
     - その他（ブランチ名を指定）

2. **ブランチ名の決定**
   - 「変更内容を教えてください」
   - 変更内容からブランチ名を自動生成
   - 例：
     - 「リリースノート機能を追加」→ `feature/release-note-feature`
     - 「ログイン画面のバグ修正」→ `fix/login-screen-bug`
     - 「パフォーマンス改善」→ `feature/performance-improvement`
   - 変更内容が不明な場合は「ブランチの用途を教えてください」と聞く

3. **ブランチタイプの決定**
   - feature/: 新機能・改善
   - fix/: バグ修正
   - hotfix/: 緊急修正（mainから切る場合のみ）

4. **ブランチ作成**
   ```bash
   git checkout <base-branch>
   git pull origin <base-branch>
   git checkout -b <branch-name>
   ```

5. **確認メッセージ**
   - 作成したブランチ名を表示
   - baseブランチを表示
   - 「作業を開始できます」

## 重要なルール

- **既にマージされたブランチは絶対に使わない**
- 常に最新のbaseブランチから作成する
- ブランチ名は英語のケバブケース（lowercase-with-hyphens）
