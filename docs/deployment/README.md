# デプロイ・運用ドキュメント

AI株式分析ツールのデプロイ手順、環境構築、運用に関する情報をまとめています。

---

## 📋 概要

このアプリケーションは以下の構成でデプロイされています：

```
フロントエンド: Next.js 15
  └─ ホスティング: Vercel

データベース: PostgreSQL
  └─ ホスティング: Supabase

バッチ処理: Python
  └─ 実行環境: GitHub Actions
```

---

## 🚀 デプロイ手順

### 初回デプロイ

1. **DEPLOYMENT.md を参照**
   - [DEPLOYMENT.md](./DEPLOYMENT.md) に詳細な手順を記載

2. **必要なアカウント**
   - Vercel アカウント
   - Supabase アカウント
   - OpenAI API キー

3. **環境変数の設定**
   ```bash
   DATABASE_URL=postgresql://...
   OPENAI_API_KEY=sk-...
   ```

---

## 📁 ディレクトリ構成

```
deployment/
├── README.md（本ファイル）
├── DEPLOYMENT.md（詳細手順）
└── vercel_supabase/（環境別設定）
```

---

## 🔧 環境別設定

### 開発環境（Local）

```bash
# .env ファイル設定
DATABASE_URL="postgresql://localhost:5432/stock_analyzer"
OPENAI_API_KEY="sk-..."

# 起動
npm run dev
```

### 本番環境（Vercel）

Vercel Dashboard で環境変数を設定：
- `DATABASE_URL`: Supabase の接続文字列
- `OPENAI_API_KEY`: OpenAI API キー

詳細は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照

---

## 📊 バッチ処理のデプロイ

### GitHub Actions でのスケジュール実行

```yaml
# .github/workflows/analyze-stocks.yml

on:
  schedule:
    # 毎日 AM 6:00 JST (UTC 21:00前日)
    - cron: '0 21 * * *'
  workflow_dispatch:  # 手動実行も可能
```

設定詳細は [`batch/README.md`](../../batch/README.md) を参照

---

## 🐛 トラブルシューティング

### よくある問題

#### 1. DATABASE_URL の問題

**症状**: `prepared statement "s11" does not exist`

**原因**: Supabase pgBouncer + Prisma の prepared statement 問題

**解決策**:
```
DATABASE_URL に `?pgbouncer=true` を追加
connection_limit=1 は削除
```

詳細: [DEPLOYMENT.md](./DEPLOYMENT.md#トラブルシューティング)

---

#### 2. Vercel ビルドエラー

**症状**: `npm error path /vercel/path0/web/web/package.json`

**原因**: vercel.json の設定ミス

**解決策**:
- Vercel Dashboard で Root Directory を `web` に設定
- vercel.json を削除（デフォルト設定を使用）

---

#### 3. 環境変数の上書き問題

**症状**: ローカルの `.env` が効かない

**原因**: シェル環境変数が優先される

**解決策**:
```bash
# web/dev.sh を使用
./dev.sh

# または手動でunset
unset DATABASE_URL NODE_ENV
npm run dev
```

---

## 📞 サポート

デプロイに関する問題は、以下を確認してください：

1. [DEPLOYMENT.md](./DEPLOYMENT.md) のトラブルシューティングセクション
2. Vercel のログ（Dashboard → Deployments → Logs）
3. Supabase のログ（Dashboard → Logs）
4. GitHub Actions のログ（Actions タブ）

それでも解決しない場合は、GitHubのIssueで質問してください。

---

## 🔄 更新履歴

### 2026-01-14
- deployment/ ディレクトリに再構成
- README.md作成（本ファイル）

### 2026-01-08
- DEPLOYMENT.md作成
- Vercel + Supabase初期デプロイ完了
