#!/usr/bin/env python3
"""
リリース通知をSlackに送信するスクリプト
GitHub Releaseのrelease-notificationワークフローから呼び出される
"""

import os
import sys
import json
import requests


def generate_x_post(title: str, body: str) -> str:
    """
    X投稿用のテキストを生成（日本語140文字制限、ぶつ切り防止）

    Args:
        title: リリースタイトル
        body: リリース内容（シンプルな箇条書き）

    Returns:
        str: X投稿テキスト（140文字以内、項目単位で完結）
    """
    # 箇条書きを抽出
    lines = body.split("\n")
    features = []

    # "## 更新内容"セクション内の箇条書きを抽出
    in_changes = False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("## 更新内容"):
            in_changes = True
            continue
        elif in_changes and (
            stripped.startswith("---") or stripped.startswith("##")
        ):
            break
        elif in_changes and stripped.startswith("-"):
            # "- " を除去（ユーザー向け説明文をそのまま使用）
            feature = stripped.lstrip("-").strip()
            if feature:
                features.append(feature)

    # X投稿テキスト生成（140文字以内）
    base_text = f"🎉 {title}リリース\n\n"
    url = "\n\nhttps://stock-analyzer.jp/\n#AI株式分析 #投資ツール"

    # 残り文字数を計算（140文字制限）
    max_length = 140
    remaining = max_length - len(base_text) - len(url)

    # ユーザー向け説明を追加（文字数制限内で、ぶつ切り防止）
    feature_text = ""
    added_count = 0

    for feature in features:
        line = f"・{feature}\n"

        # 項目全体が入る場合のみ追加（ぶつ切り防止）
        if len(feature_text) + len(line) <= remaining:
            feature_text += line
            added_count += 1
        else:
            # 入らない場合は追加せずに終了（ぶつ切り防止）
            break

    # 省略記号を追加（追加できなかった項目がある場合）
    if added_count < len(features):
        ellipsis = "他"
        if len(feature_text) + len(ellipsis) <= remaining:
            feature_text += ellipsis

    final_text = base_text + feature_text + url

    return final_text


def send_slack_notification(
    webhook_url: str, title: str, body: str, post_template: str
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

    # X投稿用テキストを送信
    message_text = (
        f"<!channel> 📢 *X投稿テンプレート*\n\n"
        f"以下をコピーしてXに投稿してください👇\n\n"
        f"```\n{x_post_text}\n```\n\n"
        f"文字数: {len(x_post_text)}"
    )
    payload = {
        "text": message_text,
        "username": "Release Bot",
        "icon_emoji": ":rocket:",
    }

    try:
        response = requests.post(
            webhook_url,
            data=json.dumps(payload),
            headers={"Content-Type": "application/json"},
            timeout=10,
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
    webhook_url = os.getenv("SLACK_WEBHOOK_URL")
    title = os.getenv("TITLE", "")
    body = os.getenv("BODY", "")
    post_template = os.getenv("POST_TEMPLATE", "")

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


if __name__ == "__main__":
    main()
