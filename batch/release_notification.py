#!/usr/bin/env python3
"""
リリース通知をSlackに送信するスクリプト
GitHub Releaseのrelease-notificationワークフローから呼び出される
"""

import os
import sys
import json
import requests


def generate_x_post_with_ai(title: str, body: str, api_key: str) -> str:
    """
    OpenAI APIを使ってX投稿用のテキストを生成

    Args:
        title: リリースタイトル
        body: リリース内容（マークダウン形式）
        api_key: OpenAI API Key

    Returns:
        str: X投稿テキスト
    """
    prompt = f"""以下のリリースノートをもとに、X(Twitter)投稿用の魅力的な文章を生成してください。

リリースタイトル: {title}
リリース内容:
{body}

要件:
- **140文字以内（厳守）**
- ユーザーにとっての価値を簡潔に伝える
- 絵文字を適度に使用
- 以下のフォーマットで出力:

🎉 {title}リリース

[ここに魅力的な1-2行の説明]

https://stock-analyzer.jp/
#AI株式分析 #投資ツール

注意:
- 全体で140文字以内に収める（厳守）
- URLとハッシュタグは必ず含める
- 技術的な詳細は避け、ユーザーメリットを強調
"""

    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
            json={
                "model": "gpt-4o-mini",
                "messages": [
                    {
                        "role": "system",
                        "content": "あなたはSNS投稿の専門家です。リリースノートを魅力的なX投稿に変換してください。",
                    },
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.7,
            },
            timeout=30,
        )
        response.raise_for_status()

        result = response.json()
        x_post = result["choices"][0]["message"]["content"].strip()

        print("✅ X投稿テキスト生成成功")
        return x_post

    except requests.exceptions.RequestException as e:
        print(f"⚠️ AI生成失敗、フォールバックを使用: {e}", file=sys.stderr)
        # フォールバック: シンプルな形式
        fallback = (
            f"🎉 {title}リリース\n\n"
            "新機能を追加しました！\n\n"
            "https://stock-analyzer.jp/\n"
            "#AI株式分析 #投資ツール"
        )
        return fallback


def send_slack_notification(
    webhook_url: str, title: str, body: str, api_key: str
) -> bool:
    """
    SlackにX投稿テンプレートを送信する

    Args:
        webhook_url: Slack Webhook URL
        title: リリースタイトル
        body: リリース内容
        api_key: OpenAI API Key

    Returns:
        bool: 送信成功時True
    """
    # AIでX投稿用テキストを生成
    x_post_text = generate_x_post_with_ai(title, body, api_key)

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
    openai_api_key = os.getenv("OPENAI_API_KEY")
    title = os.getenv("TITLE", "")
    body = os.getenv("BODY", "")

    # バリデーション
    if not webhook_url:
        print("❌ SLACK_WEBHOOK_URL環境変数が設定されていません", file=sys.stderr)
        sys.exit(1)

    if not openai_api_key:
        print("❌ OPENAI_API_KEY環境変数が設定されていません", file=sys.stderr)
        sys.exit(1)

    if not title:
        print("❌ TITLE環境変数が設定されていません", file=sys.stderr)
        sys.exit(1)

    # デバッグ情報
    print(f"Title: {title}")
    print(f"Body length: {len(body)}")

    # Slack通知送信
    success = send_slack_notification(webhook_url, title, body, openai_api_key)

    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()
