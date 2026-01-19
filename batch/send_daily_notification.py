"""
日次更新完了通知スクリプト
日次分析完了時にWeb Push通知を送信する

使い方:
    python send_daily_notification.py
"""

import os
import sys
import requests
from datetime import datetime

# APIエンドポイント
API_BASE_URL = os.getenv('API_BASE_URL', 'https://stock-analyzer-kohei.vercel.app')
NOTIFICATION_ENDPOINT = f'{API_BASE_URL}/api/push-notifications/send'


def send_notification():
    """プッシュ通知を送信"""
    try:
        # 日本時間で現在の日付を取得
        today = datetime.now().strftime('%Y年%m月%d日')

        # 通知ペイロード
        payload = {
            'title': '📊 本日の分析が完了しました',
            'body': f'{today}の株式分析が完了しました。最新の投資アイデアをチェックしましょう！',
            'url': '/'
        }

        print(f'プッシュ通知を送信中...')
        print(f'エンドポイント: {NOTIFICATION_ENDPOINT}')
        print(f'ペイロード: {payload}')

        # APIリクエスト
        response = requests.post(
            NOTIFICATION_ENDPOINT,
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )

        # レスポンスを確認
        response.raise_for_status()
        result = response.json()

        print('✅ 通知送信成功')
        print(f'送信数: {result.get("sentCount", 0)}')
        print(f'失敗数: {result.get("failureCount", 0)}')
        print(f'総購読数: {result.get("totalSubscriptions", 0)}')

        return True

    except requests.exceptions.RequestException as e:
        print(f'❌ 通知送信エラー: {e}', file=sys.stderr)
        if hasattr(e, 'response') and e.response is not None:
            print(f'レスポンス: {e.response.text}', file=sys.stderr)
        return False
    except Exception as e:
        print(f'❌ 予期しないエラー: {e}', file=sys.stderr)
        return False


def main():
    """メイン処理"""
    print('=' * 60)
    print('日次更新通知スクリプト')
    print('=' * 60)
    print()

    success = send_notification()

    print()
    print('=' * 60)
    if success:
        print('✅ 通知送信が完了しました')
        sys.exit(0)
    else:
        print('❌ 通知送信に失敗しました')
        sys.exit(1)


if __name__ == '__main__':
    main()
