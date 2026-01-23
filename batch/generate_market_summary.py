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
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')

client = OpenAI(api_key=OPENAI_API_KEY)


def get_market_data():
    """
    市況データを取得

    Returns:
        Dict: 市況データ（日経平均、TOPIX、米国市場）
    """
    try:
        # 日経平均（^N225）
        nikkei = yf.Ticker("^N225")
        nikkei_data = nikkei.history(period="2d")

        # TOPIX（^TOPX）
        topix = yf.Ticker("^TOPX")
        topix_data = topix.history(period="2d")

        # S&P500（^GSPC）- 米国市場の参考
        sp500 = yf.Ticker("^GSPC")
        sp500_data = sp500.history(period="2d")

        return {
            "nikkei": {
                "price": nikkei_data['Close'].iloc[-1],
                "change": nikkei_data['Close'].iloc[-1] - nikkei_data['Close'].iloc[-2],
                "change_pct": ((nikkei_data['Close'].iloc[-1] - nikkei_data['Close'].iloc[-2]) / nikkei_data['Close'].iloc[-2]) * 100
            },
            "topix": {
                "price": topix_data['Close'].iloc[-1],
                "change": topix_data['Close'].iloc[-1] - topix_data['Close'].iloc[-2],
                "change_pct": ((topix_data['Close'].iloc[-1] - topix_data['Close'].iloc[-2]) / topix_data['Close'].iloc[-2]) * 100
            },
            "sp500": {
                "price": sp500_data['Close'].iloc[-1],
                "change": sp500_data['Close'].iloc[-1] - sp500_data['Close'].iloc[-2],
                "change_pct": ((sp500_data['Close'].iloc[-1] - sp500_data['Close'].iloc[-2]) / sp500_data['Close'].iloc[-2]) * 100
            }
        }
    except Exception as e:
        print(f"市況データ取得エラー: {e}")
        return None


def generate_morning_summary(market_data):
    """
    朝の市況サマリーを生成

    Args:
        market_data: 市況データ

    Returns:
        str: 朝の投稿内容（140文字以内）
    """
    prompt = f"""以下の市況データをもとに、朝の日本株市場の見通しをX投稿用に生成してください。

市況データ:
- 日経平均: {market_data['nikkei']['price']:.2f}円 ({market_data['nikkei']['change_pct']:+.2f}%)
- TOPIX: {market_data['topix']['price']:.2f} ({market_data['topix']['change_pct']:+.2f}%)
- S&P500: {market_data['sp500']['price']:.2f} ({market_data['sp500']['change_pct']:+.2f}%)

要件:
- 140文字以内
- 絵文字を適度に使用
- 朝の挨拶を含める
- 米国市場の影響を簡潔に説明
- ハッシュタグは含めない（後で追加する）
- 投資助言にならないよう注意（「見込み」「予想」など柔らかい表現）"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "あなたは日本株市場の専門家です。簡潔で分かりやすい市況サマリーを作成してください。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=200
        )

        summary = response.choices[0].message.content.strip()
        # ハッシュタグを追加
        summary += "\n\n#日本株 #株式投資 #朝の市況"

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
    prompt = f"""以下の市況データをもとに、本日の日本株市場の振り返りをX投稿用に生成してください。

市況データ:
- 日経平均: {market_data['nikkei']['price']:.2f}円 ({market_data['nikkei']['change_pct']:+.2f}%)
- TOPIX: {market_data['topix']['price']:.2f} ({market_data['topix']['change_pct']:+.2f}%)

要件:
- 140文字以内
- 絵文字を適度に使用
- 本日の結果を簡潔にまとめる
- 明日への期待を含める
- ハッシュタグは含めない（後で追加する）
- 投資助言にならないよう注意"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "あなたは日本株市場の専門家です。簡潔で分かりやすい市況振り返りを作成してください。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=200
        )

        summary = response.choices[0].message.content.strip()
        # ハッシュタグを追加
        summary += "\n\n#日本株 #相場振り返り #株式投資"

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
    now = datetime.now().strftime('%H:%M')
    post_type_ja = "朝" if post_type == "morning" else "夜"

    payload = {
        "text": f"📢 *{post_type_ja}の投稿テンプレート（{now}配信）*\n\n以下をコピーしてXに投稿してください👇\n\n```\n{message}\n```",
        "username": "Stock Analyzer Bot",
        "icon_emoji": ":chart_with_upwards_trend:"
    }

    response = requests.post(
        webhook_url,
        data=json.dumps(payload),
        headers={'Content-Type': 'application/json'}
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

    if post_type not in ['morning', 'evening']:
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
    if post_type == 'morning':
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
