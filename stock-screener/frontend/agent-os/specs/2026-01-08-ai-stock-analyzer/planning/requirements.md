# Spec Requirements: AI株式分析ツール

## 初期説明

既存の株式スクリーニングツールを完全に置き換え、OpenAI GPT-4o miniを活用したAI駆動型の株式分析ツールを構築します。日本株と米国株を対象に、毎朝自動的に分析を実行し、買い/売り/ホールド推奨と信頼度スコア、詳細な理由を提供します。

## 要件ディスカッション

### 第一ラウンド質問

**Q1:** 分析対象銘柄の範囲について教えてください。日本株のみ、米国株のみ、または両方を対象としますか？
**Answer:** 日本株と米国株の両方を対象とします。市場別にランキング表示を行います。

**Q2:** AI分析の深度について、財務指標のみでの分析か、それともセクター情報や株価トレンドも含めた総合的な分析を想定していますか?
**Answer:** 財務指標 + セクター情報 + 株価トレンド（過去30日）を含めた総合的な分析を行います。

**Q3:** バッチ処理のタイミングについて、毎日実行するのか、週次実行なのか、また実行時刻は何時頃を想定していますか?
**Answer:** 毎朝7時に実行します。月曜日から金曜日のみ（市場営業日に合わせて）実行します。

**Q4:** 画面構成について、既存のスクリーニングツールは残したまま新しいAI分析タブを追加するのか、完全に置き換えるのか、どちらでしょうか?
**Answer:** 既存のスクリーニングツールは削除し、AI分析ツールのみに完全に置き換えます。

**Q5:** 表示内容について、分析結果にはどのような情報を含めますか？（例：銘柄名、推奨アクション、信頼度スコア、理由の詳細など）
**Answer:**
- ティッカー、銘柄名、現在株価
- 買い/売り推奨（Buy/Sell/Hold）
- AI信頼度スコア（数値、例：85%）
- 推奨理由（短文、テーブル内に表示）
- 詳細解説（長文、クリックで展開モーダルまたはアコーディオン）

**Q6:** データの更新頻度について、リアルタイムで最新のバッチ結果を表示するのか、過去の推奨履歴も閲覧できるようにするのか教えてください。
**Answer:** 最新のバッチ結果を表示します。過去の推奨履歴も日付選択で閲覧可能にします。

**Q7:** エラーハンドリングについて、AI分析が失敗した場合のフォールバック処理（例：前回の結果を表示、エラーメッセージのみ表示など）はどうしますか?
**Answer:** エラーメッセージを表示するのみとします。フォールバックは不要です。

**Q8:** スコープ外として、今回実装しない機能はありますか？（例：ポートフォリオ分析、アラート通知、銘柄詳細ページなど）
**Answer:** 以下は今回実装しません：
- ポートフォリオ分析
- アラート通知
- 銘柄詳細ページ
- SNSシェア機能
- コメント機能
- ログイン機能（将来的に検討）

### 既存コード参照

**類似機能の特定:**
- Feature: stock-screener プロジェクト全体 - Path: `/Users/kouheikameyama/development/investment/stock-screener/frontend`
- 再利用可能なコンポーネント: React + TypeScriptベースのコンポーネント、テーブル表示、データフェッチングロジック
- 参照可能なバックエンドロジック: Node.js + Express + TypeScript、Yahoo Finance API統合

### フォローアップ質問

**フォローアップ1:** ビジュアルアセットについて、デザインモックアップやワイヤーフレームはありますか?
**Answer:** ビジュアルアセットはありません。モダンでクリーンなデザインで実装してください。

**フォローアップ2:** 使用するAIモデルについて、OpenAI GPT-4o miniで確定でよろしいですか? コスト最適化のため、より軽量なモデルの検討は必要ですか?
**Answer:** OpenAI GPT-4o miniで確定です。コストとパフォーマンスのバランスが取れています。

## ビジュアルアセット

### 提供されたファイル:
ビジュアルアセットは提供されていません。

### ビジュアルインサイト:
モダンでクリーンなデザインを実装する必要があります。以下のデザイン原則を推奨します：
- ミニマルで直感的なUI
- レスポンシブデザイン（デスクトップ、タブレット、モバイル対応）
- アクセシブルなカラースキーム（Buy=緑、Sell=赤、Hold=黄色/グレー）
- データテーブルは見やすく、ソート・フィルター機能付き
- ローディング状態の明確な表示
- エラーメッセージの適切な配置

## 要件サマリー

### 機能要件

#### 1. AI分析エンジン
- **OpenAI GPT-4o mini統合**: 財務データ、セクター情報、株価トレンドを基に分析
- **分析対象**: 日本株と米国株（主要銘柄、具体的なリストは実装時に定義）
- **分析出力**:
  - 推奨アクション: Buy / Sell / Hold
  - 信頼度スコア: 0-100%の数値
  - 推奨理由（短文）: 100-200文字程度
  - 詳細解説（長文）: 500-1000文字程度

#### 2. バッチ処理システム
- **実行スケジュール**:
  - 毎朝7:00 AM（日本時間 JST）
  - 月曜日〜金曜日のみ（市場営業日）
  - 土日・祝日はスキップ
- **処理フロー**:
  1. Yahoo Finance APIから最新の株価データ取得（過去30日分）
  2. 財務指標データの取得
  3. セクター情報の取得
  4. OpenAI APIへデータ送信、分析リクエスト
  5. AI分析結果の受信・パース
  6. データベースへの保存（タイムスタンプ付き）
- **エラーハンドリング**:
  - API失敗時はログに記録し、管理者に通知（実装方法は後で定義）
  - リトライロジック: 3回まで再試行（1分間隔）

#### 3. フロントエンド表示
- **メイン画面構成**:
  - ヘッダー: アプリタイトル、最終更新日時
  - 市場選択タブ: 日本株 / 米国株
  - データテーブル:
    - カラム: ティッカー | 銘柄名 | 現在株価 | 推奨 | 信頼度 | 理由 | アクション（詳細表示ボタン）
    - ソート機能: 各カラムでソート可能
    - フィルター機能: 推奨アクション（Buy/Sell/Hold）でフィルター
  - 詳細モーダル/アコーディオン:
    - クリック時に詳細解説を表示
    - グラフ表示（過去30日の株価トレンド、オプション）
- **レスポンシブデザイン**:
  - デスクトップ: フルテーブル表示
  - タブレット: 一部カラムを折りたたみ
  - モバイル: カード形式表示

#### 4. データ履歴表示
- **日付選択機能**:
  - カレンダーまたはドロップダウンで過去の日付を選択
  - 選択した日付の分析結果を表示
  - 過去30日分のデータを保持
- **比較機能（オプション、将来的に検討）**:
  - 複数日付の推奨を並べて表示

#### 5. エラーハンドリング
- **バッチ処理エラー**: ログに記録、フロントエンドにはエラーメッセージ表示
- **データ取得エラー**: 「データ取得に失敗しました。しばらくしてから再度お試しください。」
- **AI分析エラー**: 「AI分析に失敗しました。管理者に連絡してください。」

### 再利用可能性の機会

#### 既存コードベースからの再利用
- **フロントエンドコンポーネント**:
  - React + TypeScript プロジェクト構造
  - データテーブルコンポーネント（もし既存であれば）
  - モーダル/アコーディオンコンポーネント
  - ローディングスピナー
- **バックエンドパターン**:
  - Express + TypeScript のAPI構造
  - Yahoo Finance API統合ロジック
  - Prismaを使用したデータベース操作
- **ユーティリティ**:
  - 日付フォーマット関数
  - エラーハンドリングミドルウェア
  - 環境変数管理

### スコープ境界

**スコープ内:**
- AI駆動型の株式分析（Buy/Sell/Hold推奨）
- 日本株・米国株の両市場対応
- バッチ処理による自動分析（毎朝7時、月〜金）
- 分析結果のテーブル表示（ソート・フィルター機能付き）
- 詳細解説の表示（モーダル/アコーディオン）
- 過去の分析履歴の閲覧（過去30日分）
- エラーメッセージ表示
- レスポンシブデザイン

**スコープ外:**
- ポートフォリオ分析機能
- リアルタイムアラート通知
- 個別銘柄の詳細ページ
- SNSシェア機能
- ユーザーコメント機能
- ログイン/認証機能（将来的に検討）
- カスタムアラート設定
- バックテスト機能
- リアルタイム株価更新（バッチ処理のみ）

### 技術的考慮事項

#### 1. OpenAI API統合

**API設定:**
- **モデル**: GPT-4o mini
- **プロンプト設計**:
  ```
  あなたは株式アナリストです。以下のデータを基に、この銘柄に対する推奨（Buy/Sell/Hold）と信頼度スコア（0-100%）、理由を提供してください。

  銘柄: {ticker}
  銘柄名: {name}
  現在株価: {current_price}
  セクター: {sector}
  過去30日の株価データ: {price_history}
  財務指標:
  - PER: {pe_ratio}
  - PBR: {pb_ratio}
  - ROE: {roe}
  - 配当利回り: {dividend_yield}

  出力形式（JSON）:
  {
    "recommendation": "Buy" | "Sell" | "Hold",
    "confidence_score": 85,
    "reason_short": "短い理由（100-200文字）",
    "reason_detailed": "詳細な理由（500-1000文字）"
  }
  ```

**コスト最適化:**
- バッチ処理で一度に複数銘柄を処理（API呼び出し回数削減）
- トークン数を最適化（不要なデータは送信しない）
- レート制限対応（リクエスト間隔を調整）

**エラーハンドリング:**
- APIタイムアウト: 30秒
- リトライロジック: 3回まで、指数バックオフ
- レスポンスパース失敗時の処理

#### 2. バッチ処理実装

**スケジューラー:**
- **推奨ツール**: node-cron または node-schedule
- **設定例**:
  ```typescript
  import cron from 'node-cron';

  // 毎朝7時、月〜金のみ実行
  cron.schedule('0 7 * * 1-5', async () => {
    console.log('Starting AI stock analysis batch job...');
    await runStockAnalysisBatch();
  }, {
    timezone: 'Asia/Tokyo'
  });
  ```

**バッチ処理フロー:**
1. 対象銘柄リストの取得（DBまたは設定ファイルから）
2. 各銘柄のデータ収集（並列処理、Promise.all使用）
3. OpenAI APIで分析（レート制限考慮、順次処理）
4. 結果をDBに保存（トランザクション使用）
5. ログ記録（成功/失敗、処理時間）

**並列処理最適化:**
- Yahoo Finance APIからのデータ取得: 並列処理（Promise.all）
- OpenAI API呼び出し: レート制限を考慮して順次処理または制限付き並列処理（p-limit使用）

#### 3. データベース設計

**Prismaスキーマ案:**

```prisma
// schema.prisma

model Stock {
  id           String   @id @default(uuid())
  ticker       String   @unique
  name         String
  market       String   // 'JP' or 'US'
  sector       String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  analyses     Analysis[]
  priceHistory PriceHistory[]

  @@index([market])
}

model Analysis {
  id               String   @id @default(uuid())
  stockId          String
  stock            Stock    @relation(fields: [stockId], references: [id])

  analysisDate     DateTime @default(now())
  recommendation   String   // 'Buy', 'Sell', 'Hold'
  confidenceScore  Int      // 0-100
  reasonShort      String   @db.Text
  reasonDetailed   String   @db.Text

  currentPrice     Float
  peRatio          Float?
  pbRatio          Float?
  roe              Float?
  dividendYield    Float?

  createdAt        DateTime @default(now())

  @@index([stockId, analysisDate])
  @@index([analysisDate])
}

model PriceHistory {
  id        String   @id @default(uuid())
  stockId   String
  stock     Stock    @relation(fields: [stockId], references: [id])

  date      DateTime
  open      Float
  high      Float
  low       Float
  close     Float
  volume    BigInt

  createdAt DateTime @default(now())

  @@unique([stockId, date])
  @@index([stockId, date])
}

model BatchJobLog {
  id           String   @id @default(uuid())
  jobDate      DateTime
  status       String   // 'success', 'partial_success', 'failure'
  totalStocks  Int
  successCount Int
  failureCount Int
  errorMessage String?  @db.Text
  duration     Int      // ミリ秒

  createdAt    DateTime @default(now())

  @@index([jobDate])
}
```

**マイグレーション戦略:**
- 初期マイグレーション: テーブル作成
- データシード: 主要銘柄リスト（日本株: トヨタ、ソニー、ソフトバンクなど、米国株: AAPL, GOOGL, MSFTなど）

#### 4. API設計

**エンドポイント一覧:**

```typescript
// GET /api/analyses/latest
// 最新の分析結果を取得
// Query params:
//   - market: 'JP' | 'US' (optional, デフォルトは全て)
//   - recommendation: 'Buy' | 'Sell' | 'Hold' (optional, フィルター用)
// Response:
{
  "analyses": [
    {
      "id": "uuid",
      "stock": {
        "ticker": "AAPL",
        "name": "Apple Inc.",
        "market": "US",
        "sector": "Technology"
      },
      "analysisDate": "2026-01-08T07:00:00Z",
      "recommendation": "Buy",
      "confidenceScore": 85,
      "reasonShort": "強い財務基盤と成長見込み",
      "reasonDetailed": "...",
      "currentPrice": 150.25,
      "peRatio": 25.3,
      "pbRatio": 5.2,
      "roe": 32.5,
      "dividendYield": 0.5
    },
    // ...
  ],
  "lastUpdateDate": "2026-01-08T07:00:00Z"
}

// GET /api/analyses/history
// 過去の分析結果を取得
// Query params:
//   - date: 'YYYY-MM-DD' (required)
//   - market: 'JP' | 'US' (optional)
// Response: 上記と同様

// GET /api/analyses/:id
// 特定の分析の詳細を取得（詳細モーダル用）
// Response:
{
  "analysis": {
    "id": "uuid",
    "stock": { ... },
    "analysisDate": "2026-01-08T07:00:00Z",
    "recommendation": "Buy",
    "confidenceScore": 85,
    "reasonShort": "...",
    "reasonDetailed": "...",
    "currentPrice": 150.25,
    "financials": { ... },
    "priceHistory": [
      { "date": "2026-01-07", "close": 148.50 },
      // ...past 30 days
    ]
  }
}

// GET /api/stocks
// 銘柄リスト取得（管理用）
// Response:
{
  "stocks": [
    { "id": "uuid", "ticker": "AAPL", "name": "Apple Inc.", "market": "US" },
    // ...
  ]
}

// GET /api/batch-jobs/status
// バッチジョブの状態取得
// Response:
{
  "lastJob": {
    "jobDate": "2026-01-08T07:00:00Z",
    "status": "success",
    "totalStocks": 50,
    "successCount": 48,
    "failureCount": 2,
    "duration": 120000
  }
}
```

**APIミドルウェア:**
- エラーハンドリングミドルウェア
- ロギングミドルウェア（リクエスト/レスポンスログ）
- CORS設定（フロントエンドのオリジンを許可）

#### 5. フロントエンド技術スタック

**React + TypeScript:**
- **状態管理**: React Context API または Zustand（軽量な状態管理）
- **データフェッチング**: Axios または Fetch API、React Query（キャッシング・リフェッチ対応）
- **UIコンポーネント**:
  - オプション1: Material-UI (MUI) - モダンでカスタマイズ可能
  - オプション2: Ant Design - 豊富なコンポーネント
  - オプション3: カスタムコンポーネント（Tailwind CSS使用）
- **テーブルライブラリ**: React Table (TanStack Table) - ソート・フィルター機能付き
- **チャート**: Recharts または Chart.js（株価トレンドグラフ用）
- **日付選択**: react-datepicker

**ファイル構成案:**
```
src/
├── components/
│   ├── AnalysisTable.tsx
│   ├── AnalysisDetailModal.tsx
│   ├── MarketTabs.tsx
│   ├── FilterBar.tsx
│   ├── StockChart.tsx
│   └── ErrorMessage.tsx
├── pages/
│   ├── HomePage.tsx
│   └── HistoryPage.tsx
├── services/
│   ├── api.ts (API呼び出し)
│   └── types.ts (型定義)
├── hooks/
│   ├── useAnalyses.ts
│   └── useStockHistory.ts
├── utils/
│   ├── formatters.ts (日付・通貨フォーマット)
│   └── constants.ts
└── App.tsx
```

#### 6. モダンデザインガイドライン

**カラーパレット:**
- **プライマリカラー**: ダークブルー (#1E3A8A) - ヘッダー、アクセント
- **セカンダリカラー**: ライトグレー (#F3F4F6) - 背景
- **アクション色**:
  - Buy: 緑 (#10B981)
  - Sell: 赤 (#EF4444)
  - Hold: 黄色/グレー (#F59E0B / #6B7280)
- **テキスト**: ダークグレー (#111827)

**タイポグラフィ:**
- **フォント**: Inter、Roboto、またはシステムフォント
- **サイズ**:
  - ヘッダー: 24px-32px (bold)
  - サブヘッダー: 18px-20px (semi-bold)
  - 本文: 14px-16px (regular)
  - キャプション: 12px-14px (light)

**スペーシング:**
- コンポーネント間: 16px-24px
- セクション間: 32px-48px
- パディング: 12px-16px

**UI要素:**
- **ボタン**: 角丸（4px-8px）、ホバーエフェクト、シャドウ
- **カード**: 白背景、シャドウ（subtle）、角丸
- **テーブル**: ゼブラストライプ（交互背景色）、ホバー行ハイライト
- **モーダル**: オーバーレイ（半透明黒）、中央配置、アニメーション

**アクセシビリティ:**
- ARIA属性の適切な使用
- キーボードナビゲーション対応
- カラーコントラスト比 WCAG AA準拠
- スクリーンリーダー対応

#### 7. データソース統合

**Yahoo Finance API:**
- **ライブラリ**: yahoo-finance2 (Node.js)
- **取得データ**:
  - 株価履歴（過去30日）
  - 財務指標（PER, PBR, ROE, 配当利回り）
  - セクター情報
- **レート制限対応**: リクエスト間隔を調整（1秒間隔など）

**データ更新フロー:**
1. バッチジョブ開始
2. 対象銘柄リストをDBから取得
3. 各銘柄のYahoo Finance APIからデータ取得
4. 取得データをPriceHistoryテーブルに保存
5. OpenAI APIで分析実行
6. 分析結果をAnalysisテーブルに保存

#### 8. エラーハンドリング・ロギング

**エラーカテゴリ:**
- **APIエラー**: Yahoo Finance API、OpenAI API
- **データベースエラー**: Prisma操作失敗
- **バッチジョブエラー**: スケジューラー失敗、タイムアウト

**ロギング戦略:**
- **ログレベル**: ERROR, WARN, INFO, DEBUG
- **ロギングライブラリ**: Winston または Pino
- **ログ出力先**: コンソール + ファイル（logs/app.log）
- **ログローテーション**: 日次、7日間保持

**エラー通知（将来的に検討）:**
- 管理者にメール送信
- Slack通知
- Sentryなどのエラートラッキングツール統合

#### 9. テスト戦略

**バックエンドテスト:**
- **ユニットテスト**: Jest、各サービス関数のテスト
- **統合テスト**: API エンドポイントのテスト（Supertest使用）
- **バッチジョブテスト**: モック化したAPI呼び出しでのテスト

**フロントエンドテスト:**
- **コンポーネントテスト**: React Testing Library
- **E2Eテスト**: Cypress または Playwright（オプション）

**テストカバレッジ目標:**
- バックエンド: 80%以上
- フロントエンド: 70%以上

#### 10. デプロイメント・環境設定

**環境変数:**
```env
# OpenAI
OPENAI_API_KEY=sk-...

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/stock_analyzer

# Yahoo Finance (もし必要なら)
YAHOO_FINANCE_API_KEY=...

# Server
PORT=3001
NODE_ENV=development

# Frontend
REACT_APP_API_BASE_URL=http://localhost:3001/api
```

**デプロイ環境（推奨）:**
- **バックエンド**: Heroku, Render, AWS EC2
- **フロントエンド**: Vercel, Netlify
- **データベース**: Heroku Postgres, AWS RDS, Supabase

**CI/CD:**
- GitHub Actions でのテスト自動実行
- デプロイ前のビルドチェック

#### 11. セキュリティ考慮事項

**API キー管理:**
- 環境変数で管理、コードにハードコーディングしない
- .envファイルを.gitignoreに追加

**CORS設定:**
- フロントエンドのオリジンのみ許可

**レート制限:**
- API エンドポイントにレート制限を設定（express-rate-limit使用）

**入力バリデーション:**
- APIリクエストパラメータのバリデーション（Joi または Zod使用）

#### 12. パフォーマンス最適化

**バックエンド:**
- データベースクエリの最適化（インデックス使用）
- API レスポンスのキャッシング（Redis使用、オプション）
- バッチ処理の並列化

**フロントエンド:**
- React Queryでのデータキャッシング
- コンポーネントの遅延ロード（React.lazy）
- 画像最適化（もし使用する場合）
- コード分割（Webpack/Vite設定）

## 実装優先順位

### フェーズ1: 基盤構築（Week 1-2）
1. データベーススキーマ設計・マイグレーション
2. バックエンドAPI基本構造（Express + TypeScript）
3. Yahoo Finance API統合
4. 基本的なフロントエンド構造（React + TypeScript）

### フェーズ2: AI分析機能（Week 2-3）
1. OpenAI API統合
2. プロンプト設計・最適化
3. バッチ処理ロジック実装
4. スケジューラー設定

### フェーズ3: フロントエンド実装（Week 3-4）
1. データテーブルコンポーネント
2. 市場タブ切り替え
3. ソート・フィルター機能
4. 詳細モーダル表示

### フェーズ4: 履歴機能・仕上げ（Week 4-5）
1. 過去データ閲覧機能
2. エラーハンドリング強化
3. UI/UXブラッシュアップ
4. レスポンシブデザイン対応

### フェーズ5: テスト・デプロイ（Week 5-6）
1. ユニットテスト・統合テスト
2. パフォーマンステスト
3. 本番環境デプロイ
4. モニタリング設定

## 成功基準

1. **機能完全性**: すべての要件機能が正常に動作
2. **AI分析精度**: 信頼度スコアが適切に算出される
3. **バッチ処理安定性**: 毎朝7時に自動実行、成功率95%以上
4. **ユーザー体験**: 直感的なUI、3秒以内のページロード
5. **エラーハンドリング**: すべてのエラーケースで適切なメッセージ表示
6. **レスポンシブ**: デスクトップ、タブレット、モバイルで正常表示

## 次のステップ

要件収集が完了しました。次は以下のステップに進みます：

1. **仕様書作成**: 詳細な技術仕様書を作成
2. **プロトタイプ設計**: データベーススキーマとAPIエンドポイントの最終確認
3. **開発開始**: フェーズ1から順次実装

---

**ドキュメント作成日**: 2026-01-08
**最終更新日**: 2026-01-08
