# デプロイ手順：Vercel + Neon

このドキュメントは、銘柄スクリーニングツールを**Vercel（フロントエンド＆バックエンド）+ Neon（PostgreSQL）**で無料デプロイする手順です。

## 前提条件

- GitHubアカウント
- コードがGitHubにpush済み

## ステップ1: Neon PostgreSQLのセットアップ

### 1.1 Neonアカウント作成

1. [Neon](https://neon.tech/)にアクセス
2. 「Sign Up」をクリック
3. GitHubアカウントで認証

### 1.2 データベース作成

1. Neonダッシュボードで「Create Project」をクリック
2. プロジェクト名：`stock-screener`
3. リージョン：最寄りのリージョンを選択（例：東京）
4. PostgreSQLバージョン：最新版を選択
5. 「Create Project」をクリック

### 1.3 接続情報の取得

1. プロジェクト作成後、「Connection Details」タブを開く
2. 「Connection string」をコピー
   ```
   postgresql://username:password@host/database?sslmode=require
   ```
3. この接続文字列を後で使用します

## ステップ2: Vercelのセットアップ

### 2.1 Vercelアカウント作成

1. [Vercel](https://vercel.com/)にアクセス
2. 「Sign Up」をクリック
3. GitHubアカウントで認証

### 2.2 プロジェクトのインポート

1. Vercelダッシュボードで「Add New...」→「Project」をクリック
2. GitHubリポジトリ `koheikameyama/investment` を選択
3. 「Import」をクリック

### 2.3 プロジェクト設定

**Framework Preset**: `Other`

**Root Directory**: `stock-screener`（ルートディレクトリを指定）

**Build Settings**:
- Build Command: `cd frontend && npm install && npm run build`
- Output Directory: `frontend/dist`
- Install Command: `npm install`

### 2.4 環境変数の設定

「Environment Variables」セクションで以下を追加：

| Name | Value | 備考 |
|------|-------|------|
| `DATABASE_URL` | `postgresql://...` | Neonの接続文字列 |
| `NODE_ENV` | `production` | 本番環境 |
| `PORT` | `3000` | バックエンドポート |

**重要**: `DATABASE_URL`にはステップ1.3でコピーした接続文字列を貼り付けてください。

### 2.5 デプロイ

1. 「Deploy」ボタンをクリック
2. デプロイが開始されます（3〜5分程度）
3. デプロイ完了後、URLが表示されます（例：`https://your-app.vercel.app`）

## ステップ3: データベースのセットアップ

### 3.1 Prismaマイグレーション実行

デプロイ後、Vercelのダッシュボードから：

1. プロジェクトページの「Settings」→「Functions」
2. または、ローカル環境で以下を実行：

```bash
# .envファイルにNeonの接続文字列を設定
echo "DATABASE_URL=postgresql://..." > backend/.env

# Prismaマイグレーション実行
cd backend
npm install
npx prisma migrate deploy
```

### 3.2 初期データ投入

```bash
# バッチスクリプトでYahoo Finance APIから銘柄データを取得
npx tsx src/scripts/refresh-data.ts
```

**注意**: 初期データ投入には5〜10分かかる場合があります。

## ステップ4: 動作確認

1. Vercelから発行されたURL（例：`https://your-app.vercel.app`）にアクセス
2. 銘柄スクリーニングツールが表示されることを確認
3. 日本株/米国株タブが切り替わることを確認
4. フィルタ条件を入力して検索してみる

## トラブルシューティング

### エラー: "Database connection failed"

- 環境変数 `DATABASE_URL` が正しく設定されているか確認
- Neonのデータベースが起動しているか確認（Neonダッシュボードで確認）

### エラー: "API endpoint not found"

- vercel.jsonの設定が正しいか確認
- バックエンドが正しくビルドされているか確認（Vercel Logsで確認）

### データが表示されない

- 初期データ投入（ステップ3.2）を実行したか確認
- ブラウザの開発者ツールでAPI通信エラーがないか確認

## 無料枠の制限

### Vercel無料枠
- 月100GBまでの帯域幅
- Serverless Function実行時間: 月100GB-hours
- 商用利用可能

### Neon無料枠
- ストレージ: 512MB
- 常時稼働（スリープなし）
- 1プロジェクトまで

**注意**: Yahoo Finance APIの利用制限により、取得できる銘柄数には上限があります。

## 継続的デプロイ

GitHubにpushすると、Vercelが自動的に再デプロイします。

```bash
git add .
git commit -m "更新内容"
git push
```

数分後、自動的に本番環境に反映されます。

## 次のステップ

- カスタムドメインの設定（Vercel Settings → Domains）
- パフォーマンスモニタリングの設定
- エラートラッキング（Sentry等）の導入

---

**デプロイガイド作成日**: 2026-01-08
