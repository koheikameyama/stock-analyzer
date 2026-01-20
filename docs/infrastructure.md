# インフラ構成図

## 概要

Stock Analyzerは、Next.js 15をベースとしたWebアプリケーションで、Railway上でホスティングされています。

## アーキテクチャ図

```
ユーザー
    ↓
Cloudflare (CDN + DNS)
    ↓
Railway (Webアプリ + PostgreSQL)
    ↓
OpenAI API (GPT-4o)
```

## 詳細構成

### フロントエンド・バックエンド

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **PWA**: next-pwa
- **ORM**: Prisma
- **ホスティング**: Railway

### データベース

- **種類**: PostgreSQL 16
- **ホスティング**: Railway PostgreSQL
- **接続方法**:
  - 内部: `postgres.railway.internal:5432`
  - 外部: `ballast.proxy.rlwy.net:35578`
- **データ**:
  - 銘柄情報: 1605銘柄
  - AI分析結果
  - 株価履歴
  - バッチジョブログ
  - プッシュ通知購読情報

### バッチ処理

- **言語**: Python 3.11
- **実行環境**: GitHub Actions
- **スケジュール**: 毎日UTC 9:00 (日本時間 18:00)
- **処理内容**:
  - `is_ai_analysis_target=true`の銘柄を分析
  - yfinanceで株価データ取得
  - OpenAI APIで分析実行
  - PostgreSQLに保存
  - プッシュ通知送信

### DNS・CDN

- **DNS**: Cloudflare
- **ネームサーバー**: Cloudflareのネームサーバー
- **ドメイン**:
  - Apex: `stock-analyzer.jp` → `www.stock-analyzer.jp`にリダイレクト
  - WWW: `www.stock-analyzer.jp`
- **SSL/TLS**: Cloudflare経由（自動発行）
- **Proxy**: 有効（オレンジクラウド）
- **リダイレクト**: Cloudflare Redirect Rulesで設定

### 外部サービス

| サービス | 用途 |
|---------|------|
| OpenAI API | GPT-4oによる銘柄分析 |
| Railway | Webアプリ・DBホスティング |
| Cloudflare | DNS・CDN・リダイレクト |
| GitHub Actions | バッチ処理実行 |
| お名前.com | ドメイン登録 |

## デプロイフロー

### Webアプリ

```
1. GitHub mainブランチにpush
2. Railwayが自動検知
3. ビルド実行 (next build)
4. デプロイ
5. Cloudflare経由で配信
```

### バッチ処理

```
1. GitHub Actions (cron: 0 9 * * *)
2. Pythonスクリプト実行
3. OpenAI APIで分析
4. Railway PostgreSQLに保存
5. プッシュ通知送信
```

## 環境変数

### Railway (Webアプリ)

```
DATABASE_URL=postgresql://postgres.railway.internal:5432/railway
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BI92w7CA...
VAPID_PRIVATE_KEY=nOzlGS76...
VAPID_SUBJECT=https://www.stock-analyzer.jp
```

### GitHub Actions

```
DATABASE_URL=postgresql://postgres:PASSWORD@ballast.proxy.rlwy.net:35578/railway
OPENAI_API_KEY=sk-...
API_BASE_URL=https://www.stock-analyzer.jp
```

## Railway設定

### ビルドコマンド
```bash
cd web && npm install && npx prisma generate --schema=../prisma/schema.prisma && npm run build
```

### 起動コマンド
```bash
cd web && npm start
```

### リスタートポリシー
- Type: `ON_FAILURE`
- Max Retries: 10

## Cloudflare DNS設定

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | @ | ki7jpyok.up.railway.app | 🟠 Proxied |
| CNAME | www | ki7jpyok.up.railway.app | 🟠 Proxied |

### Redirect Rules

- From: `stock-analyzer.jp/*`
- To: `https://www.stock-analyzer.jp/*`
- Status: 301 (Permanent)

## データベーススキーマ

### テーブル一覧

- `stocks` - 銘柄情報
- `analyses` - AI分析結果
- `price_history` - 株価履歴
- `batch_job_logs` - バッチジョブログ
- `push_subscriptions` - プッシュ通知購読

詳細は `prisma/schema.prisma` を参照。

## バックアップ・復旧

### データベース

- **自動バックアップ**: Railwayの自動バックアップ機能
- **マイグレーション管理**: Prisma Migrate
- **手動エクスポート**:
  ```bash
  DATABASE_URL="..." npx tsx scripts/export-data.ts
  ```

### コード

- **リポジトリ**: GitHub (koheikameyama/stock-analyzer)
- **ブランチ保護**: mainブランチは保護されており、PR経由でのみマージ可能

## モニタリング

### Railway

- デプロイログ
- アプリケーションログ
- メトリクス（CPU、メモリ、ネットワーク）

### GitHub Actions

- ワークフロー実行履歴
- バッチジョブログ

### Cloudflare

- アクセス統計
- キャッシュ率
- セキュリティイベント

## コスト

| サービス | プラン | 月額 |
|---------|------|------|
| Railway | Hobby | 使用量課金（約$5-10） |
| Cloudflare | Free | $0 |
| GitHub Actions | Free | $0（月2000分まで） |
| OpenAI API | Pay as you go | 使用量による |
| お名前.com | - | 年額約¥1,500 |

## パフォーマンス最適化

- Cloudflare CDNによるキャッシュ
- Next.js App Routerの最適化
- Prisma接続プール
- 画像最適化（Next.js Image）
- PWAによるオフライン対応

## セキュリティ

- HTTPS強制（Cloudflare）
- 環境変数による秘匿情報管理
- GitHub Secretsでシークレット管理
- SQL Injection対策（Prisma ORM）
- XSS対策（React）
- CORS設定

## トラブルシューティング

### デプロイが失敗する

1. Railwayのデプロイログを確認
2. Prismaマイグレーションエラーの場合:
   ```bash
   DATABASE_URL="..." npx prisma migrate resolve
   ```

### バッチが実行されない

1. GitHub Actionsのログを確認
2. DATABASE_URLが正しいか確認
3. OPENAI_API_KEYが有効か確認

### ドメインにアクセスできない

1. Cloudflareのネームサーバーが設定されているか確認
2. DNS設定が正しいか確認
3. Railwayのカスタムドメインが有効か確認

## 更新履歴

- 2026-01-20: Vercel→Railway移行、Cloudflare DNS導入
- 2026-01-19: Railway Cron検討→GitHub Actionsに戻す
- 2026-01-19: AI分析対象フィルタリング機能追加
