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


def generate_x_post(title: str, body: str) -> str:
    """
    X投稿用のテキストを生成（140文字制限）

    Args:
        title: リリースタイトル
        body: リリース内容

    Returns:
        str: X投稿テキスト
    """
    # "## Changes"セクション内の箇条書きを抽出
    lines = body.split('\n')
    features = []
    in_changes = False

    for line in lines:
        stripped = line.strip()
        # "## Changes"セクションを探す
        if stripped.startswith('## Changes'):
            in_changes = True
            continue
        # 次のセクション（---や##）が来たら終了
        elif (stripped.startswith('---') or stripped.startswith('##')) and in_changes:
            break
        # 箇条書き行を抽出
        elif in_changes and stripped.startswith('-'):
            # "- " を除去して取得
            feature = stripped.lstrip('-').strip()
            # 空行や不要な内容をスキップ
            if feature and not feature.startswith('**Full') and not feature.startswith('**Author'):
                features.append(feature)

    # X投稿テキスト生成（140文字以内）
    base_text = f"🎉 {title}リリース\n\n"
    url = "\n\nhttps://stock-analyzer.jp/\n\n#AI株式分析 #投資ツール"

    # 残り文字数を計算
    remaining = 140 - len(base_text) - len(url)

    # 新機能を追加（文字数制限内で）
    feature_text = ""
    for feature in features[:3]:  # 最大3つまで
        # そのまま使用（絵文字が既に含まれている）
        line = f"{feature}\n"
        if len(feature_text) + len(line) <= remaining:
            feature_text += line
        else:
            break

    return base_text + feature_text + url


def send_slack_notification(
    webhook_url: str,
    title: str,
    body: str,
    post_template: str
) -> bool:
    """
    SlackにX投稿テンプレートを送信する

    Args:
        webhook_url: Slack Webhook URL
        title: リリースタイトル
        body: リリース内容
        post_template: X投稿テンプレート（未使用、独自生成）

    Returns:
        bool: 送信成功時True
    """
    # X投稿用テキストを生成（140文字制限）
    x_post_text = generate_x_post(title, body)

    # X投稿用テキストを送信（weekly-summary形式）
    payload = {
        "text": f"<!channel> 📢 *X投稿テンプレート*\n\n以下をコピーしてXに投稿してください👇\n\n```\n{x_post_text}\n```\n\n文字数: {len(x_post_text)}",
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
