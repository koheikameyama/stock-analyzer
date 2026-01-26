# 認証機能セットアップガイド

## 概要

このプロジェクトではNextAuth.js v5を使用したGoogle OAuthログインを実装しています。

## 必要な環境変数

以下の環境変数を`.env.local`に設定してください：

```bash
# NextAuth.js設定
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<ランダムな文字列>

# Google OAuth認証情報
GOOGLE_CLIENT_ID=<Google Cloud ConsoleのClient ID>
GOOGLE_CLIENT_SECRET=<Google Cloud ConsoleのClient Secret>

# データベース接続
DATABASE_URL=<PostgreSQL接続URL>
```

## NEXTAUTH_SECRETの生成方法

以下のコマンドでランダムな文字列を生成できます：

```bash
openssl rand -base64 32
```

## Google OAuth設定手順

### 1. Google Cloud Consoleでプロジェクト作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）

### 2. OAuth同意画面の設定

1. 左メニューから「APIとサービス」→「OAuth同意画面」を選択
2. ユーザータイプで「外部」を選択
3. アプリ情報を入力：
   - アプリ名: AI株式分析ツール
   - ユーザーサポートメール: あなたのメールアドレス
   - デベロッパーの連絡先情報: あなたのメールアドレス
4. スコープの設定：
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
5. テストユーザーの追加（開発中のみ）

### 3. 認証情報の作成

1. 左メニューから「APIとサービス」→「認証情報」を選択
2. 「認証情報を作成」→「OAuth クライアント ID」を選択
3. アプリケーションの種類: 「ウェブアプリケーション」
4. 承認済みのリダイレクトURIを追加：
   - 開発環境: `http://localhost:3000/api/auth/callback/google`
   - 本番環境: `https://stock-analyzer.jp/api/auth/callback/google`
5. 作成後、Client IDとClient Secretをコピー

### 4. 環境変数に設定

`.env.local`ファイルを作成し、取得した認証情報を設定：

```bash
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx
```

## データベースマイグレーション

認証機能に必要なテーブルを作成します：

```bash
cd web
npx prisma db push
```

## 動作確認

1. 開発サーバーを起動：

```bash
npm run dev
```

2. ブラウザで`http://localhost:3000`にアクセス

3. ヘッダーの「ログイン」ボタンをクリック

4. Googleアカウントでログインできることを確認

## 本番環境の設定

本番環境（Vercel / Railway等）では、環境変数を以下のように設定してください：

```bash
NEXTAUTH_URL=https://stock-analyzer.jp
NEXTAUTH_SECRET=<本番用のランダムな文字列>
GOOGLE_CLIENT_ID=<Google Cloud ConsoleのClient ID>
GOOGLE_CLIENT_SECRET=<Google Cloud ConsoleのClient Secret>
DATABASE_URL=<本番データベースURL>
```

## トラブルシューティング

### ログインできない

- Google Cloud Consoleでリダイレクト URIが正しく設定されているか確認
- 環境変数が正しく設定されているか確認
- データベースのusers/accountsテーブルが作成されているか確認

### セッションが保持されない

- NEXTAUTH_SECRETが設定されているか確認
- クッキーがブロックされていないか確認

## 参考リンク

- [NextAuth.js公式ドキュメント](https://next-auth.js.org/)
- [Google OAuth 2.0設定ガイド](https://developers.google.com/identity/protocols/oauth2)
