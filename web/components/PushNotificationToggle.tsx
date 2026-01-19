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

        // Service Workerを登録（push通知対応版）
        try {
          const registration = await navigator.serviceWorker.register('/custom-sw.js', {
            scope: '/'
          });
          console.log('Custom Service Worker registered:', registration);

          // Service Workerが準備完了するまで待つ
          await navigator.serviceWorker.ready;

          // 既存の購読状態を確認
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(subscription !== null);
        } catch (error) {
          console.error('Service Worker登録または購読状態の確認に失敗しました:', error);
        }
      }
    };

    checkSupport();
  }, []);

  /**
   * Base64文字列をUint8Arrayに変換
   */
  const urlBase64ToUint8Array = (base64String: string): ArrayBuffer => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
  };

  /**
   * プッシュ通知を購読する
   */
  const subscribe = async () => {
    setIsLoading(true);

    try {
      console.log('[Toggle] 1. 購読開始');
      // Service Workerの登録を待つ
      const registration = await navigator.serviceWorker.ready;
      console.log('[Toggle] 2. Service Worker準備完了', registration);

      // 通知の許可をリクエスト
      const permission = await Notification.requestPermission();
      console.log('[Toggle] 3. 通知許可:', permission);

      if (permission !== 'granted') {
        alert('通知の許可が必要です');
        setIsLoading(false);
        return;
      }

      // VAPID公開鍵を取得
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      console.log('[Toggle] 4. VAPID公開鍵:', vapidPublicKey ? '設定済み' : '未設定');
      if (!vapidPublicKey) {
        console.error('VAPID公開鍵が設定されていません');
        alert('設定エラー: VAPID公開鍵が見つかりません');
        setIsLoading(false);
        return;
      }

      console.log('[Toggle] 5. プッシュ購読開始');
      // プッシュ通知を購読
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      console.log('[Toggle] 6. プッシュ購読完了', subscription);

      console.log('[Toggle] 7. サーバーへ送信開始');
      // サーバーに購読情報を送信
      const response = await fetch('/api/push-notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription.toJSON()),
      });
      console.log('[Toggle] 8. サーバーレスポンス:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`購読の保存に失敗しました: ${JSON.stringify(errorData)}`);
      }

      console.log('[Toggle] 9. 完了');
      setIsSubscribed(true);
      alert('プッシュ通知を有効にしました');
    } catch (error) {
      console.error('[Toggle] エラー:', error);
      alert(`プッシュ通知の有効化に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
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
    <div className="flex items-center justify-between gap-3 text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <span className="text-gray-500">🔔</span>
        <span>日次更新通知</span>
      </div>
      <button
        onClick={isSubscribed ? unsubscribe : subscribe}
        disabled={isLoading}
        className={`
          px-3 py-1.5 text-xs font-medium rounded-md transition-colors
          ${
            isSubscribed
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isLoading ? '処理中...' : isSubscribed ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}
