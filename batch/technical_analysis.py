"""
株価テクニカル分析モジュール

taライブラリを使用してテクニカル指標を計算し、トレンドを判定する
"""

from typing import Dict, List
import pandas as pd
from ta.trend import SMAIndicator
from ta.momentum import RSIIndicator


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
        raise ValueError(f"データ不足: {len(price_history)}日分 " f"(最低25日必要)")

    # DataFrameに変換
    df = pd.DataFrame(price_history)
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date")

    # テクニカル指標を計算（taライブラリを使用）
    sma_5 = SMAIndicator(close=df["close"], window=5)
    df["SMA_5"] = sma_5.sma_indicator()

    sma_25 = SMAIndicator(close=df["close"], window=25)
    df["SMA_25"] = sma_25.sma_indicator()

    rsi = RSIIndicator(close=df["close"], window=14)
    df["RSI_14"] = rsi.rsi()

    # NaNを除去（移動平均の計算初期にNaNが発生）
    df = df.dropna()

    if len(df) < 2:
        raise ValueError("計算後のデータが不足しています")

    # 最新値を返す
    return {
        "sma_5": float(df["SMA_5"].iloc[-1]),
        "sma_25": float(df["SMA_25"].iloc[-1]),
        "rsi": float(df["RSI_14"].iloc[-1]),
        "current_price": float(df["close"].iloc[-1]),
        "previous_sma_5": float(df["SMA_5"].iloc[-2]),
        "previous_sma_25": float(df["SMA_25"].iloc[-2]),
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
    sma_5 = indicators["sma_5"]
    sma_25 = indicators["sma_25"]
    rsi = indicators["rsi"]
    current_price = indicators["current_price"]
    prev_sma_5 = indicators["previous_sma_5"]
    prev_sma_25 = indicators["previous_sma_25"]

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

    # ゴールデンクロス（5日が25日を下から上に抜ける）
    if prev_sma_5 <= prev_sma_25 and sma_5 > sma_25:
        signals.append("ゴールデンクロス発生")

    # デッドクロス（5日が25日を上から下に抜ける）
    if prev_sma_5 >= prev_sma_25 and sma_5 < sma_25:
        signals.append("デッドクロス発生")

    if not signals:
        signals.append("シグナルなし")

    return {
        "trend": trend,
        "sma_5": round(sma_5, 2),
        "sma_25": round(sma_25, 2),
        "rsi": round(rsi, 2),
        "rsi_signal": rsi_signal,
        "signals": signals,
    }
