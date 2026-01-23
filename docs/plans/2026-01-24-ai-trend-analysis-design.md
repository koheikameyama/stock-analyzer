# AI株式分析 - フェーズ1: 株価トレンド分析 設計書

**作成日**: 2026-01-24
**ステータス**: 設計完了
**工数見積もり**: 4-6時間

## 概要

15銘柄AI分析に株価トレンド分析機能を追加し、売買タイミングの精度を向上させる。

## 設計の決定事項

### 1. 技術選定

| 項目 | 選択 | 理由 |
|------|------|------|
| **ライブラリ** | pandas-ta | 無料、Pythonのみで完結、GitHub Actionsで動作確実 |
| **指標セット** | 最小セット | まずシンプルに始めて効果を確認 |
| **判定ロジック** | シンプル判定 | 基本的なトレンド判定を動かしてから拡張 |
| **統合方法** | 既存プロンプトに追加 | リスク最小、既存分析への影響を抑える |

### 2. 計算する指標（最小セット）

- **SMA_5**: 5日移動平均
- **SMA_25**: 25日移動平均
- **RSI_14**: 14日相対力指数

### 3. トレンド判定ロジック（シンプル判定）

```python
def analyze_trend(indicators, current_price):
    """
    シンプルなトレンド判定

    Returns:
        {
            "trend": "上昇" | "下降" | "横ばい",
            "sma_5": float,
            "sma_25": float,
            "rsi": float,
            "rsi_signal": "買われすぎ" | "売られすぎ" | "中立",
            "signals": ["ゴールデンクロス発生", ...]
        }
    """
```

#### 判定基準

**トレンド判定**:
- 上昇: SMA_5 > SMA_25 かつ 現在価格 > SMA_5
- 下降: SMA_5 < SMA_25 かつ 現在価格 < SMA_5
- 横ばい: 上記以外

**RSI判定**:
- 買われすぎ: RSI > 70
- 売られすぎ: RSI < 30
- 中立: 30 ≤ RSI ≤ 70

**シグナル検出**:
- ゴールデンクロス: SMA_5が SMA_25を下から上に抜ける
- デッドクロス: SMA_5が SMA_25を上から下に抜ける

## アーキテクチャ

### ファイル構成

```
batch/
├── batch_analysis.py          # メイン分析スクリプト（修正）
├── technical_analysis.py      # 新規作成
└── requirements.txt           # pandas-ta追加
```

### 実装の流れ

```python
# 1. technical_analysis.py（新規作成）
def calculate_trend_indicators(price_history: List[Dict]) -> Dict:
    """pandas-taを使用してテクニカル指標を計算"""
    import pandas as pd
    import pandas_ta as ta

    # DataFrameに変換
    df = pd.DataFrame(price_history)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')

    # 指標計算
    df['SMA_5'] = ta.sma(df['close'], length=5)
    df['SMA_25'] = ta.sma(df['close'], length=25)
    df['RSI_14'] = ta.rsi(df['close'], length=14)

    # 最新値を返す
    return {
        'sma_5': df['SMA_5'].iloc[-1],
        'sma_25': df['SMA_25'].iloc[-1],
        'rsi': df['RSI_14'].iloc[-1],
        'current_price': df['close'].iloc[-1],
        'previous_sma_5': df['SMA_5'].iloc[-2],
        'previous_sma_25': df['SMA_25'].iloc[-2]
    }

def analyze_trend(indicators: Dict) -> Dict:
    """シンプルなトレンド判定"""
    sma_5 = indicators['sma_5']
    sma_25 = indicators['sma_25']
    rsi = indicators['rsi']
    current_price = indicators['current_price']

    # トレンド判定
    if sma_5 > sma_25 and current_price > sma_5:
        trend = "上昇"
    elif sma_5 < sma_25 and current_price < sma_5:
        trend = "下降"
    else:
        trend = "横ばい"

    # RSI判定
    if rsi > 70:
        rsi_signal = "買われすぎ"
    elif rsi < 30:
        rsi_signal = "売られすぎ"
    else:
        rsi_signal = "中立"

    # シグナル検出
    signals = []
    prev_5 = indicators['previous_sma_5']
    prev_25 = indicators['previous_sma_25']

    # ゴールデンクロス
    if prev_5 <= prev_25 and sma_5 > sma_25:
        signals.append("ゴールデンクロス発生")

    # デッドクロス
    if prev_5 >= prev_25 and sma_5 < sma_25:
        signals.append("デッドクロス発生")

    return {
        "trend": trend,
        "sma_5": round(sma_5, 2),
        "sma_25": round(sma_25, 2),
        "rsi": round(rsi, 2),
        "rsi_signal": rsi_signal,
        "signals": signals if signals else ["シグナルなし"]
    }


# 2. batch_analysis.py（修正）
from technical_analysis import calculate_trend_indicators, analyze_trend

def analyze_with_openai(stock_data: StockData, max_retries: int = 2) -> Dict[str, Any]:
    """OpenAI APIで株式分析を実行（トレンド分析追加）"""

    # トレンド分析を追加
    trend_info = None
    if stock_data.price_history and len(stock_data.price_history) >= 25:
        try:
            indicators = calculate_trend_indicators(stock_data.price_history)
            trend_info = analyze_trend(indicators)
        except Exception as e:
            print(f"⚠️ トレンド分析エラー: {e}")
            # エラーでも分析は続行

    # 既存のプロンプト作成
    prompt = f"""
あなたは初心者投資家向けのAI投資アドバイザーです。
以下の銘柄データを分析し、投資推奨を提供してください。

【銘柄情報】
- ティッカー: {stock_data.ticker}
- 企業名: {stock_data.company_name}
- 市場: {'日本' if stock_data.market == 'JP' else '米国'}
- セクター: {stock_data.sector}
- 現在価格: {stock_data.current_price}{'円' if stock_data.market == 'JP' else 'ドル'}
- PER: {stock_data.pe_ratio if stock_data.pe_ratio else 'N/A'}
- PBR: {stock_data.pb_ratio if stock_data.pb_ratio else 'N/A'}
- ROE: {stock_data.roe if stock_data.roe else 'N/A'}%
- 配当利回り: {float(stock_data.dividend_yield) / 100 if stock_data.dividend_yield else 'N/A'}%
"""

    # トレンド情報を追加（データがある場合のみ）
    if trend_info:
        prompt += f"""
【株価トレンド分析】
- トレンド: {trend_info['trend']}
- 5日移動平均: {trend_info['sma_5']}円
- 25日移動平均: {trend_info['sma_25']}円
- RSI(14日): {trend_info['rsi']} ({trend_info['rsi_signal']})
- シグナル: {', '.join(trend_info['signals'])}
"""

    prompt += """
以下のJSON形式で回答してください：
{
  "recommendation": "Buy" | "Sell" | "Hold",
  "confidence_score": 0-100の整数,
  "reason": "推奨理由を300文字程度で記述。財務指標の評価、業績動向、投資判断の根拠を含める。"
}
"""

    # 既存のOpenAI API呼び出しロジック
    # ...
```

## データフロー

```
1. batch_analysis.py
   ↓
2. DBからprice_historyを取得（既存）
   ↓
3. technical_analysis.calculate_trend_indicators()
   ↓ pandas-taで計算
4. technical_analysis.analyze_trend()
   ↓ トレンド判定
5. analyze_with_openai()
   ↓ プロンプトに追加
6. OpenAI API呼び出し
   ↓
7. 分析結果をDBに保存（既存）
```

## エラーハンドリング

### データ不足時
- 価格履歴が25日未満の場合、トレンド分析をスキップ
- 既存の財務指標のみで分析を継続
- ログに警告を出力

### 計算エラー時
- pandas-taの計算エラーをキャッチ
- トレンド分析をスキップ
- 既存の分析ロジックにフォールバック

## テスト計画

### 単体テスト
- `calculate_trend_indicators()` のテスト
  - 正常系: 90日分のデータで正しく計算
  - 異常系: データ不足時の処理

- `analyze_trend()` のテスト
  - 上昇トレンド判定
  - 下降トレンド判定
  - 横ばい判定
  - ゴールデンクロス検出
  - デッドクロス検出

### 結合テスト
- 実際の15銘柄でバッチ実行
- AI分析結果の品質確認
- エラーログの確認

## デプロイ手順

1. requirements.txt更新
   ```
   pandas==2.3.3
   numpy==2.4.1
   pandas-ta==0.3.14b0
   ```

2. technical_analysis.py作成

3. batch_analysis.py修正

4. ローカルでテスト実行
   ```bash
   cd batch
   python batch_analysis.py --limit 3
   ```

5. GitHub Actions動作確認

6. 本番デプロイ

## 成功指標

- ✅ トレンド分析が15銘柄全てで正常に動作
- ✅ AI分析の推奨理由にトレンド情報が反映される
- ✅ エラー率0%
- ✅ 分析時間の増加が1銘柄あたり+2秒以内

## 将来の拡張案（別タスク）

### フェーズ1の拡張
- **指標の追加**
  - MACD
  - ボリンジャーバンド
  - 75日移動平均

- **判定ロジックの強化**
  - トレンドの強さ（強い/中程度/弱い）
  - 売買タイミングの具体的推奨
  - 目標価格・損切りラインの計算

### フェーズ2: セクター比較分析
- セクター全体の統計計算
- 相対評価（割安・割高判定）
- セクター内ランキング
- 競争優位性の判定

### フェーズ3: Web検索機能（DB蓄積方式）
- ニュース収集バッチ（1時間ごと）
- CompanyNewsテーブル追加
- センチメント分析
- AIプロンプトへの統合

## 参考資料

- pandas-ta documentation: https://github.com/twopirllc/pandas-ta
- 元の仕様書: `/docs/ai-analysis-improvement-spec.md`
- Linear issue: KOH-50
