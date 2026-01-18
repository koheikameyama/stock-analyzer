#!/usr/bin/env python3
"""
リリース通知をSlackに送信するスクリプト
GitHub Releaseのrelease-notificationワークフローから呼び出される
"""

import os
import sys
import json
import requests
from typing import Optional


def send_slack_notification(
    webhook_url: str,
    title: str,
    body: str,
    post_template: str
) -> bool:
    """
    Slackにリリース通知を送信する

    Args:
        webhook_url: Slack Webhook URL
        title: リリースタイトル
        body: リリース内容
        post_template: X投稿テンプレート

    Returns:
        bool: 送信成功時True
    """
    # メッセージを構築
    message = f"""<!channel> 📢 *リリース通知*

*【タイトル】*
{title}

*【変更内容】*
{body}

━━━━━━━━━━━━━━━
💡 *X投稿候補:*
```
{post_template}
```

📝 このメッセージをコピーしてXに投稿してください"""

    # Slackペイロード
    payload = {
        "text": message,
        "username": "Release Bot",
        "icon_emoji": ":rocket:"
    }

    try:
        response = requests.post(
            webhook_url,
            data=json.dumps(payload),
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        response.raise_for_status()
        print(f"✅ Slackへの送信成功: {response.status_code}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Slackへの送信失敗: {e}", file=sys.stderr)
        return False


def main():
    """メイン処理"""
    # 環境変数から取得
    webhook_url = os.getenv('SLACK_WEBHOOK_URL')
    title = os.getenv('TITLE', '')
    body = os.getenv('BODY', '')
    post_template = os.getenv('POST_TEMPLATE', '')

    # バリデーション
    if not webhook_url:
        print("❌ SLACK_WEBHOOK_URL環境変数が設定されていません", file=sys.stderr)
        sys.exit(1)

    if not title:
        print("❌ TITLE環境変数が設定されていません", file=sys.stderr)
        sys.exit(1)

    # デバッグ情報
    print(f"Title: {title}")
    print(f"Body length: {len(body)}")
    print(f"Post template length: {len(post_template)}")

    # Slack通知送信
    success = send_slack_notification(webhook_url, title, body, post_template)

    if not success:
        sys.exit(1)


if __name__ == '__main__':
    main()
