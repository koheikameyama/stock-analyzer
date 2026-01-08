# AI株式分析ツール (Stock Analyzer)

AIによる日本株・米国株の投資分析ツール。シンプルで使いやすい、個人投資家向けのアプリケーションです。

## ✨ 特徴

- 🤖 **AI分析**: OpenAI GPTによる銘柄分析
- 📊 **リアルタイムデータ**: Yahoo Finance APIと連携
- 🌏 **日本株・米国株対応**: ワンクリックで市場切り替え
- 📱 **レスポンシブデザイン**: どのデバイスでも快適に使用可能
- ⚡ **シンプル構成**: Next.js統合で1コマンドで起動

## 🛠 技術スタック

**フルスタック**
- Next.js 15 (App Router + Turbopack)
- React 19
- TypeScript
- Tailwind CSS v3

**データベース**
- PostgreSQL
- Prisma ORM

**外部API**
- Yahoo Finance (株価データ)
- OpenAI GPT (AI分析)

**その他**
- TanStack Query (データフェッチング)
- Python (バッチ処理)

## 🚀 セットアップ

### 前提条件

- Node.js 18以上
- Python 3.9以上 (バッチ分析用)
- PostgreSQL 14以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/koheikameyama/stock-analyzer.git
cd stock-analyzer

# 依存関係のインストール
npm install

# PostgreSQLのインストールと起動
brew install postgresql@16
brew services start postgresql@16

# データベースの作成
createdb stock_analyzer_dev

# 環境変数の設定
cp .env.example .env
# .envファイルを編集
# 1. DATABASE_URLを設定（usernameを自分のユーザー名に変更）
#    DATABASE_URL="postgresql://username@localhost:5432/stock_analyzer_dev"
# 2. OpenAI APIキーを設定
#    OPENAI_API_KEY=your_actual_api_key_here

# データベースのセットアップ
npx prisma generate  # Prisma Clientを生成
npx prisma db push   # データベーススキーマを適用

# Python依存関係のインストール
pip3 install psycopg2-binary yfinance python-dotenv openai

# （オプション）初期データを投入する場合
# npm run db:seed
```

**重要**: `.env`ファイルに実際のOpenAI APIキーを設定してください。APIキーは[OpenAI Platform](https://platform.openai.com/api-keys)で取得できます。

### 起動

```bash
# 開発サーバーを起動
npm run dev
```

ブラウザで `http://localhost:3000` にアクセス

## 📖 使い方

1. ブラウザでアプリケーションを開く
2. 日本株/米国株のタブを選択
3. 推奨フィルター（Buy/Sell/Hold）を選択
4. AI分析結果を確認
5. カードをクリックして詳細を表示

## 🔧 その他のコマンド

```bash
# データベース管理画面を開く
npm run db:studio

# Prisma Clientを再生成
npm run db:generate

# バッチ分析を実行（Python）
npm run batch:analysis

# 本番ビルド
npm run build

# 本番環境で起動
npm start
```

## 📁 プロジェクト構造

```
stock-analyzer/
├── app/                    # Next.js App Router
│   ├── api/               # APIエンドポイント
│   │   ├── analyses/     # 分析API
│   │   └── batch-jobs/   # バッチジョブAPI
│   ├── globals.css       # グローバルスタイル
│   ├── layout.tsx        # ルートレイアウト
│   ├── page.tsx          # ホームページ
│   └── providers.tsx     # React Queryプロバイダー
├── components/            # Reactコンポーネント
├── hooks/                # カスタムフック
├── lib/                  # ユーティリティ・サービス層
│   ├── analysis.service.ts
│   ├── batch.service.ts
│   ├── prisma.ts         # Prismaシングルトン
│   └── ...
├── types/                # TypeScript型定義
├── prisma/               # Prismaスキーマ
│   └── schema.prisma
├── scripts/              # バッチスクリプト
│   └── batch_analysis.py
├── docs/                 # ドキュメント
│   ├── DEPLOYMENT.md
│   └── ...
└── package.json
```

## 🗄 データベース

PostgreSQLを使用しています。

### データベースセットアップ
```bash
# PostgreSQLのインストール（Macの場合）
brew install postgresql@16
brew services start postgresql@16

# データベースの作成
createdb stock_analyzer_dev

# .envファイルでDATABASE_URLを設定
# DATABASE_URL="postgresql://username@localhost:5432/stock_analyzer_dev"

# スキーマを適用
npx prisma db push
```

### よく使うコマンド
```bash
# データベース管理画面を開く（データの閲覧・編集）
npm run db:studio

# Prisma Clientの再生成（スキーマ変更後）
npm run db:generate

# データベーススキーマを同期（スキーマ変更後）
npm run db:push

# PostgreSQLの起動/停止
brew services start postgresql@16
brew services stop postgresql@16
```

### データベースをリセットしたい場合
```bash
# データベースを削除して再作成
dropdb stock_analyzer_dev
createdb stock_analyzer_dev

# スキーマを再適用
npx prisma db push

# （オプション）初期データを再投入
npm run db:seed
```

## 🐍 バッチ分析

バッチ分析は、yfinanceを使って株価データを取得し、OpenAI APIで分析を実行します。

### 実行方法

```bash
# Python依存関係がインストールされていることを確認
pip3 install psycopg2-binary yfinance python-dotenv openai

# バッチ分析の実行
npm run batch:analysis

# または直接Pythonスクリプトを実行
python3 scripts/batch_analysis.py
```

### 注意事項
- OpenAI APIキーが必要です（`.env`に設定）
- PostgreSQLが起動している必要があります
- 銘柄データが`stocks`テーブルに登録されている必要があります

## 🌐 デプロイ

### Vercel（推奨）

```bash
# Vercelにデプロイ
npx vercel

# 環境変数を設定
# - DATABASE_URL (本番用のデータベース)
# - OPENAI_API_KEY
```

### その他のプラットフォーム

```bash
# ビルド
npm run build

# 起動
npm start
```

## ⚠️ 免責事項

本ツールは投資助言ではありません。投資判断は自己責任で行ってください。

- データソース: Yahoo Finance API
- AI分析: OpenAI GPT
- 提供されるデータの精度には限界があります
- 重要な投資判断を行う際は、複数の情報源を参照してください

## 📝 ライセンス

MIT

## 🤝 貢献

プルリクエストを歓迎します。大きな変更を加える場合は、まずissueを開いて変更内容を議論してください。
