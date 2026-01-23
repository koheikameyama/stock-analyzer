"""technical_analysis.pyのテスト"""

from datetime import datetime, timedelta


def test_calculate_trend_indicators_with_valid_data():
    """正常系: 90日分のデータでテクニカル指標を計算"""
    from technical_analysis import calculate_trend_indicators

    # 90日分のモックデータ
    base_date = datetime(2026, 1, 1)
    price_history = []
    for i in range(90):
        price_history.append(
            {
                "date": base_date + timedelta(days=i),
                "close": 1000 + i * 10,  # 上昇トレンド
                "open": 990 + i * 10,
                "high": 1010 + i * 10,
                "low": 980 + i * 10,
                "volume": 1000000,
            }
        )

    result = calculate_trend_indicators(price_history)

    # 結果の構造を検証
    assert "sma_5" in result
    assert "sma_25" in result
    assert "rsi" in result
    assert "current_price" in result
    assert "previous_sma_5" in result
    assert "previous_sma_25" in result

    # 値の妥当性を検証
    assert result["current_price"] == 1890  # 最終日の終値
    assert result["sma_5"] > 0
    assert result["sma_25"] > 0
    assert 0 <= result["rsi"] <= 100


def test_analyze_trend_uptrend():
    """上昇トレンドの判定"""
    from technical_analysis import analyze_trend

    indicators = {
        "sma_5": 1500,
        "sma_25": 1400,
        "rsi": 60,
        "current_price": 1550,
        "previous_sma_5": 1450,
        "previous_sma_25": 1380,
    }

    result = analyze_trend(indicators)

    assert result["trend"] == "上昇"
    assert result["rsi_signal"] == "中立"
    assert result["sma_5"] == 1500
    assert result["sma_25"] == 1400


def test_analyze_trend_downtrend():
    """下降トレンドの判定"""
    from technical_analysis import analyze_trend

    indicators = {
        "sma_5": 1400,
        "sma_25": 1500,
        "rsi": 40,
        "current_price": 1350,
        "previous_sma_5": 1450,
        "previous_sma_25": 1480,
    }

    result = analyze_trend(indicators)

    assert result["trend"] == "下降"
    assert result["rsi_signal"] == "中立"


def test_analyze_trend_golden_cross():
    """ゴールデンクロスの検出"""
    from technical_analysis import analyze_trend

    indicators = {
        "sma_5": 1510,
        "sma_25": 1500,
        "rsi": 55,
        "current_price": 1520,
        "previous_sma_5": 1490,  # 前日は下
        "previous_sma_25": 1500,  # 前日と同じ
    }

    result = analyze_trend(indicators)

    assert "ゴールデンクロス発生" in result["signals"]


def test_analyze_trend_rsi_overbought():
    """RSI買われすぎの判定"""
    from technical_analysis import analyze_trend

    indicators = {
        "sma_5": 1500,
        "sma_25": 1400,
        "rsi": 75,
        "current_price": 1550,
        "previous_sma_5": 1450,
        "previous_sma_25": 1380,
    }

    result = analyze_trend(indicators)

    assert result["rsi_signal"] == "買われすぎ"


def test_analyze_trend_rsi_oversold():
    """RSI売られすぎの判定"""
    from technical_analysis import analyze_trend

    indicators = {
        "sma_5": 1400,
        "sma_25": 1500,
        "rsi": 25,
        "current_price": 1350,
        "previous_sma_5": 1450,
        "previous_sma_25": 1480,
    }

    result = analyze_trend(indicators)

    assert result["rsi_signal"] == "売られすぎ"
