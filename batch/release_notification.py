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
    # 箇条書きを抽出
    lines = body.split('\n')
    features = []

    # "## Changes"セクションがあるかチェック
    has_changes_section = any('## Changes' in line for line in lines)

    if has_changes_section:
        # "## Changes"セクション内の箇条書きを抽出
        in_changes = False
        for line in lines:
            stripped = line.strip()
            if stripped.startswith('## Changes'):
                in_changes = True
                continue
            elif (stripped.startswith('---') or stripped.startswith('##')) and in_changes:
                break
            elif in_changes and stripped.startswith('-'):
                feature = stripped.lstrip('-').strip()
                if feature and not feature.startswith('**Full') and not feature.startswith('**Author'):
                    features.append(feature)
    else:
        # セクションなしの場合、全ての箇条書きを抽出
        for line in lines:
            stripped = line.strip()
            if stripped.startswith('-'):
                feature = stripped.lstrip('-').strip()
                if feature:
                    features.append(feature)

    # 各項目を簡潔に変換
    def shorten_feature(feature: str) -> str:
        """項目を簡潔に変換（絵文字はそのまま保持）"""
        # "新機能:" や "改善:" の部分を削除
        feature = feature.replace('新機能:', '').replace('改善:', '').replace('修正:', '')
        # "〜を" や "〜が" などの助詞を削除してさらに簡潔に
        feature = feature.replace('を受け取れるようになりました', '')
        feature = feature.replace('できるようになりました', '')
        feature = feature.replace('しました', '')
        return feature.strip()

    # X投稿テキスト生成（140文字以内）
    base_text = f"🎉 {title}リリース\n\n"
    url = "\n\nhttps://stock-analyzer.jp/\n\n#AI株式分析 #投資ツール"

    # 残り文字数を計算
    remaining = 140 - len(base_text) - len(url)

    # 新機能を追加（文字数制限内で）
    feature_text = ""
    for feature in features[:3]:  # 最大3つまで
        # まず簡潔版を試す
        shortened = shorten_feature(feature)
        short_line = f"{shortened}\n"

        # 簡潔版で入るかチェック
        if len(feature_text) + len(short_line) <= remaining:
            feature_text += short_line
        # 元のままでも入るかチェック
        elif len(feature_text) + len(f"{feature}\n") <= remaining:
            feature_text += f"{feature}\n"
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

    # X投稿用テキストを送信（コピーしやすい形式）
    # 各行を引用符で囲んで改行を保持
    quoted_text = '\n'.join([f"> {line}" if line else ">" for line in x_post_text.split('\n')])

    payload = {
        "text": f"<!channel> 📢 *X投稿テンプレート*\n\n以下をコピーしてXに投稿してください👇\n\n{quoted_text}\n\n文字数: {len(x_post_text)}",
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
