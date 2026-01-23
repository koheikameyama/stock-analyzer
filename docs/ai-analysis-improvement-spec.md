# AI株式分析品質向上 仕様書

## 概要

現在の15銘柄AI分析の品質を向上させ、より精度の高い投資判断を提供する。

## 現状の課題

### 1. 情報源の限定
- **現状**: 基本的な財務指標のみ（PER、PBR、ROE、配当利回り）
- **課題**: リアルタイム情報がなく、市場動向やニュースを反映できていない

### 2. 予測精度の低さ
- **現状**: 過去のスナップショットデータのみで分析
- **課題**: トレンド分析や将来予測が不十分

### 3. 相対評価の欠如
- **現状**: 個別銘柄の絶対評価のみ
- **課題**: セクター内での相対的な魅力度が不明

## 改善提案

### フェーズ1: 株価トレンド分析（優先度: 高）

#### 目的
過去の株価データから将来のトレンドを予測し、売買タイミングの精度を向上

#### 実装内容

##### 1. テクニカル指標の計算
```python
def calculate_technical_indicators(price_history: List[Dict]) -> Dict:
    """
    テクニカル指標を計算

    Args:
        price_history: 過去の株価データ（直近90日分）

    Returns:
        Dict: {
            "sma_5": 5日移動平均,
            "sma_25": 25日移動平均,
            "sma_75": 75日移動平均,
            "rsi_14": RSI(14日),
            "macd": MACD,
            "bollinger_bands": ボリンジャーバンド
        }
    """
```

**指標の説明:**
- **移動平均（SMA）**: トレンドの方向性を判断
  - 5日 < 25日 < 75日 → 上昇トレンド
  - 5日 > 25日 > 75日 → 下降トレンド

- **RSI（相対力指数）**: 買われすぎ/売られすぎを判断
  - RSI > 70 → 買われすぎ（売りシグナル）
  - RSI < 30 → 売られすぎ（買いシグナル）

- **MACD**: トレンドの転換点を検出

- **ボリンジャーバンド**: 価格変動の範囲を判断

##### 2. トレンド判定
```python
def analyze_trend(price_history: List[Dict]) -> Dict:
    """
    トレンドを分析

    Returns:
        Dict: {
            "trend": "上昇" | "下降" | "横ばい",
            "strength": "強い" | "中程度" | "弱い",
            "signals": ["ゴールデンクロス発生", ...],
            "prediction": "短期的に上昇継続の見込み"
        }
    """
```

##### 3. AIプロンプトへの統合
```python
prompt = f"""
【株価トレンド分析】
- 直近30日のトレンド: {trend}
- トレンドの強さ: {strength}
- 5日移動平均: {sma_5}円
- 25日移動平均: {sma_25}円
- RSI(14日): {rsi} ({rsi_signal})
- シグナル: {signals}
- 予測: {prediction}

この情報を踏まえて、売買タイミングも含めて分析してください。
"""
```

#### メリット
- ✅ DBの既存データ（PriceHistory）を活用できる
- ✅ 外部API不要でコスト増なし
- ✅ 実装が比較的容易
- ✅ 売買タイミングの精度向上

#### 実装工数
- 見積もり: 4-6時間
  - テクニカル指標計算: 2時間
  - トレンド判定ロジック: 1時間
  - AIプロンプト改善: 1時間
  - テスト・デバッグ: 1-2時間

---

### フェーズ2: セクター比較分析（優先度: 中）

#### 目的
同じセクターの他銘柄と比較し、相対的な魅力度を評価

#### 実装内容

##### 1. セクター統計の計算
```python
def get_sector_statistics(sector: str) -> Dict:
    """
    セクター全体の統計を取得

    Args:
        sector: セクター名（例: "電気機器"）

    Returns:
        Dict: {
            "count": 銘柄数,
            "avg_pe_ratio": 平均PER,
            "avg_pb_ratio": 平均PBR,
            "avg_roe": 平均ROE,
            "avg_dividend_yield": 平均配当利回り,
            "top_performers": [上位3銘柄]
        }
    """
```

##### 2. 相対評価の算出
```python
def calculate_relative_valuation(stock: Stock, sector_stats: Dict) -> Dict:
    """
    セクター内での相対評価

    Returns:
        Dict: {
            "pe_ratio_vs_sector": "割安" | "平均的" | "割高",
            "pb_ratio_vs_sector": "割安" | "平均的" | "割高",
            "roe_vs_sector": "高い" | "平均的" | "低い",
            "sector_rank": "上位20%" | "中位" | "下位20%",
            "competitive_advantage": "セクター内で高ROE・低PERの魅力的な銘柄"
        }
    """
```

##### 3. AIプロンプトへの統合
```python
prompt = f"""
【セクター比較】
- 所属セクター: {sector}（全{sector_count}銘柄）
- PER: {pe_ratio}（セクター平均: {sector_avg_pe}） → {pe_evaluation}
- PBR: {pb_ratio}（セクター平均: {sector_avg_pb}） → {pb_evaluation}
- ROE: {roe}%（セクター平均: {sector_avg_roe}%） → {roe_evaluation}
- セクター内順位: {sector_rank}
- 競争優位性: {competitive_advantage}

セクター内での相対的な魅力度を評価してください。
"""
```

#### メリット
- ✅ DBクエリのみで実装可能
- ✅ 相対評価により投資判断の精度向上
- ✅ セクターローテーション戦略に対応

#### 実装工数
- 見積もり: 3-4時間
  - セクター統計取得: 1時間
  - 相対評価ロジック: 1時間
  - AIプロンプト改善: 1時間
  - テスト: 1時間

---

### フェーズ3: Web検索機能（優先度: 中）

#### 目的
最新の企業ニュースや市場動向を取得し、リアルタイム情報を反映

#### アーキテクチャ: 2段階構成

##### ステップ1: ニュース収集バッチ（1時間ごと）
定期的にニュースを収集してDBに蓄積

```python
# batch/collect_company_news.py
def collect_news_batch():
    """
    1時間ごとに実行されるニュース収集バッチ

    処理フロー:
    1. AI分析対象の15銘柄を取得
    2. 各銘柄のニュースを検索
    3. DBに保存（重複チェック）
    4. 古いニュース（30日以上前）を削除
    """
    stocks = get_ai_analysis_targets()

    for stock in stocks:
        news = search_company_news(stock.ticker, stock.name)
        save_news_to_db(stock.id, news)

    cleanup_old_news(days=30)
```

##### ステップ2: AI分析時にDBから取得
バッチ分析実行時、DBから最新ニュースを取得

```python
# batch/batch_analysis.py
def analyze_with_openai(stock_data: StockData):
    """AI分析実行"""

    # DBから直近7日間のニュースを取得（高速）
    recent_news = get_news_from_db(stock_data.stock_id, days=7)

    # センチメント分析（DBに保存済み）
    sentiment = analyze_news_sentiment(recent_news)

    # AIプロンプトに含める
    prompt = f"""
    【最新ニュース（直近7日間）】
    {format_news_summary(recent_news)}

    【ニュースセンチメント】
    - ポジティブ: {sentiment['positive']}件
    - ネガティブ: {sentiment['negative']}件
    - 中立: {sentiment['neutral']}件
    - 全体の傾向: {sentiment['overall']}

    最新ニュースを踏まえて分析してください。
    """
```

#### DBスキーマ追加

```prisma
// 企業ニュースモデル
model CompanyNews {
  id        String   @id @default(uuid())

  // 外部キー - Stock
  stockId   String   @map("stock_id")
  stock     Stock    @relation(fields: [stockId], references: [id], onDelete: Cascade)

  // ニュース情報
  title     String
  url       String   @unique  // 重複チェック用
  summary   String?  // 要約（200文字程度）
  source    String   // "Yahoo Finance", "日経新聞" など

  // センチメント分析結果
  sentiment String   // "positive", "negative", "neutral"

  // 公開日時
  publishedAt DateTime @map("published_at")

  // タイムスタンプ
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // インデックス
  @@index([stockId, publishedAt])
  @@index([publishedAt])
  @@map("company_news")
}

// Stockモデルにリレーション追加
model Stock {
  // ... 既存フィールド

  news CompanyNews[]  // 追加
}
```

#### ニュース収集バッチのスケジュール

```yaml
# .github/workflows/collect-news.yml
name: Collect Company News

on:
  schedule:
    # 1時間ごとに実行（平日9-18時のみ）
    - cron: '0 0-9 * * 1-5'  # UTC 0-9時 = JST 9-18時（月-金）

  workflow_dispatch:  # 手動実行も可能

jobs:
  collect-news:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          cd batch
          pip install -r requirements.txt

      - name: Collect company news
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEWS_API_KEY: ${{ secrets.NEWS_API_KEY }}
        run: |
          cd batch
          python collect_company_news.py
```

#### API候補（優先順位順）

##### 1. **Yahoo Finance（推奨）**
```python
import yfinance as yf

def get_yahoo_news(ticker: str) -> List[Dict]:
    """Yahoo Financeからニュース取得（無料）"""
    stock = yf.Ticker(ticker + ".T")  # 東証の場合
    news = stock.news  # 直近ニュース取得

    return [{
        "title": item["title"],
        "url": item["link"],
        "publishedAt": item["providerPublishTime"],
        "source": "Yahoo Finance"
    } for item in news]
```
- ✅ **無料**
- ✅ yfinanceライブラリで簡単に取得
- ⚠️ ニュース数が少ない場合あり

##### 2. **Google Custom Search API**
```python
import requests

def google_news_search(company_name: str, api_key: str) -> List[Dict]:
    """Google検索でニュース取得"""
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": api_key,
        "cx": "検索エンジンID",
        "q": f"{company_name} 株価 ニュース",
        "dateRestrict": "d7",  # 直近7日間
        "num": 5
    }
    response = requests.get(url, params=params)
    # ...
```
- ✅ 豊富なニュース
- ⚠️ 100クエリ/日まで無料、それ以降$5/1000クエリ
- ⚠️ API Key管理が必要

##### 3. **NewsAPI**
```python
from newsapi import NewsApiClient

def newsapi_search(company_name: str, api_key: str) -> List[Dict]:
    """NewsAPIでニュース取得"""
    newsapi = NewsApiClient(api_key=api_key)
    articles = newsapi.get_everything(
        q=company_name,
        language='ja',
        sort_by='publishedAt',
        from_param=(datetime.now() - timedelta(days=7)).isoformat()
    )
    # ...
```
- ✅ 開発者向け無料枠あり（100リクエスト/日）
- ✅ JSON形式で取得しやすい
- ⚠️ 日本語ニュースが少ない

#### センチメント分析

```python
def analyze_sentiment(text: str) -> str:
    """
    ニュースのセンチメント分析

    方法1: キーワードベース（簡易）
    - ポジティブワード: "増益", "好調", "上昇", "拡大"
    - ネガティブワード: "減益", "低迷", "下落", "縮小"

    方法2: OpenAI API（精度高い）
    - gpt-4o-miniで分析（追加費用わずか）
    """
    # 簡易版
    positive_keywords = ["増益", "好調", "上昇", "拡大", "最高益"]
    negative_keywords = ["減益", "低迷", "下落", "縮小", "赤字"]

    pos_count = sum(1 for w in positive_keywords if w in text)
    neg_count = sum(1 for w in negative_keywords if w in text)

    if pos_count > neg_count:
        return "positive"
    elif neg_count > pos_count:
        return "negative"
    else:
        return "neutral"
```

#### メリット（DB蓄積方式）

- ✅ **高速**: AI分析時はDBから取得（APIコール不要）
- ✅ **コスト削減**: ニュース収集は1時間に15銘柄のみ（1日360リクエスト）
- ✅ **安定性**: API障害時も過去のニュースを利用可能
- ✅ **履歴管理**: 過去のニュースも参照可能
- ✅ **レート制限回避**: ニュース収集とAI分析を分離

#### コスト試算（Yahoo Finance使用の場合）

- **ニュース収集**: 無料（yfinance使用）
- **DB容量**: 1ニュース約1KB × 15銘柄 × 5件/銘柄 × 30日 = 約2.2MB（微々たる量）
- **追加費用**: なし

#### 実装工数
- 見積もり: 5-7時間
  - DBスキーマ追加: 1時間
  - ニュース収集バッチ実装: 2時間
  - センチメント分析実装: 1時間
  - AI分析への統合: 1時間
  - GitHub Actions設定: 30分
  - テスト: 1-1.5時間

---

## 改善されたAIプロンプト例

### Before（現在）
```python
prompt = f"""
【銘柄情報】
- ティッカー: {ticker}
- 企業名: {company_name}
- 現在価格: {current_price}円
- PER: {pe_ratio}
- PBR: {pb_ratio}
- ROE: {roe}%
- 配当利回り: {dividend_yield}%

JSON形式で回答してください。
"""
```

### After（改善後）
```python
prompt = f"""
あなたは上級投資アドバイザーです。以下の情報を総合的に分析してください。

【基本情報】
- ティッカー: {ticker}
- 企業名: {company_name}
- セクター: {sector}
- 現在価格: {current_price}円

【財務指標】
- PER: {pe_ratio}（セクター平均: {sector_avg_pe}） → {pe_evaluation}
- PBR: {pb_ratio}（セクター平均: {sector_avg_pb}） → {pb_evaluation}
- ROE: {roe}%（セクター平均: {sector_avg_roe}%） → {roe_evaluation}
- 配当利回り: {dividend_yield}%

【株価トレンド分析】
- 直近30日のトレンド: {trend}（{strength}）
- 5日移動平均: {sma_5}円（現在価格{sma_5_diff}）
- 25日移動平均: {sma_25}円（現在価格{sma_25_diff}）
- RSI(14日): {rsi} → {rsi_signal}
- シグナル: {signals}
- 予測: {prediction}

【セクター比較】
- セクター内順位: {sector_rank}
- 競争優位性: {competitive_advantage}

【分析指示】
1. 財務健全性の評価（PER、PBR、ROEから）
2. セクター内での魅力度（相対評価）
3. 株価トレンドから見た売買タイミング
4. 今後3ヶ月の見通し
5. リスク要因

以下のJSON形式で、詳細な分析結果を返してください：
{{
  "recommendation": "Buy" | "Hold" | "Sell",
  "confidence_score": 0-100,
  "reason": "400文字程度の詳細な分析（上記1-5を含む）",
  "timing": "今すぐ買い" | "押し目待ち" | "様子見" | "売却検討",
  "risk_level": "低" | "中" | "高",
  "target_price": 目標株価（数値）,
  "stop_loss": 損切りライン（数値）
}}
"""
```

---

## 実装優先順位

### 推奨実装順序

1. **フェーズ1: 株価トレンド分析**（必須）
   - 理由: 既存データ活用、コスト増なし、効果大
   - 工数: 4-6時間
   - 効果: ⭐⭐⭐⭐⭐

2. **フェーズ2: セクター比較分析**（推奨）
   - 理由: DBクエリのみ、実装容易、相対評価で精度向上
   - 工数: 3-4時間
   - 効果: ⭐⭐⭐⭐

3. **フェーズ3: Web検索機能（DB蓄積方式）**（推奨）
   - 理由: **DB蓄積により高速・低コスト**、リアルタイム情報を反映
   - 工数: 5-7時間
   - 費用: **無料**（Yahoo Finance使用時）
   - 効果: ⭐⭐⭐⭐⭐

### 総工数見積もり
- **最小構成**（フェーズ1のみ）: 4-6時間
- **推奨構成**（フェーズ1+2）: 7-10時間
- **フル構成**（全フェーズ）: **12-17時間**（DB蓄積方式により短縮）

### DB蓄積方式の追加メリット
- ✅ ニュース収集とAI分析を分離 → レート制限回避
- ✅ 1時間ごとの自動更新 → 常に最新情報を保持
- ✅ Yahoo Finance使用で**追加費用ゼロ**
- ✅ AI分析時は高速（DBから取得）
- ✅ API障害時も過去データで対応可能

---

## 期待される効果

### 定量的効果
- **分析精度向上**: 現在の信頼度スコア平均60 → 75へ向上（推定）
- **情報量増加**: プロンプト文字数 300文字 → 800文字
- **レスポンス品質**: 推奨理由 200文字 → 400文字

### 定性的効果
- ✅ 売買タイミングの明示化
- ✅ セクターローテーション戦略への対応
- ✅ リスク評価の明確化
- ✅ 目標株価・損切りラインの提示

---

## 技術スタック

### 必要なライブラリ
```python
# フェーズ1: トレンド分析
pandas>=2.0.0          # データ処理
numpy>=1.24.0          # 数値計算
ta>=0.11.0             # テクニカル指標（TA-Lib軽量版）

# フェーズ2: セクター比較
# 既存のpsycopg2で対応可能

# フェーズ3: Web検索（オプション）
requests>=2.31.0       # HTTP通信
beautifulsoup4>=4.12.0 # HTMLパース
```

### requirements.txt への追加
```
# AI分析品質向上
pandas==2.3.3
numpy==2.4.1
ta==0.11.0
```

---

## リスクと対策

### リスク1: API費用の増加
- **対策**: フェーズ1・2を優先実装（外部API不要）
- **モニタリング**: OpenAI APIトークン使用量を監視

### リスク2: 分析時間の増加
- **対策**: テクニカル指標計算を非同期処理化
- **目標**: 1銘柄あたり+2秒以内

### リスク3: データ不足による誤分析
- **対策**: データ不足時は従来の分析にフォールバック
- **検証**: 過去データでバックテスト実施

---

## 次のステップ

1. **仕様レビュー**: この仕様書の内容を確認・承認
2. **ブランチ作成**: `feature/improve-ai-analysis` ブランチを作成
3. **フェーズ1実装**: 株価トレンド分析の実装開始
4. **テスト**: 実際の15銘柄でテスト実行
5. **評価**: 分析品質の改善度を検証
6. **本番適用**: PR作成 → レビュー → マージ

---

## 参考資料

### テクニカル指標の計算方法
- [TA-Lib Documentation](https://ta-lib.org/)
- [pandas-ta GitHub](https://github.com/twopirllc/pandas-ta)

### 投資指標の解説
- [日本取引所グループ - 投資指標の見方](https://www.jpx.co.jp/)
- [楽天証券 - テクニカル指標入門](https://www.rakuten-sec.co.jp/)
