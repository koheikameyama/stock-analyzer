#!/usr/bin/env python3
"""
デイリーGoogle Analyticsレポート
毎日のアクセス状況をSlackに送信
"""

import os
import sys
import json
from datetime import datetime, timedelta
import requests
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    RunReportRequest,
)
from google.oauth2 import service_account

# 環境変数から設定を取得
GA4_PROPERTY_ID = "520219649"
SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')
GA4_CREDENTIALS_JSON = os.getenv('GA4_CREDENTIALS_JSON')


def get_analytics_client():
    """Google Analytics Data APIクライアントを取得"""
    if not GA4_CREDENTIALS_JSON:
        raise ValueError("GA4_CREDENTIALS_JSON environment variable is not set")

    credentials_info = json.loads(GA4_CREDENTIALS_JSON)
    credentials = service_account.Credentials.from_service_account_info(
        credentials_info,
        scopes=["https://www.googleapis.com/auth/analytics.readonly"]
    )
    return BetaAnalyticsDataClient(credentials=credentials)


def get_daily_metrics(client):
    """過去1日のメトリクスを取得"""
    yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')

    request = RunReportRequest(
        property=f"properties/{GA4_PROPERTY_ID}",
        date_ranges=[DateRange(start_date=yesterday, end_date=yesterday)],
        metrics=[
            Metric(name="activeUsers"),
            Metric(name="screenPageViews"),
            Metric(name="averageSessionDuration"),
            Metric(name="bounceRate"),
        ],
        dimensions=[
            Dimension(name="deviceCategory"),
        ],
    )

    response = client.run_report(request)
    return response


def get_top_pages(client):
    """人気ページTop 5を取得"""
    yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')

    request = RunReportRequest(
        property=f"properties/{GA4_PROPERTY_ID}",
        date_ranges=[DateRange(start_date=yesterday, end_date=yesterday)],
        metrics=[
            Metric(name="screenPageViews"),
        ],
        dimensions=[
            Dimension(name="pagePath"),
        ],
        order_bys=[{"metric": {"metric_name": "screenPageViews"}, "desc": True}],
        limit=5,
    )

    response = client.run_report(request)
    return response


def format_report(metrics_response, top_pages_response):
    """レポートをフォーマット"""
    yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y/%m/%d')

    # 合計メトリクス
    total_users = 0
    total_pageviews = 0
    total_duration = 0
    total_bounce_rate = 0
    device_data = {}

    for row in metrics_response.rows:
        device = row.dimension_values[0].value
        users = int(row.metric_values[0].value)
        pageviews = int(row.metric_values[1].value)
        duration = float(row.metric_values[2].value)
        bounce_rate = float(row.metric_values[3].value)

        total_users += users
        total_pageviews += pageviews
        device_data[device] = users

    # 平均値を計算（加重平均）
    if metrics_response.rows:
        weighted_duration = sum(
            int(row.metric_values[0].value) * float(row.metric_values[2].value)
            for row in metrics_response.rows
        )
        total_duration = weighted_duration / total_users if total_users > 0 else 0

        weighted_bounce = sum(
            int(row.metric_values[0].value) * float(row.metric_values[3].value)
            for row in metrics_response.rows
        )
        total_bounce_rate = weighted_bounce / total_users if total_users > 0 else 0

    # デバイス比率
    device_text = ""
    if device_data:
        for device, users in device_data.items():
            percentage = (users / total_users * 100) if total_users > 0 else 0
            device_text += f"  {device}: {users}人 ({percentage:.1f}%)\n"

    # 人気ページ
    top_pages_text = ""
    if top_pages_response.rows:
        for i, row in enumerate(top_pages_response.rows, 1):
            page_path = row.dimension_values[0].value
            page_views = row.metric_values[0].value
            top_pages_text += f"  {i}. {page_path} ({page_views} PV)\n"
    else:
        top_pages_text = "  データなし\n"

    # レポート作成
    report = f"""📊 デイリーアクセスレポート（{yesterday}）

👥 ユーザー数: {total_users}人
📄 ページビュー: {total_pageviews}回
⏱️ 平均滞在時間: {int(total_duration // 60)}分{int(total_duration % 60)}秒
📉 直帰率: {total_bounce_rate:.1f}%

📱 デバイス内訳:
{device_text}
🔝 人気ページ Top 5:
{top_pages_text}"""

    return report


def send_to_slack(message):
    """Slackに送信"""
    if not SLACK_WEBHOOK_URL:
        print("⚠️ SLACK_WEBHOOK_URLが設定されていません")
        print(message)
        return

    payload = {
        "text": message,
        "username": "GA Reporter Bot",
        "icon_emoji": ":chart_with_upwards_trend:"
    }

    response = requests.post(
        SLACK_WEBHOOK_URL,
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
    print("📊 デイリーGAレポート生成")
    print(f"⏰ 実行時刻: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50 + "\n")

    try:
        # Analytics クライアント取得
        client = get_analytics_client()
        print("✅ Google Analytics API接続成功\n")

        # データ取得
        print("📥 データ取得中...")
        metrics_response = get_daily_metrics(client)
        top_pages_response = get_top_pages(client)
        print("✅ データ取得完了\n")

        # レポート作成
        report = format_report(metrics_response, top_pages_response)
        print("📝 レポート:\n")
        print(report)
        print("\n")

        # Slackに送信
        send_to_slack(report)

        print("\n" + "=" * 50)
        print("✅ 処理完了")
        print("=" * 50)

    except Exception as e:
        print(f"\n❌ エラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
