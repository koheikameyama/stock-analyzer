# AI株式分析ツール（ai-stock-analyzer）

## 機能説明

OpenAI GPT-4o miniを使用して、株式銘柄を自動分析し、初心者投資家向けにおすすめ銘柄ランキングと買い/売り推奨を表示するツール。

## 主要な特徴

- AIが毎日定時に全銘柄を分析（バッチ処理）
- おすすめ銘柄トップ10をランキング表示
- 各銘柄に対する買い/売り推奨
- AIによる分析理由・解説を表示
- ログイン不要で誰でも見られる
- Yahoo Finance APIからデータ取得
- PostgreSQLに分析結果を保存

## 技術スタック

- **フロントエンド**: React + TypeScript
- **バックエンド**: Node.js + Express + TypeScript
- **AI**: OpenAI GPT-4o mini
- **データベース**: PostgreSQL + Prisma
- **データソース**: Yahoo Finance API
