# AI株式分析トレンド分析機能 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 15銘柄AI分析に株価トレンド分析（移動平均、RSI）を追加し、売買タイミングの精度を向上させる

**Architecture:** 新規モジュール`technical_analysis.py`でpandas-taを使用してテクニカル指標を計算し、既存の`batch_analysis.py`のAIプロンプトに追加情報として統合する

**Tech Stack:** Python 3.11, pandas-ta, pandas, numpy

---

## Task 1: 依存関係の追加

**Files:**
- Modify: `batch/requirements.txt`

**Step 1: requirements.txtにpandas-ta追加**

```bash
cd /Users/kouheikameyama/development/stock-analyzer/batch
```

既存の内容に以下を追加:
```
pandas==2.3.3
numpy==2.4.1
pandas-ta==0.3.14b0
```

**Step 2: ローカル環境にインストール**

Run: `pip3 install pandas==2.3.3 numpy==2.4.1 pandas-ta==0.3.14b0`
Expected: Successfully installed

**Step 3: インストール確認**

Run: `python3 -c "import pandas_ta; print(pandas_ta.__version__)"`
Expected: `0.3.14b0`

**Step 4: Commit**

```bash
git add requirements.txt
git commit -m "deps: pandas-taを追加（テクニカル指標計算用）"
```

---

## Task 2: テクニカル分析モジュールの作成（テスト駆動）

**Files:**
- Create: `batch/technical_analysis.py`
- Create: `batch/tests/test_technical_analysis.py`

**Step 1: テストファイル作成とディレクトリ準備**

```bash
cd /Users/kouheikameyama/development/stock-analyzer/batch
mkdir -p tests
touch tests/__init__.py
```

**Step 2: 失敗するテストを書く**

Create: `batch/tests/test_technical_analysis.py`

```python
"""technical_analysis.pyのテスト"""
import pytest
from datetime import datetime, timedelta


def test_calculate_trend_indicators_with_valid_data():
    """正常系: 90日分のデータでテクニカル指標を計算"""
    from technical_analysis import calculate_trend_indicators

    # 90日分のモックデータ
    base_date = datetime(2026, 1, 1)
    price_history = []
    for i in range(90):
        price_history.append({
            'date': base_date + timedelta(days=i),
            'close': 1000 + i * 10,  # 上昇トレンド
            'open': 990 + i * 10,
            'high': 1010 + i * 10,
            'low': 980 + i * 10,
            'volume': 1000000
        })

    result = calculate_trend_indicators(price_history)

    # 結果の構造を検証
    assert 'sma_5' in result
    assert 'sma_25' in result
    assert 'rsi' in result
    assert 'current_price' in result
    assert 'previous_sma_5' in result
    assert 'previous_sma_25' in result

    # 値の妥当性を検証
    assert result['current_price'] == 1890  # 最終日の終値
    assert result['sma_5'] > 0
    assert result['sma_25'] > 0
    assert 0 <= result['rsi'] <= 100


def test_analyze_trend_uptrend():
    """上昇トレンドの判定"""
    from technical_analysis import analyze_trend

    indicators = {
        'sma_5': 1500,
        'sma_25': 1400,
        'rsi': 60,
        'current_price': 1550,
        'previous_sma_5': 1450,
        'previous_sma_25': 1380
    }

    result = analyze_trend(indicators)

    assert result['trend'] == '上昇'
    assert result['rsi_signal'] == '中立'
    assert result['sma_5'] == 1500
    assert result['sma_25'] == 1400


def test_analyze_trend_downtrend():
    """下降トレンドの判定"""
    from technical_analysis import analyze_trend

    indicators = {
        'sma_5': 1400,
        'sma_25': 1500,
        'rsi': 40,
        'current_price': 1350,
        'previous_sma_5': 1450,
        'previous_sma_25': 1480
    }

    result = analyze_trend(indicators)

    assert result['trend'] == '下降'
    assert result['rsi_signal'] == '中立'


def test_analyze_trend_golden_cross():
    """ゴールデンクロスの検出"""
    from technical_analysis import analyze_trend

    indicators = {
        'sma_5': 1510,
        'sma_25': 1500,
        'rsi': 55,
        'current_price': 1520,
        'previous_sma_5': 1490,  # 前日は下
        'previous_sma_25': 1500  # 前日と同じ
    }

    result = analyze_trend(indicators)

    assert 'ゴールデンクロス発生' in result['signals']


def test_analyze_trend_rsi_overbought():
    """RSI買われすぎの判定"""
    from technical_analysis import analyze_trend

    indicators = {
        'sma_5': 1500,
        'sma_25': 1400,
        'rsi': 75,
        'current_price': 1550,
        'previous_sma_5': 1450,
        'previous_sma_25': 1380
    }

    result = analyze_trend(indicators)

    assert result['rsi_signal'] == '買われすぎ'


def test_analyze_trend_rsi_oversold():
    """RSI売られすぎの判定"""
    from technical_analysis import analyze_trend

    indicators = {
        'sma_5': 1400,
        'sma_25': 1500,
        'rsi': 25,
        'current_price': 1350,
        'previous_sma_5': 1450,
        'previous_sma_25': 1480
    }

    result = analyze_trend(indicators)

    assert result['rsi_signal'] == '売られすぎ'
```

**Step 3: テストを実行して失敗を確認**

Run: `python3 -m pytest tests/test_technical_analysis.py -v`
Expected: All tests FAIL with "ModuleNotFoundError: No module named 'technical_analysis'"

**Step 4: 最小限の実装**

Create: `batch/technical_analysis.py`

```python
"""
株価テクニカル分析モジュール

pandas-taを使用してテクニカル指標を計算し、トレンドを判定する
"""
from typing import Dict, List
import pandas as pd
import pandas_ta as ta


def calculate_trend_indicators(price_history: List[Dict]) -> Dict:
    """
    テクニカル指標を計算

    Args:
        price_history: 株価履歴（date, close, open, high, low, volume）

    Returns:
        Dict: {
            'sma_5': 5日移動平均,
            'sma_25': 25日移動平均,
            'rsi': 14日RSI,
            'current_price': 現在価格,
            'previous_sma_5': 前日の5日移動平均,
            'previous_sma_25': 前日の25日移動平均
        }

    Raises:
        ValueError: データが不足している場合
    """
    if len(price_history) < 25:
        raise ValueError(
            f"データ不足: {len(price_history)}日分 "
            f"(最低25日必要)"
        )

    # DataFrameに変換
    df = pd.DataFrame(price_history)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')

    # テクニカル指標を計算
    df['SMA_5'] = ta.sma(df['close'], length=5)
    df['SMA_25'] = ta.sma(df['close'], length=25)
    df['RSI_14'] = ta.rsi(df['close'], length=14)

    # NaNを除去（移動平均の計算初期にNaNが発生）
    df = df.dropna()

    if len(df) < 2:
        raise ValueError("計算後のデータが不足しています")

    # 最新値を返す
    return {
        'sma_5': float(df['SMA_5'].iloc[-1]),
        'sma_25': float(df['SMA_25'].iloc[-1]),
        'rsi': float(df['RSI_14'].iloc[-1]),
        'current_price': float(df['close'].iloc[-1]),
        'previous_sma_5': float(df['SMA_5'].iloc[-2]),
        'previous_sma_25': float(df['SMA_25'].iloc[-2])
    }


def analyze_trend(indicators: Dict) -> Dict:
    """
    トレンドを判定

    Args:
        indicators: calculate_trend_indicators()の戻り値

    Returns:
        Dict: {
            'trend': '上昇' | '下降' | '横ばい',
            'sma_5': 5日移動平均,
            'sma_25': 25日移動平均,
            'rsi': RSI,
            'rsi_signal': '買われすぎ' | '売られすぎ' | '中立',
            'signals': [シグナルのリスト]
        }
    """
    sma_5 = indicators['sma_5']
    sma_25 = indicators['sma_25']
    rsi = indicators['rsi']
    current_price = indicators['current_price']
    prev_sma_5 = indicators['previous_sma_5']
    prev_sma_25 = indicators['previous_sma_25']

    # トレンド判定
    if sma_5 > sma_25 and current_price > sma_5:
        trend = '上昇'
    elif sma_5 < sma_25 and current_price < sma_5:
        trend = '下降'
    else:
        trend = '横ばい'

    # RSI判定
    if rsi > 70:
        rsi_signal = '買われすぎ'
    elif rsi < 30:
        rsi_signal = '売られすぎ'
    else:
        rsi_signal = '中立'

    # シグナル検出
    signals = []

    # ゴールデンクロス（5日が25日を下から上に抜ける）
    if prev_sma_5 <= prev_sma_25 and sma_5 > sma_25:
        signals.append('ゴールデンクロス発生')

    # デッドクロス（5日が25日を上から下に抜ける）
    if prev_sma_5 >= prev_sma_25 and sma_5 < sma_25:
        signals.append('デッドクロス発生')

    if not signals:
        signals.append('シグナルなし')

    return {
        'trend': trend,
        'sma_5': round(sma_5, 2),
        'sma_25': round(sma_25, 2),
        'rsi': round(rsi, 2),
        'rsi_signal': rsi_signal,
        'signals': signals
    }
```

**Step 5: テストを実行して成功を確認**

Run: `python3 -m pytest tests/test_technical_analysis.py -v`
Expected: All tests PASS

**Step 6: Commit**

```bash
git add technical_analysis.py tests/test_technical_analysis.py tests/__init__.py
git commit -m "feat: テクニカル分析モジュールを追加

- pandas-taで移動平均・RSIを計算
- トレンド判定（上昇/下降/横ばい）
- ゴールデンクロス/デッドクロス検出
- RSI買われすぎ/売られすぎ判定
- テスト完備"
```

---

## Task 3: batch_analysis.pyへの統合

**Files:**
- Modify: `batch/batch_analysis.py:223-299`

**Step 1: 統合テストを書く**

Modify: `batch/tests/test_technical_analysis.py`（末尾に追加）

```python
def test_integration_with_trend_analysis():
    """統合テスト: トレンド分析を含むプロンプト生成"""
    from technical_analysis import calculate_trend_indicators, analyze_trend

    # モックデータ
    base_date = datetime(2026, 1, 1)
    price_history = []
    for i in range(90):
        price_history.append({
            'date': base_date + timedelta(days=i),
            'close': 1000 + i * 10,
            'open': 990 + i * 10,
            'high': 1010 + i * 10,
            'low': 980 + i * 10,
            'volume': 1000000
        })

    # トレンド分析実行
    indicators = calculate_trend_indicators(price_history)
    trend_info = analyze_trend(indicators)

    # プロンプト生成（実際のコードと同じロジック）
    prompt_section = f"""
【株価トレンド分析】
- トレンド: {trend_info['trend']}
- 5日移動平均: {trend_info['sma_5']}円
- 25日移動平均: {trend_info['sma_25']}円
- RSI(14日): {trend_info['rsi']} ({trend_info['rsi_signal']})
- シグナル: {', '.join(trend_info['signals'])}
"""

    # プロンプトの内容を検証
    assert 'トレンド: 上昇' in prompt_section
    assert '5日移動平均:' in prompt_section
    assert 'RSI(14日):' in prompt_section
```

**Step 2: テストを実行**

Run: `python3 -m pytest tests/test_technical_analysis.py::test_integration_with_trend_analysis -v`
Expected: PASS

**Step 3: batch_analysis.pyのanalyze_with_openai関数を修正**

Modify: `batch/batch_analysis.py`

インポート部分に追加（既存のimportの後）:
```python
from technical_analysis import calculate_trend_indicators, analyze_trend
```

`analyze_with_openai`関数内の既存プロンプト作成部分（223行目付近）を修正:

```python
def analyze_with_openai(stock_data: StockData, max_retries: int = 2) -> Dict[str, Any]:
    """
    OpenAI APIで株式分析を実行（リトライあり、トレンド分析追加）

    Args:
        stock_data: 株式データ
        max_retries: 最大リトライ回数（デフォルト: 2回）

    Returns:
        Dict: AI分析結果
    """
    # トレンド分析を追加
    trend_info = None
    if stock_data.price_history and len(stock_data.price_history) >= 25:
        try:
            indicators = calculate_trend_indicators(stock_data.price_history)
            trend_info = analyze_trend(indicators)
        except Exception as e:
            print(f"⚠️ {stock_data.ticker}: トレンド分析エラー: {e}")
            # エラーでも分析は続行（トレンド情報なしで進む）

    # プロンプト作成
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

    # リトライロジック（既存のコードはそのまま）
    for attempt in range(max_retries + 1):
        # ... 既存のOpenAI API呼び出しロジック ...
```

**Step 4: 手動テスト実行**

Run: `cd /Users/kouheikameyama/development/stock-analyzer/batch && python3 batch_analysis.py --limit 3`
Expected: 3銘柄の分析が成功、トレンド情報が含まれたログが出力される

**Step 5: Commit**

```bash
git add batch_analysis.py
git commit -m "feat: AI分析にトレンド分析を統合

- analyze_with_openai関数にトレンド分析を追加
- 株価履歴が25日以上ある場合のみトレンド分析実行
- エラー時は既存の分析にフォールバック
- プロンプトに【株価トレンド分析】セクション追加"
```

---

## Task 4: エラーハンドリングとロギングの改善

**Files:**
- Modify: `batch/batch_analysis.py:223-260`
- Modify: `batch/technical_analysis.py:15-50`

**Step 1: より詳細なログ出力を追加**

Modify: `batch/batch_analysis.py`の`analyze_with_openai`関数:

```python
    # トレンド分析を追加
    trend_info = None
    if stock_data.price_history and len(stock_data.price_history) >= 25:
        try:
            print(f"  📊 {stock_data.ticker}: トレンド分析実行中...")
            indicators = calculate_trend_indicators(stock_data.price_history)
            trend_info = analyze_trend(indicators)
            print(f"  ✅ {stock_data.ticker}: トレンド={trend_info['trend']}, RSI={trend_info['rsi']}")
        except Exception as e:
            print(f"  ⚠️ {stock_data.ticker}: トレンド分析エラー: {e}")
            # エラーでも分析は続行（トレンド情報なしで進む）
    elif stock_data.price_history:
        print(f"  ℹ️ {stock_data.ticker}: 株価履歴が不足（{len(stock_data.price_history)}日分、最低25日必要）")
```

**Step 2: technical_analysis.pyに詳細なエラーメッセージ**

Modify: `batch/technical_analysis.py`の`calculate_trend_indicators`関数:

```python
def calculate_trend_indicators(price_history: List[Dict]) -> Dict:
    """
    テクニカル指標を計算

    Args:
        price_history: 株価履歴（date, close, open, high, low, volume）

    Returns:
        Dict: テクニカル指標

    Raises:
        ValueError: データが不足している場合
    """
    if not price_history:
        raise ValueError("株価履歴が空です")

    if len(price_history) < 25:
        raise ValueError(
            f"データ不足: {len(price_history)}日分 "
            f"(最低25日必要、移動平均計算のため)"
        )

    try:
        # DataFrameに変換
        df = pd.DataFrame(price_history)

        # 必須カラムのチェック
        required_columns = ['date', 'close']
        missing = [col for col in required_columns if col not in df.columns]
        if missing:
            raise ValueError(f"必須カラムが不足: {missing}")

        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')

        # テクニカル指標を計算
        df['SMA_5'] = ta.sma(df['close'], length=5)
        df['SMA_25'] = ta.sma(df['close'], length=25)
        df['RSI_14'] = ta.rsi(df['close'], length=14)

        # NaNを除去
        df = df.dropna()

        if len(df) < 2:
            raise ValueError(
                f"計算後のデータが不足（{len(df)}行、最低2行必要）"
            )

        # 最新値を返す
        return {
            'sma_5': float(df['SMA_5'].iloc[-1]),
            'sma_25': float(df['SMA_25'].iloc[-1]),
            'rsi': float(df['RSI_14'].iloc[-1]),
            'current_price': float(df['close'].iloc[-1]),
            'previous_sma_5': float(df['SMA_5'].iloc[-2]),
            'previous_sma_25': float(df['SMA_25'].iloc[-2])
        }
    except KeyError as e:
        raise ValueError(f"データ形式エラー: {e}")
    except Exception as e:
        raise ValueError(f"計算エラー: {e}")
```

**Step 3: テスト実行**

Run: `python3 -m pytest tests/test_technical_analysis.py -v`
Expected: All tests PASS

**Step 4: 手動テスト（エラーケース確認）**

Run: `cd /Users/kouheikameyama/development/stock-analyzer/batch && python3 batch_analysis.py --limit 5`
Expected:
- トレンド分析成功時は `✅` マーク
- データ不足時は `ℹ️` マーク
- エラー時は `⚠️` マーク

**Step 5: Commit**

```bash
git add batch_analysis.py technical_analysis.py
git commit -m "feat: トレンド分析のエラーハンドリング改善

- 詳細なログ出力（成功/データ不足/エラー）
- technical_analysis.pyに詳細なエラーメッセージ
- 必須カラムのバリデーション追加"
```

---

## Task 5: ドキュメント更新

**Files:**
- Modify: `README.md`
- Create: `docs/technical-analysis.md`

**Step 1: 技術ドキュメント作成**

Create: `docs/technical-analysis.md`

```markdown
# テクニカル分析機能

## 概要

AI株式分析にテクニカル指標（移動平均、RSI）を追加し、トレンド分析を実施する機能。

## 計算される指標

### 移動平均（SMA）
- **5日移動平均**: 短期トレンドの把握
- **25日移動平均**: 中期トレンドの把握

### RSI（相対力指数）
- **14日RSI**: 買われすぎ/売られすぎの判定
  - 70以上: 買われすぎ
  - 30以下: 売られすぎ
  - 30-70: 中立

## トレンド判定ロジック

### 上昇トレンド
- 条件: `5日移動平均 > 25日移動平均` かつ `現在価格 > 5日移動平均`

### 下降トレンド
- 条件: `5日移動平均 < 25日移動平均` かつ `現在価格 < 5日移動平均`

### 横ばい
- 条件: 上記以外

## シグナル検出

### ゴールデンクロス
- 5日移動平均が25日移動平均を下から上に抜ける
- 買いシグナル

### デッドクロス
- 5日移動平均が25日移動平均を上から下に抜ける
- 売りシグナル

## 使用方法

```python
from technical_analysis import calculate_trend_indicators, analyze_trend

# 株価履歴から指標を計算
indicators = calculate_trend_indicators(price_history)

# トレンドを判定
trend_info = analyze_trend(indicators)

print(trend_info)
# {
#   'trend': '上昇',
#   'sma_5': 1500.0,
#   'sma_25': 1400.0,
#   'rsi': 65.5,
#   'rsi_signal': '中立',
#   'signals': ['ゴールデンクロス発生']
# }
```

## データ要件

- **最低日数**: 25日分の株価履歴
- **必須カラム**: `date`, `close`
- **推奨カラム**: `open`, `high`, `low`, `volume`

## エラーハンドリング

- データ不足（25日未満）: トレンド分析をスキップ、既存の分析を継続
- 計算エラー: ログに警告を出力、既存の分析を継続
- 必須カラム不足: ValueErrorを発生

## テスト

```bash
cd batch
python3 -m pytest tests/test_technical_analysis.py -v
```

## 依存関係

- pandas-ta==0.3.14b0
- pandas==2.3.3
- numpy==2.4.1
```

**Step 2: READMEに機能追加の記載**

Modify: `README.md`（適切なセクションに追加）

```markdown
## AI分析機能

### テクニカル分析
- **移動平均**: 5日・25日移動平均でトレンド判定
- **RSI**: 買われすぎ/売られすぎの検出
- **シグナル検出**: ゴールデンクロス・デッドクロス

詳細: [docs/technical-analysis.md](docs/technical-analysis.md)
```

**Step 3: Commit**

```bash
git add README.md docs/technical-analysis.md
git commit -m "docs: テクニカル分析機能のドキュメント追加"
```

---

## Task 6: GitHub Actionsでの動作確認

**Files:**
- None（動作確認のみ）

**Step 1: ブランチをプッシュ**

```bash
git push -u origin feature/ai-trend-analysis
```

**Step 2: GitHub Actionsのログ確認**

1. https://github.com/koheikameyama/stock-analyzer/actions を開く
2. 最新のワークフロー実行を確認
3. `Install dependencies` ステップで `pandas-ta` がインストールされているか確認
4. エラーがないことを確認

**Step 3: 手動で日次分析ワークフローをトリガー**

Run: `gh workflow run daily-analysis.yml --ref feature/ai-trend-analysis`

**Step 4: ワークフロー完了を待って結果確認**

Run: `gh run list --workflow=daily-analysis.yml --limit 1`

完了したら:
Run: `gh run view --log`

Expected: 15銘柄の分析が成功、トレンド情報が含まれている

---

## Task 7: PR作成と最終確認

**Files:**
- None（PR作成のみ）

**Step 1: PRを作成**

```bash
gh pr create --base develop --title "feat: AI分析にトレンド分析機能を追加" --body "## 概要

AI株式分析に株価トレンド分析（移動平均、RSI）を追加し、売買タイミングの精度を向上させる。

## 追加機能

### テクニカル指標
- 5日移動平均（SMA_5）
- 25日移動平均（SMA_25）
- 14日RSI

### トレンド判定
- 上昇/下降/横ばいの判定
- ゴールデンクロス/デッドクロス検出
- RSI買われすぎ/売られすぎ判定

### AI分析への統合
- 既存プロンプトに【株価トレンド分析】セクションを追加
- トレンド情報を踏まえた投資推奨を生成

## 変更内容

### 新規ファイル
- \`batch/technical_analysis.py\`: テクニカル分析モジュール
- \`batch/tests/test_technical_analysis.py\`: テスト
- \`docs/technical-analysis.md\`: ドキュメント

### 修正ファイル
- \`batch/batch_analysis.py\`: トレンド分析の統合
- \`batch/requirements.txt\`: pandas-ta追加
- \`README.md\`: 機能追加の記載

## テスト

\`\`\`bash
cd batch
python3 -m pytest tests/test_technical_analysis.py -v
\`\`\`

全テストPASS ✅

## 動作確認

- ローカル環境: 3銘柄でテスト実行 ✅
- GitHub Actions: 15銘柄で正常動作 ✅

## エラーハンドリング

- データ不足時: トレンド分析をスキップ、既存分析を継続
- 計算エラー時: ログ警告、既存分析を継続
- 25日未満の株価履歴: トレンド分析なしで分析実行

## 影響範囲

- バックエンド（Python バッチ）のみ
- Web UIへの影響なし
- AI分析結果の\`reason\`フィールドがより詳細に

## 参考資料

- 設計書: \`docs/plans/2026-01-24-ai-trend-analysis-design.md\`
- Linear issue: KOH-50"
```

**Step 2: PR URLを確認**

Expected: PRのURLが表示される

**Step 3: PR画面で最終確認**

確認項目:
- [ ] テストが全てPASS
- [ ] GitHub Actionsが成功
- [ ] コードレビューの準備完了

**Step 4: Linearタスクを更新**

```bash
# PR URLをLinearタスクにコメント
```

---

## 完了条件

- [ ] 全てのテストがPASS
- [ ] GitHub Actionsが成功
- [ ] PRが作成されている
- [ ] ドキュメントが更新されている
- [ ] Linearタスクが更新されている

## 推定所要時間

- Task 1: 10分
- Task 2: 90分（テスト駆動開発）
- Task 3: 45分
- Task 4: 30分
- Task 5: 20分
- Task 6: 15分
- Task 7: 10分

**合計: 約3.5時間**
