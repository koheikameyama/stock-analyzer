'use client';

import { useState, useEffect } from 'react';
import {
  isServiceWorkerSupported,
  registerServiceWorker,
  urlBase64ToUint8Array,
} from '@/lib/serviceWorker';

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
      if (!isServiceWorkerSupported()) {
        return;
      }

      setIsSupported(true);

      // Service Workerを登録して購読状態を確認
      try {
        const registration = await registerServiceWorker();

        // 既存の購読状態を確認
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(subscription !== null);
      } catch (error) {
        console.error('Service Worker登録または購読状態の確認に失敗しました:', error);
      }
    };

    checkSupport();
  }, []);

  /**
   * プッシュ通知を購読する
   */
  const subscribe = async () => {
    setIsLoading(true);

    try {
      // Service Workerの登録を取得
      const registration = await registerServiceWorker();

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
      const registration = await registerServiceWorker();
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
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-gray-700 font-medium">🔔 日次更新通知</span>
        </div>
        <p className="text-xs text-gray-500">
          毎日の分析結果をプッシュ通知でお知らせします
        </p>
      </div>

      {/* トグルスイッチ */}
      <button
        onClick={isSubscribed ? unsubscribe : subscribe}
        disabled={isLoading}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isSubscribed ? 'bg-blue-600' : 'bg-gray-300'}
        `}
        role="switch"
        aria-checked={isSubscribed}
        aria-label="日次更新通知"
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${isSubscribed ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
}
