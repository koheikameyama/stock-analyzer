'use client';

import { useState, useEffect } from 'react';

/**
 * プッシュ通知購読トグルコンポーネント
 * ユーザーがプッシュ通知を有効/無効にするためのUIを提供
 */
export default function PushNotificationToggle() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // プッシュ通知がサポートされているか確認
    const checkSupport = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        setIsSupported(true);

        // 既存の購読状態を確認
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(subscription !== null);
        } catch (error) {
          console.error('購読状態の確認に失敗しました:', error);
        }
      }
    };

    checkSupport();
  }, []);

  /**
   * Base64文字列をUint8Arrayに変換
   */
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  /**
   * プッシュ通知を購読する
   */
  const subscribe = async () => {
    setIsLoading(true);

    try {
      // Service Workerの登録を待つ
      const registration = await navigator.serviceWorker.ready;

      // 通知の許可をリクエスト
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        alert('通知の許可が必要です');
        setIsLoading(false);
        return;
      }

      // VAPID公開鍵を取得
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error('VAPID公開鍵が設定されていません');
        alert('設定エラー: VAPID公開鍵が見つかりません');
        setIsLoading(false);
        return;
      }

      // プッシュ通知を購読
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // サーバーに購読情報を送信
      const response = await fetch('/api/push-notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!response.ok) {
        throw new Error('購読の保存に失敗しました');
      }

      setIsSubscribed(true);
      alert('プッシュ通知を有効にしました');
    } catch (error) {
      console.error('購読エラー:', error);
      alert('プッシュ通知の有効化に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * プッシュ通知の購読を解除する
   */
  const unsubscribe = async () => {
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        setIsSubscribed(false);
        setIsLoading(false);
        return;
      }

      // サーバーから購読情報を削除
      await fetch('/api/push-notifications/subscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription.toJSON()),
      });

      // ブラウザの購読を解除
      await subscription.unsubscribe();

      setIsSubscribed(false);
      alert('プッシュ通知を無効にしました');
    } catch (error) {
      console.error('購読解除エラー:', error);
      alert('プッシュ通知の無効化に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // サポートされていない場合は何も表示しない
  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900">
          日次更新通知
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {isSubscribed
            ? '毎日の分析完了時にプッシュ通知を受け取ります'
            : '分析完了時にプッシュ通知を受け取る'}
        </p>
      </div>
      <button
        onClick={isSubscribed ? unsubscribe : subscribe}
        disabled={isLoading}
        className={`
          px-4 py-2 text-sm font-medium rounded-lg transition-colors
          ${
            isSubscribed
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isLoading ? '処理中...' : isSubscribed ? '無効にする' : '有効にする'}
      </button>
    </div>
  );
}
