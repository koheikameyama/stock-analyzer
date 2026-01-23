#!/usr/bin/env python3
"""
市況サマリー自動生成スクリプト
OpenAI APIを使って朝・夜の投稿内容を生成
"""

import os
import sys
from datetime import datetime
import json
import requests
from dotenv import load_dotenv
import yfinance as yf
from openai import OpenAI

# .env読み込み
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(env_path)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")

client = OpenAI(api_key=OPENAI_API_KEY)


def get_market_data():
    """
    市況データを取得

    Returns:
        Dict: 市況データ（日経平均、米国市場）
    """
    import time

    def fetch_ticker_data(ticker_symbol, name, max_retries=3):
        """
        ティッカーデータを取得（リトライ機能付き）

        Args:
            ticker_symbol: ティッカーシンボル
            name: 表示名
            max_retries: 最大リトライ回数

        Returns:
            DataFrame: 取得したデータ、失敗時はNone
        """
        for attempt in range(max_retries):
            try:
                print(
                    f"  {name}({ticker_symbol})を取得中... "
                    f"(試行 {attempt + 1}/{max_retries})"
                )
                ticker = yf.Ticker(ticker_symbol)
                # 1ヶ月分取得してより確実に
                data = ticker.history(period="1mo")

                if len(data) >= 2:
                    print(f"  ✅ {name}: {len(data)}日分のデータを取得")
                    return data
                else:
                    print(f"  ⚠️ {name}: データが不足 " f"({len(data)}日分)")

            except Exception as e:
                print(f"  ⚠️ {name}取得エラー " f"(試行 {attempt + 1}): {e}")

            # 最後の試行でなければ待機
            if attempt < max_retries - 1:
                time.sleep(2)

        return None

    try:
        # 日経平均（^N225）
        nikkei_data = fetch_ticker_data("^N225", "日経平均")
        if nikkei_data is None or len(nikkei_data) < 2:
            print("❌ 日経平均のデータ取得に失敗しました")
            return None

        # S&P500（^GSPC）- 米国市場の参考
        sp500_data = fetch_ticker_data("^GSPC", "S&P500")
        if sp500_data is None or len(sp500_data) < 2:
            print("❌ S&P500のデータ取得に失敗しました")
            return None

        nikkei_close = nikkei_data["Close"]
        sp500_close = sp500_data["Close"]

        return {
            "nikkei": {
                "price": nikkei_close.iloc[-1],
                "change": nikkei_close.iloc[-1] - nikkei_close.iloc[-2],
                "change_pct": (
                    (nikkei_close.iloc[-1] - nikkei_close.iloc[-2])
                    / nikkei_close.iloc[-2]
                    * 100
                ),
            },
            "sp500": {
                "price": sp500_close.iloc[-1],
                "change": sp500_close.iloc[-1] - sp500_close.iloc[-2],
                "change_pct": (
                    (sp500_close.iloc[-1] - sp500_close.iloc[-2])
                    / sp500_close.iloc[-2]
                    * 100
                ),
            },
        }
    except Exception as e:
        print(f"❌ 市況データ取得エラー: {e}")
        import traceback

        traceback.print_exc()
        return None


def generate_morning_summary(market_data):
    """
    朝の市況サマリーを生成

    Args:
        market_data: 市況データ

    Returns:
        str: 朝の投稿内容（140文字以内）
    """
    nikkei = market_data["nikkei"]
    sp500 = market_data["sp500"]

    prompt = f"""以下の市況データをもとに、朝の日本株市場の見通しを
X投稿用に生成してください。

市況データ:
- 日経平均: {nikkei['price']:.2f}円 ({nikkei['change_pct']:+.2f}%)
- S&P500（米国）: {sp500['price']:.2f} ({sp500['change_pct']:+.2f}%)

要件:
- 本文のみで70文字以内（ハッシュタグとURL分を確保）
- 絵文字を適度に使用
- 朝の挨拶を含める
- 米国市場の影響を簡潔に説明
- 読みやすいように2〜3文ごとに改行を入れる
- ハッシュタグは含めない（後で追加する）
- 投資助言にならないよう注意（「見込み」「予想」など柔らかい表現）"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "あなたは日本株市場の専門家です。"
                        "簡潔で分かりやすい市況サマリーを作成してください。"
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=200,
        )

        summary = response.choices[0].message.content.strip()
        # URLとハッシュタグを追加（URL→ハッシュタグの順）
        summary += "\n\nhttps://stock-analyzer.jp/"
        summary += "\n#日本株 #株式投資 #朝の市況"

        return summary
    except Exception as e:
        print(f"AI生成エラー: {e}")
        return None


def generate_evening_summary(market_data):
    """
    夜の市況サマリーを生成

    Args:
        market_data: 市況データ

    Returns:
        str: 夜の投稿内容（140文字以内）
    """
    nikkei = market_data["nikkei"]
    sp500 = market_data["sp500"]

    prompt = f"""以下の市況データをもとに、本日の日本株市場の振り返りを
X投稿用に生成してください。

市況データ:
- 日経平均: {nikkei['price']:.2f}円 ({nikkei['change_pct']:+.2f}%)
- S&P500（米国）: {sp500['price']:.2f} ({sp500['change_pct']:+.2f}%)

要件:
- 本文のみで70文字以内（ハッシュタグとURL分を確保）
- 絵文字を適度に使用
- 本日の結果を簡潔にまとめる
- 明日への期待を含める
- 読みやすいように2〜3文ごとに改行を入れる
- ハッシュタグは含めない（後で追加する）
- 投資助言にならないよう注意"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "あなたは日本株市場の専門家です。"
                        "簡潔で分かりやすい市況振り返りを作成してください。"
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=200,
        )

        summary = response.choices[0].message.content.strip()
        # URLとハッシュタグを追加（URL→ハッシュタグの順）
        summary += "\n\nhttps://stock-analyzer.jp/"
        summary += "\n#日本株 #相場振り返り #株式投資"

        return summary
    except Exception as e:
        print(f"AI生成エラー: {e}")
        return None


def send_to_slack(webhook_url: str, message: str, post_type: str):
    """
    Slackに投稿テンプレートを送信

    Args:
        webhook_url: Slack Webhook URL
        message: 送信するメッセージ
        post_type: 投稿タイプ（morning/evening）
    """
    from datetime import timezone, timedelta

    # JSTタイムゾーンを定義
    jst = timezone(timedelta(hours=9))
    now = datetime.now(jst).strftime("%H:%M")
    post_type_ja = "朝" if post_type == "morning" else "夜"

    payload = {
        "text": (
            f"📢 *{post_type_ja}の投稿テンプレート（{now}配信）*\n\n"
            f"以下をコピーしてXに投稿してください👇\n\n```\n{message}\n```"
        ),
        "username": "Stock Analyzer Bot",
        "icon_emoji": ":chart_with_upwards_trend:",
    }

    response = requests.post(
        webhook_url,
        data=json.dumps(payload),
        headers={"Content-Type": "application/json"},
    )

    if response.status_code == 200:
        print("✅ Slackへの送信成功")
    else:
        print(f"❌ Slackへの送信失敗: {response.status_code}")
        print(response.text)


def main():
    """メイン処理"""
    if len(sys.argv) < 2:
        print("使い方: python generate_market_summary.py [morning|evening]")
        sys.exit(1)

    post_type = sys.argv[1]

    if post_type not in ["morning", "evening"]:
        print("❌ post_typeは 'morning' または 'evening' を指定してください")
        sys.exit(1)

    print("\n" + "=" * 50)
    print(f"📊 {post_type}の市況サマリー生成")
    print(f"⏰ 実行時刻: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50 + "\n")

    if not SLACK_WEBHOOK_URL:
        print("❌ SLACK_WEBHOOK_URLが設定されていません")
        sys.exit(1)

    if not OPENAI_API_KEY:
        print("❌ OPENAI_API_KEYが設定されていません")
        sys.exit(1)

    # 市況データ取得
    print("📈 市況データを取得中...")
    market_data = get_market_data()

    if not market_data:
        print("❌ 市況データの取得に失敗しました")
        sys.exit(1)

    print("✅ 市況データ取得完了\n")

    # サマリー生成
    print("🤖 AIでサマリーを生成中...")
    if post_type == "morning":
        summary = generate_morning_summary(market_data)
    else:
        summary = generate_evening_summary(market_data)

    if not summary:
        print("❌ サマリーの生成に失敗しました")
        sys.exit(1)

    print("✅ サマリー生成完了\n")
    print("📝 生成された投稿:\n")
    print(summary)
    print("\n")

    # Slackに送信
    send_to_slack(SLACK_WEBHOOK_URL, summary, post_type)

    print("\n" + "=" * 50)
    print("✅ 処理完了")
    print("=" * 50)


if __name__ == "__main__":
    main()
