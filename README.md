# 銘柄スクリーニングツール

AIによる日本株・米国株の投資分析ツール。シンプルで使いやすい、個人投資家向けのアプリケーションです。

## ✨ 特徴

- 🤖 **AI分析**: OpenAI GPTによる銘柄分析
- 📊 **リアルタイムデータ**: Yahoo Finance APIと連携
- 🌏 **日本株・米国株対応**: ワンクリックで市場切り替え
- 📱 **レスポンシブデザイン**: どのデバイスでも快適に使用可能
- ⚡ **シンプル構成**: Next.js統合で1コマンドで起動

## 🛠 技術スタック

**フルスタック**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4

**データベース**
- SQLite (ローカルファイル)
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
- npm または yarn

### インストール

```bash
# 依存関係のインストール
npm install

# データベースのセットアップ
npx prisma db push

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してOpenAI APIキーを設定（オプション）
```

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
stock-screener/
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
├── dev.db                # SQLiteデータベース
└── package.json
```

## 🗄 データベース

SQLiteを使用しているため、PostgreSQLのセットアップは不要です。

- ファイル: `dev.db`
- 管理: `npm run db:studio`
- マイグレーション: `npx prisma db push`

## 🐍 バッチ分析

バッチ分析を実行するには、Pythonの依存関係をインストールします：

```bash
# Pythonの仮想環境を作成（オプション）
python3 -m venv venv
source venv/bin/activate  # Windowsの場合: venv\Scripts\activate

# Python依存関係のインストール
pip install yfinance psycopg2-binary python-dotenv

# バッチ分析の実行
npm run batch:analysis
```

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
