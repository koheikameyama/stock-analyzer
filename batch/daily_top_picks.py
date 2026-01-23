#!/usr/bin/env python3
"""
毎日のおすすめ銘柄投稿テンプレート生成スクリプト
X（Twitter）投稿用のテンプレートをSlackに送信
"""

import os
import sys
from datetime import datetime
from typing import List, Dict
import json
import requests

import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# .env読み込み
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")


def get_top_picks(conn) -> List[Dict]:
    """
    スコア上位3銘柄を取得

    Returns:
        List[Dict]: 上位3銘柄の分析結果
    """
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT
                s.ticker,
                s.name,
                s.sector,
                a.confidence_score,
                a.recommendation,
                a.reason,
                a.analysis_date
            FROM analyses a
            JOIN stocks s ON a.stock_id = s.id
            WHERE a.analysis_date >= NOW() - INTERVAL '7 days'
            ORDER BY a.confidence_score DESC, a.analysis_date DESC
            LIMIT 3
        """)
        return cur.fetchall()


def get_signal(score: float) -> Dict[str, str]:
    """
    スコアからシグナル情報を取得

    Args:
        score: 総合スコア (0-100)

    Returns:
        Dict: シグナル情報（アイコン、テキスト）
    """
    if score >= 80:
        return {"icon": "📈", "text": "買いシグナル"}
    elif score < 40:
        return {"icon": "📉", "text": "売りシグナル"}
    else:
        return {"icon": "➡️", "text": "様子見"}


def generate_tweet_template(top_picks: List[Dict]) -> str:
    """
    X投稿用テンプレートを生成（140文字以内）

    Args:
        top_picks: 上位3銘柄の分析結果

    Returns:
        str: 投稿テンプレート
    """
    # 上位3銘柄を紹介（理由なし、140文字制限）
    medals = ["🥇", "🥈", "🥉"]
    lines = ["📊本日の注目銘柄"]

    for i, stock in enumerate(top_picks[:3]):
        signal = get_signal(stock["confidence_score"])
        line = (
            f"{medals[i]}{stock['name']}({stock['ticker']}) "
            f"{stock['confidence_score']}/100 {signal['icon']}"
        )
        lines.append(line)

    lines.append("\n#日本株 #AI分析")
    lines.append("\nhttps://stock-analyzer.jp/")
    template = "\n".join(lines)

    # 140文字以内に収める
    if len(template) > 140:
        # 銘柄名を短縮してハッシュタグも削減
        lines = ["📊本日の注目銘柄"]
        for i, stock in enumerate(top_picks[:3]):
            signal = get_signal(stock["confidence_score"])
            max_name_len = 6
            short_name = (
                stock["name"][:max_name_len]
                if len(stock["name"]) > max_name_len
                else stock["name"]
            )
            line = (
                f"{medals[i]}{short_name}({stock['ticker']}) "
                f"{stock['confidence_score']}/100 {signal['icon']}"
            )
            lines.append(line)
        lines.append("\n#日本株 #AI")
        lines.append("\nhttps://stock-analyzer.jp/")
        template = "\n".join(lines)

        # それでも140文字を超える場合、スコア表示を削除
        if len(template) > 140:
            lines = ["📊本日の注目銘柄"]
            for i, stock in enumerate(top_picks[:3]):
                signal = get_signal(stock["confidence_score"])
                name = stock["name"]
                short_name = name[:4] if len(name) > 4 else name
                ticker = stock["ticker"]
                icon = signal["icon"]
                line = f"{medals[i]}{short_name}({ticker}) {icon}"
                lines.append(line)
            lines.append("\n#日本株")
            lines.append("\nhttps://stock-analyzer.jp/")
            template = "\n".join(lines)

    return template


def send_to_slack(webhook_url: str, message: str):
    """
    Slackに投稿テンプレートを送信

    Args:
        webhook_url: Slack Webhook URL
        message: 送信するメッセージ
    """
    now = datetime.now().strftime("%H:%M")

    payload = {
        "text": (
            f"📢 *毎日投稿テンプレート（{now}配信）*\n\n"
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
    print("\n" + "=" * 50)
    print("📊 毎日のおすすめ銘柄テンプレート生成")
    print(f"⏰ 実行時刻: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50 + "\n")

    if not SLACK_WEBHOOK_URL:
        print("❌ SLACK_WEBHOOK_URLが設定されていません")
        sys.exit(1)

    conn = None
    try:
        # データベース接続
        conn = psycopg2.connect(DATABASE_URL)
        print("✅ データベース接続成功\n")

        # 上位3銘柄を取得
        top_picks = get_top_picks(conn)
        print(f"📋 取得した銘柄: {len(top_picks)}件\n")

        if len(top_picks) < 3:
            print("⚠️ 十分な分析結果が見つかりませんでした")
            sys.exit(0)

        # 投稿テンプレート生成
        template = generate_tweet_template(top_picks)
        print("📝 投稿テンプレート:\n")
        print(template)
        print("\n")

        # Slackに送信
        send_to_slack(SLACK_WEBHOOK_URL, template)

        print("\n" + "=" * 50)
        print("✅ 処理完了")
        print("=" * 50)

    except Exception as e:
        print(f"\n❌ エラーが発生しました: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)

    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    main()
