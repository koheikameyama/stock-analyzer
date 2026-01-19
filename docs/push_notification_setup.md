# プッシュ通知機能のセットアップガイド

日次更新完了時にWeb Push通知を送信する機能のセットアップ手順です。

## 概要

- 毎日18:00（JST）の分析完了後、購読しているユーザーにプッシュ通知を送信
- PWA（Progressive Web App）のWeb Push APIを使用
- VAPID（Voluntary Application Server Identification）認証を使用

## セットアップ手順

### 1. VAPID鍵の生成

プッシュ通知には、サーバーを識別するためのVAPID鍵ペアが必要です。

```bash
# webディレクトリに移動
cd web

# VAPID鍵を生成
node ../batch/generate_vapid_keys.js
```

実行すると、以下のような出力が表示されます：

```
============================================================
VAPID鍵が生成されました
============================================================

公開鍵（クライアント側で使用）:
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BN7g...（長い文字列）

秘密鍵（サーバー側で使用）:
VAPID_PRIVATE_KEY=vM3P...（長い文字列）

============================================================
```

### 2. 環境変数の設定

#### ローカル開発環境

`web/.env.local` ファイルを作成し、以下を追加：

```env
# Web Push通知（VAPID鍵）
NEXT_PUBLIC_VAPID_PUBLIC_KEY=生成された公開鍵
VAPID_PRIVATE_KEY=生成された秘密鍵
VAPID_SUBJECT=mailto:your-email@example.com
```

#### 本番環境（GitHub Secrets）

GitHub リポジトリの Settings → Secrets and variables → Actions から、以下のSecretsを追加：

| Secret名 | 値 | 説明 |
|---------|-----|------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | 生成された公開鍵 | クライアント側で使用 |
| `VAPID_PRIVATE_KEY` | 生成された秘密鍵 | サーバー側で使用 |
| `VAPID_SUBJECT` | `mailto:your-email@example.com` | 連絡先メールアドレス |
| `API_BASE_URL` | `https://stock-analyzer-kohei.vercel.app` | 本番環境のURL |

### 3. データベースマイグレーション

プッシュ通知購読情報を保存するテーブルを作成：

```bash
# prismaディレクトリに移動
cd /path/to/stock-analyzer

# マイグレーションを作成・実行
npx prisma migrate dev --name add_push_subscriptions

# 本番環境への適用
npx prisma migrate deploy
```

### 4. Vercelへのデプロイ

環境変数をVercelに設定：

```bash
# Vercel CLIを使用する場合
vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY
vercel env add VAPID_PRIVATE_KEY
vercel env add VAPID_SUBJECT
```

または、Vercel Dashboardから手動で設定：
1. Vercelプロジェクトを開く
2. Settings → Environment Variables
3. 上記の環境変数を追加

## 使い方

### ユーザー側

1. Webサイトにアクセス
2. トップページの「日次更新通知」トグルで「有効にする」をクリック
3. ブラウザの通知許可ダイアログで「許可」を選択
4. 設定完了！毎日18:00の分析完了後に通知が届きます

### 管理者側

#### 手動で通知を送信

```bash
cd batch
python send_daily_notification.py
```

#### 通知のカスタマイズ

`batch/send_daily_notification.py` の `payload` を編集：

```python
payload = {
    'title': '📊 本日の分析が完了しました',
    'body': f'{today}の株式分析が完了しました。',
    'url': '/'  # クリック時の遷移先
}
```

## トラブルシューティング

### 通知が届かない場合

1. **ブラウザの通知許可を確認**
   - Chrome: 設定 → プライバシーとセキュリティ → サイトの設定 → 通知
   - Safari: 環境設定 → Webサイト → 通知

2. **Service Workerの登録を確認**
   - DevTools → Application → Service Workers
   - 登録されているか確認

3. **環境変数の確認**
   - VAPID鍵が正しく設定されているか
   - API_BASE_URLが正しいか

4. **購読情報の確認**
   - データベースの `push_subscriptions` テーブルを確認
   - エンドポイントが有効か

### よくあるエラー

#### "VAPID鍵が設定されていません"

→ 環境変数 `NEXT_PUBLIC_VAPID_PUBLIC_KEY` と `VAPID_PRIVATE_KEY` が設定されているか確認

#### "410 Gone" エラー

→ 購読情報が無効になっています。再度購読してください。

#### "通知の許可が必要です"

→ ブラウザの通知を許可してください。

## 技術詳細

### アーキテクチャ

```
┌─────────────────────────────────────────┐
│  GitHub Actions (daily-analysis.yml)    │
│  毎日 UTC 9:00 (JST 18:00) 実行         │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  batch_analysis.py                      │
│  株価データ取得・AI分析・DB保存         │
└─────────────────────────────────────────┘
              ↓ 成功時
┌─────────────────────────────────────────┐
│  send_daily_notification.py             │
│  /api/push-notifications/send を呼び出し│
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Next.js API Route                      │
│  /api/push-notifications/send/route.ts  │
│  購読者全員に通知を送信                  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Web Push API (ブラウザ)                │
│  Service Worker で通知を受信・表示      │
└─────────────────────────────────────────┘
```

### データベーススキーマ

```prisma
model PushSubscription {
  id        String   @id @default(uuid())
  endpoint  String   @unique
  p256dh    String   // 公開鍵（暗号化用）
  auth      String   // 認証シークレット
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([endpoint])
  @@map("push_subscriptions")
}
```

### APIエンドポイント

#### POST /api/push-notifications/subscribe
通知を購読

**リクエスト:**
```json
{
  "endpoint": "https://...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

#### DELETE /api/push-notifications/subscribe
通知を購読解除

**リクエスト:**
```json
{
  "endpoint": "https://..."
}
```

#### POST /api/push-notifications/send
通知を送信（管理者用）

**リクエスト:**
```json
{
  "title": "通知タイトル",
  "body": "通知本文",
  "url": "/"
}
```

## 参考リンク

- [Web Push API (MDN)](https://developer.mozilla.org/ja/docs/Web/API/Push_API)
- [VAPID仕様](https://tools.ietf.org/html/rfc8292)
- [Service Worker API](https://developer.mozilla.org/ja/docs/Web/API/Service_Worker_API)
