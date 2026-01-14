# 高精度分析システム設計書

## 概要

外部データソース（ニュース、SNS、スクレイピング）を活用し、より精度の高い株式分析を実現するシステムの設計ドキュメント。

**作成日**: 2026-01-14
**更新日**: 2026-01-14
**バージョン**: 1.1
**ステータス**: 設計段階

**変更履歴**:
- v1.1 (2026-01-14): Mastraハイブリッド構成戦略を追加
- v1.0 (2026-01-14): 初版作成

---

## 1. システムアーキテクチャ

### 1.1 全体構成図

```
┌─────────────────────────────────────────────────────────┐
│                    外部データソース                        │
├─────────────────────────────────────────────────────────┤
│  ① Yahoo! Finance  ② 企業IRページ  ③ X (Twitter)      │
│  ④ NewsAPI        ⑤ 日経電子版    ⑥ Alpha Vantage     │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│              データ収集レイヤー (Python)                   │
├─────────────────────────────────────────────────────────┤
│  • Scraper Manager    (スクレイピング統括)               │
│  • API Client Manager (API統合管理)                      │
│  • Rate Limiter       (レート制限管理)                    │
│  • Data Validator     (データ検証)                        │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│              データ処理レイヤー (Python)                   │
├─────────────────────────────────────────────────────────┤
│  • Sentiment Analyzer      (センチメント分析)             │
│  • News Impact Analyzer    (ニュース影響度分析)           │
│  • Technical Indicator     (テクニカル指標計算)           │
│  • Data Aggregator         (データ集約)                   │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│              データ統合レイヤー                            │
├─────────────────────────────────────────────────────────┤
│  • Enhanced Stock Analyzer (拡張版AI分析エンジン)         │
│    - 既存の財務分析                                       │
│    + センチメントスコア                                    │
│    + ニュースインパクトスコア                              │
│    + テクニカル指標                                       │
│    + ソーシャルトレンド                                   │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│                データベース (PostgreSQL)                   │
├─────────────────────────────────────────────────────────┤
│  • 既存テーブル (Stock, Analysis, PriceHistory)           │
│  • 新規テーブル (NewsData, SentimentData, etc)           │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│              API / フロントエンド (Next.js)                │
└─────────────────────────────────────────────────────────┘
```

---

## 2. データソース戦略

### 2.1 データソース優先順位

| 優先度 | データソース | タイプ | 無料枠 | 信頼性 | 実装難易度 |
|--------|--------------|--------|--------|--------|------------|
| 🥇 高 | Yahoo! Finance | スクレイピング | ✅ | 高 | 低 |
| 🥇 高 | 企業IRページ | スクレイピング | ✅ | 最高 | 中 |
| 🥇 高 | NewsAPI | API | 100件/日 | 高 | 低 |
| 🥈 中 | Alpha Vantage | API | 25件/日 | 高 | 低 |
| 🥈 中 | Finnhub | API | 60/分 | 高 | 低 |
| 🥉 低 | X (Twitter) | API | 有料 | 中 | 中 |
| 🥉 低 | 日経電子版 | スクレイピング | ⚠️ 要確認 | 高 | 高 |

### 2.2 各データソースの役割

#### Yahoo! Finance
- **取得データ**: ニュース見出し、株価、出来高、アナリスト評価
- **更新頻度**: 1日1回
- **用途**: 基本的な市場情報とニュース見出し

#### 企業IRページ
- **取得データ**: 決算短信、適時開示、IRニュース
- **更新頻度**: 1日1回
- **用途**: 公式な企業情報（最も信頼性が高い）

#### NewsAPI
- **取得データ**: 日本の経済ニュース記事
- **更新頻度**: 1日1回（無料枠考慮）
- **用途**: 広範なニュースのセンチメント分析

#### X (Twitter)
- **取得データ**: 銘柄関連ツイート、センチメント
- **更新頻度**: 1日1回（コスト考慮）
- **用途**: リアルタイム市場の雰囲気（フェーズ3）

### 2.3 Mastraハイブリッド構成戦略

#### 2.3.1 Mastraとは

**Mastra**は、GatsbyチームによるTypeScript/JavaScript用のAIエージェントフレームワークです。

- 🎯 **エージェント・ワークフロー管理**に特化
- 🧠 **メモリシステム**が強力（LongMemEvalで80%精度）
- 🔄 **Human-in-the-loop**（一時停止・承認・再開機能）
- 📊 40以上のLLMプロバイダー統合（OpenAI、Anthropic、Geminiなど）
- 🔓 オープンソース（Apache 2.0ライセンス）
- 🚀 2024年創設、Y Combinator支援

公式サイト: https://mastra.ai/
GitHub: https://github.com/mastra-ai/mastra

#### 2.3.2 ハイブリッド構成アーキテクチャ

**Python（バッチ処理）とMastra（エージェント）の組み合わせ**を採用します。

```
┌─────────────────────────────────────────────────────────┐
│           Python バッチ処理レイヤー                       │
│           (フェーズ1-2で実装)                            │
├─────────────────────────────────────────────────────────┤
│  • データ収集（スクレイピング）                           │
│  • センチメント分析（日本語BERT - Hugging Face）         │
│  • テクニカル指標計算（pandas/numpy）                     │
│  • 基礎的なAI分析（GPT-4o mini）                         │
└────────────┬────────────────────────────────────────────┘
             │ 分析結果を保存
             ▼
┌─────────────────────────────────────────────────────────┐
│               PostgreSQL データベース                      │
│  • Stock, Analysis, PriceHistory                        │
│  • NewsData, SentimentData, TechnicalIndicator         │
└────────────┬────────────────────────────────────────────┘
             │ データ取得
             ▼
┌─────────────────────────────────────────────────────────┐
│         Next.js + Mastra エージェントレイヤー             │
│         (フェーズ3で追加)                                │
├─────────────────────────────────────────────────────────┤
│  • 投資アドバイザーエージェント                           │
│  • ポートフォリオ最適化エージェント                        │
│  • リアルタイムQ&Aエージェント                            │
│  • カスタム分析ワークフロー                               │
└─────────────────────────────────────────────────────────┘
```

#### 2.3.3 Python vs Mastra 使い分け指針

| 機能領域 | 使用技術 | 理由 |
|---------|---------|------|
| **データ収集** | Python | `beautifulsoup4`、`requests`が成熟 |
| **スクレイピング** | Python | ライブラリが豊富、実装が容易 |
| **センチメント分析** | Python | 日本語BERTモデルの精度が高い |
| **テクニカル計算** | Python | `pandas`、`numpy`の計算速度 |
| **バッチ分析** | Python | 既存のエコシステムを活用 |
| **定期実行** | Python | GitHub Actionsでシンプルに実装 |
| | | |
| **対話型アドバイス** | Mastra | エージェントの自律判断が得意 |
| **ユーザーQ&A** | Mastra | 会話フローの管理が容易 |
| **カスタム分析** | Mastra | 動的なワークフロー構築 |
| **リアルタイム処理** | Mastra | Next.jsとの統合が簡単 |
| **複雑な意思決定** | Mastra | マルチエージェント協調 |

#### 2.3.4 Mastraの利点

**✅ 技術的メリット**
- TypeScript統一（Next.jsプロジェクトとシームレス）
- エージェントの自律性（必要なデータを動的に判断）
- ワークフロー管理が簡単（グラフベース）
- Human-in-the-loopが標準搭載
- 40以上のLLMプロバイダー対応

**✅ ユーザー体験向上**
- リアルタイム対話型分析
- ユーザー個別の投資スタイルに対応
- 「なぜこの推奨なのか」を深掘り可能
- ポートフォリオ最適化の提案

#### 2.3.5 Python維持の理由

**✅ Pythonエコシステムの強み**
- データ処理：`pandas`、`numpy`の計算速度
- スクレイピング：`beautifulsoup4`、`playwright`の成熟度
- NLP：日本語BERTモデルの選択肢が豊富
- 機械学習：`scikit-learn`、`transformers`
- テクニカル分析：専門ライブラリ（`ta`など）

**❌ TypeScript/JavaScriptの弱み**
- 日本語NLP対応が限定的
- 数値計算のパフォーマンス不足
- データ分析ライブラリの成熟度が低い

#### 2.3.6 フェーズ別実装戦略

**フェーズ1-2: Python基盤構築**（4-5週間）
```
目標: データ収集・分析の基礎を確立

✓ Yahoo! Finance、企業IR、NewsAPIからデータ収集
✓ 日本語BERTでセンチメント分析
✓ テクニカル指標計算（RSI、MACD、ボリンジャーバンド）
✓ 統合スコアリング（財務40%、センチメント30%、テクニカル20%、ニュース10%）
✓ 基礎的なAI分析レポート生成

→ この時点で既存サービスが大幅に強化される
```

**フェーズ3: Mastraエージェント追加**（3-4週間）
```
目標: 対話型・パーソナライズ機能の実装

✓ 投資アドバイザーエージェント
  - ユーザー質問への回答
  - 分析結果の深掘り
  - 比較分析（銘柄A vs 銘柄B）

✓ ポートフォリオ最適化エージェント
  - リスク許容度に基づく推奨
  - 分散投資の提案
  - リバランス提案

✓ カスタム分析ワークフロー
  - ユーザー指定条件での動的スクリーニング
  - 特定セクターの深掘り分析

→ サービスが対話型AIアドバイザーに進化
```

#### 2.3.7 実装例

**Python側（フェーズ1-2）**
```python
# batch/analyzers/enhanced_stock_analyzer.py
class EnhancedStockAnalyzer:
    def analyze(self, ticker: str):
        # 1. データベースから最新情報取得
        stock_data = self.get_stock_data(ticker)
        sentiment = self.get_sentiment_data(ticker)
        technical = self.get_technical_data(ticker)

        # 2. スコアリング
        scores = self.calculate_composite_score(
            stock_data, sentiment, technical
        )

        # 3. AI分析
        analysis = self.generate_ai_analysis(scores)

        # 4. データベース保存
        self.save_analysis(analysis)
```

**Mastra側（フェーズ3）**
```typescript
// web/lib/mastra/agents/investmentAdvisor.ts
import { Agent } from '@mastra/core';
import { openai } from '@mastra/core/llm';

export const investmentAdvisor = new Agent({
  name: 'investment-advisor',
  model: openai('gpt-4o-mini'),
  instructions: `
    あなたは日本株の投資アドバイザーです。
    データベースの分析結果を参照し、
    ユーザーの質問に初心者にもわかりやすく答えてください。
  `,
  tools: [
    // ツール1: 分析結果取得
    {
      name: 'get-stock-analysis',
      description: '銘柄の最新分析結果を取得',
      parameters: {
        ticker: { type: 'string', description: '銘柄コード' }
      },
      execute: async ({ ticker }) => {
        const analysis = await prisma.analysis.findFirst({
          where: { stock: { ticker } },
          include: { stock: true },
          orderBy: { analyzedAt: 'desc' }
        });
        return analysis;
      }
    },

    // ツール2: センチメントトレンド取得
    {
      name: 'get-sentiment-trend',
      description: '過去のセンチメント推移を取得',
      parameters: {
        ticker: { type: 'string' },
        days: { type: 'number', default: 30 }
      },
      execute: async ({ ticker, days }) => {
        const trend = await prisma.sentimentData.findMany({
          where: {
            stock: { ticker },
            date: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
          },
          orderBy: { date: 'desc' }
        });
        return trend;
      }
    },

    // ツール3: 類似銘柄検索
    {
      name: 'find-similar-stocks',
      description: '似た特性を持つ銘柄を検索',
      parameters: {
        ticker: { type: 'string' },
        sector: { type: 'string' }
      },
      execute: async ({ ticker, sector }) => {
        const similar = await prisma.stock.findMany({
          where: { sector },
          include: {
            analyses: {
              orderBy: { analyzedAt: 'desc' },
              take: 1
            }
          }
        });
        return similar;
      }
    }
  ]
});

// 使用例
const response = await investmentAdvisor.run(
  "トヨタ自動車とホンダ、どちらが今買いですか？理由も教えてください。"
);
```

**Next.js API Route統合**
```typescript
// web/app/api/ai-advisor/route.ts
import { investmentAdvisor } from '@/lib/mastra/agents/investmentAdvisor';

export async function POST(req: Request) {
  const { question, userId } = await req.json();

  // エージェント実行
  const response = await investmentAdvisor.run(question, {
    context: {
      userId,
      timestamp: new Date()
    }
  });

  return Response.json({
    answer: response.text,
    sources: response.toolCalls
  });
}
```

#### 2.3.8 コスト影響

**追加コスト（フェーズ3）**

| 項目 | 詳細 | 月額コスト |
|------|------|-----------|
| Mastraフレームワーク | オープンソース | ¥0 |
| 追加のOpenAI API使用 | ユーザーQ&A（想定: 100会話/日） | ¥1,000〜¥3,000 |
| Vercelサーバーレス | Next.js関数実行時間 | ¥0（無料枠内） |

**合計**: フェーズ3追加で約 ¥1,000〜¥3,000/月

#### 2.3.9 この戦略のメリット

✅ **リスク分散**: Pythonで安定した基盤を構築してから拡張
✅ **段階的投資**: 効果を確認しながら機能追加
✅ **両方の強みを活用**: データ処理はPython、UXはMastra
✅ **コスト最適化**: 必要な機能だけを追加
✅ **技術的柔軟性**: 将来的にどちらかに寄せることも可能

---

## 3. データフロー設計

### 3.1 データ収集フロー

```
1. スケジューラー起動（毎日 AM 6:00）
   ↓
2. データ収集開始
   ├─ Yahoo! Finance: 15銘柄のニュース収集 (並列)
   ├─ 企業IR: 15銘柄のIR情報収集 (並列)
   └─ NewsAPI: 銘柄関連ニュース検索 (順次)
   ↓
3. データ検証・クリーニング
   ↓
4. データベース保存 (NewsData, SentimentData)
   ↓
5. 分析処理トリガー
```

### 3.2 分析フロー

```
1. 既存の財務データ分析
   ↓
2. センチメント分析
   ├─ ニュース見出しのセンチメントスコア算出
   ├─ IR情報のポジティブ/ネガティブ判定
   └─ 総合センチメントスコア算出 (-100 ~ +100)
   ↓
3. テクニカル分析
   ├─ RSI (相対力指数) 計算
   ├─ MACD (移動平均収束拡散) 計算
   └─ ボリンジャーバンド計算
   ↓
4. 統合分析
   ├─ 財務スコア (40%)
   ├─ センチメントスコア (30%)
   ├─ テクニカルスコア (20%)
   └─ ニュースインパクトスコア (10%)
   ↓
5. AI最終判断 (GPT-4o mini)
   ↓
6. 分析結果保存
```

---

## 4. データモデル拡張

### 4.1 新規テーブル定義

#### NewsData (ニュースデータ)

```prisma
model NewsData {
  id            String   @id @default(cuid())
  stockId       String
  stock         Stock    @relation(fields: [stockId], references: [id])

  source        String   // "yahoo", "newsapi", "ir"
  title         String
  content       String?  @db.Text
  url           String?
  publishedAt   DateTime

  // センチメント分析結果
  sentimentScore Float?  // -1.0 ~ 1.0
  sentimentLabel String? // "positive", "negative", "neutral"

  // 重要度
  impactScore   Float?   // 0.0 ~ 1.0

  createdAt     DateTime @default(now())

  @@index([stockId, publishedAt])
  @@index([source])
}
```

#### SentimentData (センチメント集計)

```prisma
model SentimentData {
  id                String   @id @default(cuid())
  stockId           String
  stock             Stock    @relation(fields: [stockId], references: [id])

  date              DateTime @db.Date

  // センチメントスコア
  overallScore      Float    // -100 ~ +100
  newsScore         Float?   // ニュース由来
  socialScore       Float?   // SNS由来（将来）
  irScore           Float?   // IR情報由来

  // カウント
  positiveCount     Int      @default(0)
  negativeCount     Int      @default(0)
  neutralCount      Int      @default(0)

  createdAt         DateTime @default(now())

  @@unique([stockId, date])
  @@index([date])
}
```

#### TechnicalIndicator (テクニカル指標)

```prisma
model TechnicalIndicator {
  id                String   @id @default(cuid())
  stockId           String
  stock             Stock    @relation(fields: [stockId], references: [id])

  date              DateTime @db.Date

  // テクニカル指標
  rsi               Float?   // 相対力指数 (0-100)
  macd              Float?   // MACD
  macdSignal        Float?   // MACDシグナル
  macdHistogram     Float?   // MACDヒストグラム

  bollingerUpper    Float?   // ボリンジャーバンド上限
  bollingerMiddle   Float?   // ボリンジャーバンド中央
  bollingerLower    Float?   // ボリンジャーバンド下限

  sma20             Float?   // 20日移動平均
  sma50             Float?   // 50日移動平均

  createdAt         DateTime @default(now())

  @@unique([stockId, date])
  @@index([date])
}
```

#### SocialMediaData (SNSデータ - フェーズ3)

```prisma
model SocialMediaData {
  id                String   @id @default(cuid())
  stockId           String
  stock             Stock    @relation(fields: [stockId], references: [id])

  platform          String   // "twitter", "reddit"
  content           String   @db.Text
  author            String?
  url               String?
  postedAt          DateTime

  // エンゲージメント
  likeCount         Int?
  retweetCount      Int?
  replyCount        Int?

  // センチメント
  sentimentScore    Float?
  sentimentLabel    String?

  createdAt         DateTime @default(now())

  @@index([stockId, postedAt])
  @@index([platform])
}
```

### 4.2 既存テーブルの拡張

#### Analysis テーブルに追加フィールド

```prisma
model Analysis {
  // ... 既存フィールド

  // 新規追加
  sentimentScore       Float?  // センチメントスコア
  technicalScore       Float?  // テクニカルスコア
  newsImpactScore      Float?  // ニュースインパクトスコア

  // スコアの内訳（透明性のため）
  financialWeight      Float?  @default(0.4)
  sentimentWeight      Float?  @default(0.3)
  technicalWeight      Float?  @default(0.2)
  newsWeight           Float?  @default(0.1)

  // メタデータ
  dataSourcesUsed      String[] // ["yahoo", "newsapi", "ir"]
}
```

---

## 5. コンポーネント設計

### 5.1 ディレクトリ構造

```
batch/
├── config/
│   ├── dataSources.py          # データソース設定
│   └── rateLimits.py            # レート制限設定
│
├── collectors/                  # データ収集レイヤー
│   ├── __init__.py
│   ├── base_collector.py        # 基底クラス
│   ├── yahoo_collector.py       # Yahoo! Finance収集
│   ├── ir_collector.py          # IR情報収集
│   ├── newsapi_collector.py     # NewsAPI収集
│   └── twitter_collector.py     # X収集（フェーズ3）
│
├── processors/                  # データ処理レイヤー
│   ├── __init__.py
│   ├── sentiment_analyzer.py    # センチメント分析
│   ├── news_analyzer.py         # ニュース分析
│   ├── technical_analyzer.py    # テクニカル分析
│   └── data_aggregator.py       # データ集約
│
├── analyzers/                   # 分析レイヤー
│   ├── __init__.py
│   ├── enhanced_stock_analyzer.py  # 拡張版分析エンジン
│   └── scoring_engine.py        # スコアリングエンジン
│
├── utils/
│   ├── rate_limiter.py          # レート制限ユーティリティ
│   ├── text_processor.py        # テキスト処理
│   └── validator.py             # データ検証
│
└── jobs/
    ├── collect_news.py          # ニュース収集ジョブ
    ├── analyze_sentiment.py     # センチメント分析ジョブ
    ├── calculate_technical.py   # テクニカル計算ジョブ
    └── run_enhanced_analysis.py # 統合分析ジョブ
```

### 5.2 主要コンポーネント詳細

#### 5.2.1 BaseCollector (基底クラス)

```python
# batch/collectors/base_collector.py

from abc import ABC, abstractmethod
from typing import List, Dict, Any
import time

class BaseCollector(ABC):
    """データ収集の基底クラス"""

    def __init__(self, rate_limit: float = 1.0):
        self.rate_limit = rate_limit  # リクエスト間隔（秒）
        self.last_request_time = 0

    def rate_limit_wait(self):
        """レート制限の待機処理"""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.rate_limit:
            time.sleep(self.rate_limit - elapsed)
        self.last_request_time = time.time()

    @abstractmethod
    def collect(self, ticker: str) -> List[Dict[str, Any]]:
        """データ収集の実装（サブクラスで実装）"""
        pass

    @abstractmethod
    def validate(self, data: Dict[str, Any]) -> bool:
        """データ検証（サブクラスで実装）"""
        pass
```

#### 5.2.2 SentimentAnalyzer

```python
# batch/processors/sentiment_analyzer.py

from typing import Dict, List
from transformers import pipeline  # Hugging Face

class SentimentAnalyzer:
    """センチメント分析エンジン"""

    def __init__(self):
        # 日本語センチメント分析モデル
        self.model = pipeline(
            "sentiment-analysis",
            model="daigo/bert-base-japanese-sentiment"
        )

    def analyze_text(self, text: str) -> Dict[str, float]:
        """
        テキストのセンチメント分析

        Returns:
            {
                "score": -1.0 ~ 1.0,
                "label": "positive" | "negative" | "neutral",
                "confidence": 0.0 ~ 1.0
            }
        """
        result = self.model(text)[0]

        # ラベルをスコアに変換
        if result['label'] == 'ポジティブ':
            score = result['score']
            label = 'positive'
        elif result['label'] == 'ネガティブ':
            score = -result['score']
            label = 'negative'
        else:
            score = 0.0
            label = 'neutral'

        return {
            "score": score,
            "label": label,
            "confidence": result['score']
        }

    def analyze_news_batch(self, news_list: List[Dict]) -> Dict:
        """
        ニュース群の総合センチメント分析

        Returns:
            {
                "overall_score": -100 ~ 100,
                "positive_count": int,
                "negative_count": int,
                "neutral_count": int,
                "details": List[Dict]
            }
        """
        results = []
        positive_count = 0
        negative_count = 0
        neutral_count = 0

        for news in news_list:
            sentiment = self.analyze_text(news['title'])
            results.append({
                **news,
                "sentiment": sentiment
            })

            if sentiment['label'] == 'positive':
                positive_count += 1
            elif sentiment['label'] == 'negative':
                negative_count += 1
            else:
                neutral_count += 1

        # 総合スコア計算（-100 ~ 100）
        total = len(results)
        if total == 0:
            overall_score = 0
        else:
            overall_score = (
                (positive_count - negative_count) / total
            ) * 100

        return {
            "overall_score": overall_score,
            "positive_count": positive_count,
            "negative_count": negative_count,
            "neutral_count": neutral_count,
            "details": results
        }
```

#### 5.2.3 TechnicalAnalyzer

```python
# batch/processors/technical_analyzer.py

import pandas as pd
import numpy as np
from typing import Dict, List

class TechnicalAnalyzer:
    """テクニカル指標計算エンジン"""

    def calculate_rsi(self, prices: List[float], period: int = 14) -> float:
        """RSI（相対力指数）計算"""
        df = pd.DataFrame(prices, columns=['close'])
        delta = df['close'].diff()

        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()

        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))

        return float(rsi.iloc[-1])

    def calculate_macd(
        self,
        prices: List[float],
        fast: int = 12,
        slow: int = 26,
        signal: int = 9
    ) -> Dict[str, float]:
        """MACD計算"""
        df = pd.DataFrame(prices, columns=['close'])

        # EMA計算
        ema_fast = df['close'].ewm(span=fast).mean()
        ema_slow = df['close'].ewm(span=slow).mean()

        # MACD計算
        macd = ema_fast - ema_slow
        macd_signal = macd.ewm(span=signal).mean()
        macd_histogram = macd - macd_signal

        return {
            "macd": float(macd.iloc[-1]),
            "signal": float(macd_signal.iloc[-1]),
            "histogram": float(macd_histogram.iloc[-1])
        }

    def calculate_bollinger_bands(
        self,
        prices: List[float],
        period: int = 20,
        std_dev: float = 2.0
    ) -> Dict[str, float]:
        """ボリンジャーバンド計算"""
        df = pd.DataFrame(prices, columns=['close'])

        sma = df['close'].rolling(window=period).mean()
        std = df['close'].rolling(window=period).std()

        upper = sma + (std * std_dev)
        lower = sma - (std * std_dev)

        return {
            "upper": float(upper.iloc[-1]),
            "middle": float(sma.iloc[-1]),
            "lower": float(lower.iloc[-1])
        }

    def calculate_all_indicators(
        self,
        price_history: List[Dict]
    ) -> Dict[str, any]:
        """全テクニカル指標を計算"""
        prices = [float(p['close']) for p in price_history]

        return {
            "rsi": self.calculate_rsi(prices),
            "macd": self.calculate_macd(prices),
            "bollinger": self.calculate_bollinger_bands(prices),
            "sma20": float(pd.Series(prices).rolling(20).mean().iloc[-1]),
            "sma50": float(pd.Series(prices).rolling(50).mean().iloc[-1])
        }
```

#### 5.2.4 EnhancedStockAnalyzer

```python
# batch/analyzers/enhanced_stock_analyzer.py

from typing import Dict, List
import openai

class EnhancedStockAnalyzer:
    """拡張版株式分析エンジン"""

    def __init__(self):
        self.financial_weight = 0.4
        self.sentiment_weight = 0.3
        self.technical_weight = 0.2
        self.news_weight = 0.1

    def calculate_composite_score(
        self,
        financial_data: Dict,
        sentiment_data: Dict,
        technical_data: Dict,
        news_data: List[Dict]
    ) -> Dict[str, float]:
        """
        総合スコア計算

        Returns:
            {
                "composite_score": 0-100,
                "financial_score": 0-100,
                "sentiment_score": 0-100,
                "technical_score": 0-100,
                "news_score": 0-100
            }
        """
        # 各スコア計算
        financial_score = self._calc_financial_score(financial_data)
        sentiment_score = self._normalize_sentiment(sentiment_data['overall_score'])
        technical_score = self._calc_technical_score(technical_data)
        news_score = self._calc_news_impact_score(news_data)

        # 加重平均で総合スコア計算
        composite_score = (
            financial_score * self.financial_weight +
            sentiment_score * self.sentiment_weight +
            technical_score * self.technical_weight +
            news_score * self.news_weight
        )

        return {
            "composite_score": composite_score,
            "financial_score": financial_score,
            "sentiment_score": sentiment_score,
            "technical_score": technical_score,
            "news_score": news_score
        }

    def generate_enhanced_analysis(
        self,
        stock_data: Dict,
        scores: Dict,
        news_summary: str,
        technical_summary: str
    ) -> Dict:
        """
        AIによる拡張分析レポート生成
        """
        prompt = f"""
あなたは日本株の投資アドバイザーです。以下の情報を総合的に分析し、投資判断を提示してください。

【銘柄情報】
企業名: {stock_data['name']}
ティッカー: {stock_data['ticker']}
現在価格: ¥{stock_data['current_price']:,.0f}

【財務指標】
PER: {stock_data.get('per', 'N/A')}
PBR: {stock_data.get('pbr', 'N/A')}
ROE: {stock_data.get('roe', 'N/A')}%
配当利回り: {stock_data.get('dividend_yield', 'N/A')}%

【スコア分析】
総合スコア: {scores['composite_score']:.1f}/100
- 財務スコア: {scores['financial_score']:.1f}/100
- センチメントスコア: {scores['sentiment_score']:.1f}/100
- テクニカルスコア: {scores['technical_score']:.1f}/100
- ニュースインパクト: {scores['news_score']:.1f}/100

【最近のニュース】
{news_summary}

【テクニカル分析】
{technical_summary}

上記を踏まえ、以下の形式で分析結果を提示してください：

1. 推奨アクション: Buy/Sell/Hold のいずれか
2. 信頼度: 0-100の数値
3. 理由: 200文字程度の日本語説明（初心者にもわかりやすく）
"""

        # OpenAI API呼び出し
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "あなたは初心者向けの投資アドバイザーです。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        # レスポンス解析
        analysis_text = response.choices[0].message.content

        return self._parse_ai_response(analysis_text, scores)

    def _normalize_sentiment(self, sentiment_score: float) -> float:
        """センチメントスコア（-100~100）を0-100に正規化"""
        return (sentiment_score + 100) / 2

    def _calc_financial_score(self, data: Dict) -> float:
        """財務データからスコア計算（既存ロジック）"""
        # 既存のスコアリングロジックを使用
        pass

    def _calc_technical_score(self, data: Dict) -> float:
        """テクニカル指標からスコア計算"""
        score = 50  # 基準点

        # RSI判定
        rsi = data.get('rsi', 50)
        if rsi < 30:  # 売られすぎ（買いシグナル）
            score += 15
        elif rsi > 70:  # 買われすぎ（売りシグナル）
            score -= 15

        # MACD判定
        macd = data.get('macd', {})
        if macd.get('histogram', 0) > 0:  # ゴールデンクロス
            score += 10
        elif macd.get('histogram', 0) < 0:  # デッドクロス
            score -= 10

        return max(0, min(100, score))

    def _calc_news_impact_score(self, news_list: List[Dict]) -> float:
        """ニュースのインパクトスコア計算"""
        if not news_list:
            return 50

        # 重要度の高いニュースを重視
        weighted_sum = sum(
            news.get('impact_score', 0.5) *
            (1 if news.get('sentiment_label') == 'positive' else -1)
            for news in news_list
        )

        # 0-100に正規化
        score = 50 + (weighted_sum * 50)
        return max(0, min(100, score))
```

---

## 6. 技術スタック

### 6.1 データ収集

| 用途 | ライブラリ | バージョン | 理由 |
|------|-----------|-----------|------|
| HTTPクライアント | `requests` | 最新 | シンプルで安定 |
| スクレイピング | `beautifulsoup4` | 最新 | HTML解析の定番 |
| ブラウザ自動化 | `playwright` | 最新 | 動的コンテンツ対応 |
| API SDK | `tweepy` | 最新 | X API公式SDK |

### 6.2 データ処理

| 用途 | ライブラリ | バージョン | 理由 |
|------|-----------|-----------|------|
| センチメント分析 | `transformers` | 最新 | BERT日本語モデル利用 |
| データ分析 | `pandas` | 最新 | データ処理の定番 |
| 数値計算 | `numpy` | 最新 | 高速計算 |
| テクニカル分析 | `ta` (Technical Analysis) | 最新 | 指標計算ライブラリ |

### 6.3 インフラ

| 用途 | 技術 | 理由 |
|------|------|------|
| データベース | PostgreSQL + Supabase | 既存 |
| タスク管理 | GitHub Actions (Cron) | 無料、簡単 |
| AI API | OpenAI GPT-4o mini | 既存 |
| モニタリング | Sentry | エラー追跡 |

### 6.4 AIエージェント（フェーズ3）

| 用途 | ライブラリ/サービス | バージョン | 理由 |
|------|-------------------|-----------|------|
| エージェントフレームワーク | `@mastra/core` | 最新 | TypeScript統合、エージェント管理 |
| LLM統合 | Mastra LLM Providers | 最新 | 40以上のプロバイダー対応 |
| ワークフロー管理 | Mastra Workflows | 最新 | グラフベースのワークフロー |
| メモリ管理 | Mastra Memory | 最新 | 会話履歴、コンテキスト管理 |
| フロントエンド統合 | Next.js Server Actions | - | シームレスな統合 |

**インストール**
```bash
npm install @mastra/core
```

**主な依存関係**
- TypeScript 5.x
- Next.js 15.x
- React 18.x
- Prisma（既存のDB接続を利用）

---

## 7. スケジューリング戦略

### 7.1 バッチ実行スケジュール

```yaml
# .github/workflows/enhanced-analysis.yml

name: Enhanced Stock Analysis

on:
  schedule:
    # 平日 AM 6:00 JST (UTC 21:00前日)
    - cron: '0 21 * * 0-4'
  workflow_dispatch:  # 手動実行も可能

jobs:
  collect-news:
    runs-on: ubuntu-latest
    steps:
      # 1. ニュース収集（30分）
      - name: Collect News Data
        run: python batch/jobs/collect_news.py

  analyze-sentiment:
    needs: collect-news
    runs-on: ubuntu-latest
    steps:
      # 2. センチメント分析（15分）
      - name: Analyze Sentiment
        run: python batch/jobs/analyze_sentiment.py

  calculate-technical:
    runs-on: ubuntu-latest
    steps:
      # 3. テクニカル指標計算（10分）並行実行OK
      - name: Calculate Technical Indicators
        run: python batch/jobs/calculate_technical.py

  run-enhanced-analysis:
    needs: [analyze-sentiment, calculate-technical]
    runs-on: ubuntu-latest
    steps:
      # 4. 統合分析（30分）
      - name: Run Enhanced Analysis
        run: python batch/jobs/run_enhanced_analysis.py
```

### 7.2 実行時間見積もり

| ジョブ | 処理内容 | 推定時間 | 備考 |
|--------|---------|---------|------|
| collect-news | 15銘柄のニュース収集 | 30分 | レート制限考慮 |
| analyze-sentiment | センチメント分析 | 15分 | GPUなしで推論 |
| calculate-technical | テクニカル指標計算 | 10分 | 数値計算のみ |
| run-enhanced-analysis | AI分析実行 | 30分 | OpenAI API |
| **合計** | | **約1時間30分** | |

---

## 8. コスト試算

### 8.1 月額コスト見積もり

| 項目 | サービス | プラン | 月額コスト |
|------|---------|--------|-----------|
| データ収集 | NewsAPI | 無料枠 | ¥0 |
| データ収集 | Yahoo! Finance | スクレイピング | ¥0 |
| データ収集 | 企業IR | スクレイピング | ¥0 |
| AI分析 | OpenAI API | gpt-4o-mini | ¥3,000 ※1 |
| センチメント分析 | Hugging Face (ローカル) | 無料 | ¥0 |
| インフラ | GitHub Actions | 無料枠 | ¥0 |
| データベース | Supabase | 既存 | ¥0 |
| **合計（フェーズ1-2）** | | | **¥3,000** |

※1: 15銘柄 × 30日 × 約3,000トークン/分析 = 135万トークン/月
    入力: ¥0.15/100万トークン、出力: ¥0.60/100万トークン

### 8.2 フェーズ3追加コスト（X統合時）

| 項目 | サービス | プラン | 月額コスト |
|------|---------|--------|-----------|
| SNSデータ | X API | Basic | ¥14,000 (約$100) |
| **合計（フェーズ3）** | | | **¥17,000** |

### 8.3 スケーリング時のコスト

分析銘柄を50銘柄に拡大した場合：

- OpenAI API: ¥10,000/月
- X API: ¥70,000/月 (Proプラン必要)
- **合計**: ¥80,000/月

---

## 9. リスクと対策

### 9.1 法的リスク

| リスク | 影響度 | 対策 |
|--------|--------|------|
| スクレイピング禁止違反 | 高 | robots.txt確認、利用規約遵守 |
| 著作権侵害 | 高 | タイトルのみ保存、全文は保存しない |
| API利用規約違反 | 中 | 公式SDK使用、レート制限遵守 |

### 9.2 技術的リスク

| リスク | 影響度 | 対策 |
|--------|--------|------|
| スクレイパー破損 | 高 | 定期的なメンテナンス、エラー監視 |
| API制限超過 | 中 | レート制限実装、キュー管理 |
| AIの誤判断 | 中 | 信頼度スコア表示、免責事項明記 |
| データ品質低下 | 中 | データ検証ロジック実装 |

### 9.3 運用リスク

| リスク | 影響度 | 対策 |
|--------|--------|------|
| コスト超過 | 中 | 月次コスト監視、アラート設定 |
| 処理時間超過 | 低 | タイムアウト設定、並列処理 |
| データベース肥大化 | 低 | 古いデータの定期削除（90日保持） |

---

## 10. 実装ロードマップ

### フェーズ1: 基盤構築（1-2週間）

**目標**: ニュース収集とセンチメント分析の基礎実装

- [ ] データモデル拡張（Prisma スキーマ）
- [ ] BaseCollector 実装
- [ ] Yahoo! Finance Collector 実装
- [ ] 企業IR Collector 実装
- [ ] SentimentAnalyzer 実装（日本語BERT）
- [ ] データベース保存機能
- [ ] 単体テスト作成

**成果物**: ニュースデータ収集・保存・分析パイプライン

---

### フェーズ2: 分析強化（2-3週間）

**目標**: テクニカル分析と統合スコアリング

- [ ] TechnicalAnalyzer 実装
  - [ ] RSI計算
  - [ ] MACD計算
  - [ ] ボリンジャーバンド計算
- [ ] NewsAPI統合
- [ ] EnhancedStockAnalyzer 実装
- [ ] スコアリングエンジン実装
- [ ] 既存AI分析との統合
- [ ] フロントエンド拡張
  - [ ] センチメントグラフ表示
  - [ ] テクニカル指標表示
  - [ ] ニュース一覧表示

**成果物**: 多角的な分析結果の表示

---

### フェーズ3: Mastraエージェント導入（3-4週間）

**目標**: 対話型AIアドバイザー機能の実装

**3.1 Mastraセットアップ**
- [ ] Mastraフレームワークのインストール
  ```bash
  npm install @mastra/core
  ```
- [ ] Mastra設定ファイル作成（`web/lib/mastra/config.ts`）
- [ ] エージェント共通ツール実装
  - [ ] データベース接続ツール
  - [ ] 分析結果取得ツール
  - [ ] センチメントトレンド取得ツール

**3.2 投資アドバイザーエージェント**
- [ ] エージェント定義（`web/lib/mastra/agents/investmentAdvisor.ts`）
- [ ] ツール実装
  - [ ] `get-stock-analysis`: 最新分析結果取得
  - [ ] `get-sentiment-trend`: センチメント推移取得
  - [ ] `find-similar-stocks`: 類似銘柄検索
  - [ ] `compare-stocks`: 銘柄比較分析
- [ ] API Route実装（`web/app/api/ai-advisor/route.ts`）
- [ ] フロントエンドチャットUI作成
- [ ] ユニットテスト作成

**3.3 ポートフォリオ最適化エージェント**
- [ ] エージェント定義（`web/lib/mastra/agents/portfolioOptimizer.ts`）
- [ ] ツール実装
  - [ ] `calculate-portfolio-risk`: リスク計算
  - [ ] `suggest-diversification`: 分散投資提案
  - [ ] `rebalance-recommendation`: リバランス提案
- [ ] ユーザーポートフォリオデータモデル追加
- [ ] API Route実装
- [ ] フロントエンドポートフォリオ画面作成

**3.4 カスタム分析ワークフロー**
- [ ] ワークフロー定義（`web/lib/mastra/workflows/customAnalysis.ts`）
- [ ] 動的スクリーニング機能
- [ ] セクター深掘り分析機能
- [ ] カスタム条件設定UI

**3.5 統合とテスト**
- [ ] エージェント間の連携テスト
- [ ] パフォーマンス最適化
- [ ] エラーハンドリング強化
- [ ] ログ・モニタリング設定
- [ ] ユーザー受け入れテスト（UAT）

**3.6 （オプション）SNS統合**
- [ ] X API統合検討（コストと効果を評価）
- [ ] Twitter Collector 実装（必要に応じて）
- [ ] ソーシャルセンチメント分析

**成果物**:
- 対話型AIアドバイザー機能
- ポートフォリオ最適化機能
- カスタム分析ワークフロー
- ユーザーエンゲージメント大幅向上

---

### フェーズ4: 最適化・拡張（継続的）

**目標**: 精度向上とスケーラビリティ

- [ ] 機械学習モデルのファインチューニング
- [ ] 分析銘柄数の拡大（50銘柄以上）
- [ ] 予測精度の検証・改善
- [ ] ユーザーフィードバック機能
- [ ] A/Bテスト実施
- [ ] コスト最適化

---

## 11. 成功指標 (KPI)

### 11.1 精度指標

| 指標 | 目標値 | 測定方法 |
|------|--------|---------|
| 推奨精度 | 70%以上 | 1ヶ月後の株価パフォーマンス |
| センチメント精度 | 80%以上 | 人手評価との一致率 |
| データ取得成功率 | 95%以上 | エラーログ監視 |

### 11.2 運用指標

| 指標 | 目標値 | 測定方法 |
|------|--------|---------|
| バッチ実行成功率 | 98%以上 | GitHub Actions ログ |
| 平均処理時間 | 90分以内 | ジョブ実行時間 |
| API コスト | ¥5,000以内/月 | OpenAI ダッシュボード |

### 11.3 ビジネス指標

| 指標 | 目標値 | 測定方法 |
|------|--------|---------|
| ユーザーエンゲージメント | +30% | 詳細閲覧数 |
| 平均滞在時間 | +40% | アナリティクス |
| サービス継続利用率 | 60%以上 | 週次アクティブユーザー |

---

## 12. まとめ

### 採用戦略: Mastraハイブリッド構成

本設計では、**Python（バッチ処理）+ Mastra（エージェント）のハイブリッド構成**を採用します。

```
フェーズ1-2: Python基盤（4-5週間）
  ↓ 安定した基盤を構築
フェーズ3: Mastra追加（3-4週間）
  ↓ 対話型機能を追加
完成: ハイブリッドシステム
```

### 優先実装事項

**フェーズ1-2（Python基盤）**
1. **Yahoo! Finance + 企業IR** のスクレイピング（無料・安全）
2. **センチメント分析**（Hugging Face 日本語BERT）
3. **テクニカル指標**（RSI, MACD, ボリンジャーバンド）
4. **統合スコアリング**（財務40%、センチメント30%、テクニカル20%、ニュース10%）

**フェーズ3（Mastra統合）**
5. **投資アドバイザーエージェント**（対話型Q&A）
6. **ポートフォリオ最適化エージェント**（リスク分析、分散提案）
7. **カスタム分析ワークフロー**（動的スクリーニング）

### この戦略の利点

✅ **リスク分散**: Pythonで安定した基盤を構築してから拡張
✅ **段階的投資**: 効果を確認しながら機能追加
✅ **両方の強みを活用**: データ処理はPython、UXはMastra
✅ **コスト最適化**: 必要な機能だけを追加（月額¥3,000→¥6,000程度）
✅ **技術的柔軟性**: 将来的にどちらかに寄せることも可能

### 後回し・検討事項

- **X API統合**（コスト高、フェーズ3でオプション）
- **日経電子版**（利用規約要確認）
- **SNSリアルタイム分析**（インフラコスト、効果を見極めてから）

### 推奨アプローチ

**段階的実装** を推奨します：

1. まず**フェーズ1-2でPython基盤**を構築（4-5週間）
   - データ収集・センチメント分析・テクニカル計算
   - この時点で既存サービスが大幅に強化される
2. 実際にデータを見て**精度を検証**
3. 効果が確認できたら**フェーズ3でMastra追加**（3-4週間）
   - 対話型AIアドバイザー機能
   - サービスが対話型に進化、ユーザーエンゲージメント向上
4. ユーザーフィードバックで優先順位調整

### 期待される成果

**フェーズ1-2完了時**:
- 分析精度: 現在比+20%向上
- データソース: 3倍に拡大（財務 → 財務+ニュース+テクニカル）
- 分析の深さ: 定量的スコアリング導入

**フェーズ3完了時**:
- ユーザーエンゲージメント: +50%
- 平均滞在時間: 2倍
- 新機能: 対話型アドバイザー、ポートフォリオ最適化
- サービス差別化: 競合にない対話型機能

---

## 13. 参考リソース

### API ドキュメント
- [NewsAPI](https://newsapi.org/docs)
- [Alpha Vantage](https://www.alphavantage.co/documentation/)
- [Finnhub](https://finnhub.io/docs/api)
- [X API v2](https://developer.twitter.com/en/docs/twitter-api)

### Python ライブラリ
- [Hugging Face Transformers](https://huggingface.co/docs/transformers/)
- [BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)
- [Playwright](https://playwright.dev/python/)
- [TA-Lib](https://ta-lib.github.io/ta-lib-python/)
- [pandas](https://pandas.pydata.org/docs/)
- [numpy](https://numpy.org/doc/)

### Mastra フレームワーク
- [Mastra 公式サイト](https://mastra.ai/)
- [Mastra GitHub](https://github.com/mastra-ai/mastra)
- [Mastra ドキュメント](https://mastra.ai/docs)
- [Mastra エージェントガイド](https://mastra.ai/docs/agents/overview)
- [Mastra ワークショップ](https://mastra.ai/workshops)

### 学習リソース
- [日本語BERTモデル一覧](https://huggingface.co/models?language=ja&pipeline_tag=sentiment-analysis)
- [テクニカル分析入門](https://www.investopedia.com/technical-analysis-4689657)
- [AIエージェント設計パターン](https://www.anthropic.com/research/building-effective-agents)

---

**ドキュメント終わり**
