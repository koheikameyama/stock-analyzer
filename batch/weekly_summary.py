#!/usr/bin/env python3
"""
週次投稿テンプレート生成スクリプト
X（Twitter）投稿用のテンプレートをSlackに送信
"""

import os
import sys
from datetime import datetime, timedelta
from typing import List, Dict
import json
import requests

import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# .env読み込み
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

DATABASE_URL = os.getenv('DATABASE_URL')
SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')


def get_latest_analyses(conn) -> List[Dict]:
    """
    最新の分析結果を取得

    Returns:
        List[Dict]: 分析結果のリスト
    """
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT
                s.ticker,
                s.name,
                a.recommendation,
                a."confidenceScore",
                a.reason,
                a."analysisDate"
            FROM analyses a
            JOIN stocks s ON a."stockId" = s.id
            WHERE a."analysisDate" >= NOW() - INTERVAL '7 days'
            ORDER BY a."confidenceScore" DESC
        """)
        return cur.fetchall()


def generate_tweet_template(analyses: List[Dict]) -> str:
    """
    X投稿用テンプレートを生成

    Args:
        analyses: 分析結果のリスト

    Returns:
        str: 投稿テンプレート
    """
    # 推奨別に分類
    buy_list = [a for a in analyses if a['recommendation'] == 'Buy']
    hold_list = [a for a in analyses if a['recommendation'] == 'Hold']
    sell_list = [a for a in analyses if a['recommendation'] == 'Sell']

    # 信頼度順にソート（上位3つまで）
    buy_top3 = sorted(buy_list, key=lambda x: x['confidenceScore'], reverse=True)[:3]

    # 日付範囲を計算
    today = datetime.now()
    week_start = (today - timedelta(days=6)).strftime('%-m/%-d')
    week_end = today.strftime('%-m/%-d')

    # テンプレート生成
    template = f"""📊 今週のAI分析まとめ（{week_start}-{week_end}）

【強気推奨】"""

    if buy_top3:
        for stock in buy_top3:
            template += f"\n✅ {stock['name']}（信頼度{stock['confidenceScore']}%）"
    else:
        template += "\n（なし）"

    template += f"\n\n【様子見】\n➡️ {len(hold_list)}銘柄"

    template += f"\n\n【弱気】"
    if sell_list:
        template += f"\n⚠️ {len(sell_list)}銘柄"
    else:
        template += "\n（なし）"

    template += """

詳細分析はこちら👇
https://stock-analyzer.jp/

#日本株 #AI株式分析 #投資"""

    return template


def send_to_slack(webhook_url: str, message: str):
    """
    Slackに投稿テンプレートを送信

    Args:
        webhook_url: Slack Webhook URL
        message: 送信するメッセージ
    """
    payload = {
        "text": "📢 *週次X投稿テンプレート*\n\n以下をコピーしてXに投稿してください👇\n\n```\n" + message + "\n```",
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
    print("\n" + "=" * 50)
    print("📊 週次投稿テンプレート生成")
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

        # 最新の分析結果を取得
        analyses = get_latest_analyses(conn)
        print(f"📋 取得した分析結果: {len(analyses)}件\n")

        if not analyses:
            print("⚠️ 分析結果が見つかりませんでした")
            sys.exit(0)

        # 投稿テンプレート生成
        template = generate_tweet_template(analyses)
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
        sys.exit(1)

    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    main()
