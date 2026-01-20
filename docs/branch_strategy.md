# ブランチ運用戦略

## ブランチ構成

```
main (本番・保護)
  └── feature/* (機能開発)
  └── fix/* (バグ修正)
  └── hotfix/* (緊急修正)
```

---

## ブランチ命名規則

### feature/* - 新機能開発
```
feature/ポートフォリオ管理
feature/米国株対応
feature/アラート通知
```

### fix/* - バグ修正
```
fix/配当利回り計算エラー
fix/モーダル表示崩れ
```

### hotfix/* - 緊急修正
```
hotfix/重大なセキュリティ問題
hotfix/データ取得エラー
```

---

## 開発フロー

### 1. ブランチ作成
```bash
# mainから最新を取得
git checkout main
git pull origin main

# 機能ブランチ作成
git checkout -b feature/ポートフォリオ管理
```

### 2. 開発・コミット
```bash
# 開発を進める
git add .
git commit -m "feat: add portfolio management feature"

# プッシュ
git push origin feature/ポートフォリオ管理
```

### 3. PR作成
1. GitHubでPRを作成
2. PRテンプレートに従って記入
3. **重要**: 適切なバージョンラベルを付与
   - `version:major` - 破壊的変更
   - `version:minor` - 新機能追加
   - `version:patch` - バグ修正

### 4. レビュー・マージ
1. セルフレビュー（コード確認）
2. 動作確認
3. mainにマージ

### 5. 自動リリース
- **version:*** ラベルが付いている場合:
  - 自動的にバージョン計算
  - GitHub Release作成
  - Slack通知
  - X投稿候補が届く

- **ラベルなしの場合**:
  - リリースは作成されない
  - 次回リリース時にまとめて含まれる

---

## バージョニング規則

セマンティックバージョニング（Semantic Versioning）に従います。

### version:major (v1.0.0 → v2.0.0)
**破壊的変更**
- APIの仕様変更
- 既存機能の削除
- データベーススキーマの大幅変更

**例:**
- 無料プランの機能制限
- APIエンドポイントの変更

### version:minor (v1.0.0 → v1.1.0)
**新機能追加**
- 後方互換性のある機能追加
- 新しいページ・機能の追加
- UI/UXの大幅改善

**例:**
- ポートフォリオ管理機能
- 米国株対応
- アラート通知機能

### version:patch (v1.0.0 → v1.0.1)
**バグ修正・小さな改善**
- バグ修正
- パフォーマンス改善
- 小さなUI調整
- ドキュメント修正

**例:**
- 配当利回り計算エラー修正
- モーダルz-index修正
- 財務指標の表示調整

---

## リリースフロー

### 自動リリース（デプロイ時）
```
1. PR作成 + version:minor ラベル付与
   ↓
2. mainにマージ
   ↓
3. 毎日深夜2:00にGitHub Actions（deploy.yml）が自動実行
   - 前回デプロイからマージされたPRを集約
   - version:*ラベルを確認
   - 最も大きいバージョンアップを採用
   ↓
4. Railwayにデプロイ
   ↓
5. デプロイ成功後にGitHub Release作成
   - 現在のバージョン取得（v1.0.0）
   - 新バージョン計算（v1.1.0）
   - リリースノート生成（全PRのリリースノートを集約）
   ↓
6. Slack通知
   - リリースノート
   - X投稿候補
   ↓
5. 手動でX投稿
```

### 緊急デプロイ（手動実行）
```
1. 緊急のPRをmainにマージ
   ↓
2. GitHub Actions → Daily Deploy to Railway → Run workflow
   ↓
3. 即座にデプロイ実行
   - version:*ラベルがあればリリース作成
   - なければデプロイのみ
   ↓
4. Slack通知（リリース作成された場合）
```

### ラベルなしPRの扱い
```
- version:*ラベルがないPRはマージ可能
- デプロイはされるが、リリースは作成されない
- 次回のversion:*付きPRと一緒にデプロイされる
```

---

## ブランチ保護ルール

### main ブランチ
- ✅ 直接プッシュ禁止
- ✅ PR必須
- ⚠️ batch/配下の変更は注意（自動実行される）

### 設定方法
GitHub → Settings → Branches → Add rule
- Branch name pattern: `main`
- [x] Require pull request before merging

---

## よくある質問

### Q. 小さな修正でもPR必要？
A. はい。main保護のため、どんな小さな変更でもPR経由でマージしてください。

### Q. 複数の機能を1つのPRにまとめても良い？
A. できるだけ1つのPRで1つの機能に絞ってください。レビューしやすく、問題の切り分けも容易になります。

### Q. version:ラベルを付け忘れた場合は？
A. リリースは作成されません。次回のリリース時にまとめて含まれるか、手動でリリースを作成できます。

### Q. hotfixはどう扱う？
A. `hotfix/*` ブランチを作成し、通常のPRフローに従ってください。緊急度に応じて `version:patch` ラベルを付与してください。

### Q. リリースを取り消したい場合は？
A. GitHub Releasesから該当のリリースを削除できます。ただし、コードはmainにマージ済みなので、必要なら revert してください。

---

## トラブルシューティング

### 自動リリースが作成されない
**確認事項:**
1. PRがmainにマージされたか
2. version:* ラベルが付いているか
3. GitHub Actionsが実行されたか（Actionsタブで確認）

### バージョン番号が期待と違う
- 最新のタグ（git tag）が正しいか確認
- 手動でタグを作成している場合は削除して再実行

### Slack通知が届かない
- `SLACK_WEBHOOK_URL` シークレットが設定されているか確認
- Webhookが有効か確認

---

## 参考リンク

- [Semantic Versioning 2.0.0](https://semver.org/)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [GitHub Actions - Pull Request Events](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#pull_request)
