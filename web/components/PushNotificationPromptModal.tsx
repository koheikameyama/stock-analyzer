'use client';

import { useEffect, useState } from 'react';

/**
 * プッシュ通知許可を促すモーダル
 * 初回訪問時やまだ許可していないユーザーに自動で表示
 */
export const PushNotificationPromptModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAndShowPrompt = async () => {
      // プッシュ通知がサポートされているか確認
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return;
      }

      // 既にモーダルを閉じた履歴があるか確認
      const hasClosedPrompt = localStorage.getItem('pushNotificationPromptClosed');
      if (hasClosedPrompt) {
        return;
      }

      // 既に通知許可済みか確認
      if (Notification.permission === 'granted') {
        return;
      }

      // 通知を拒否している場合は表示しない
      if (Notification.permission === 'denied') {
        localStorage.setItem('pushNotificationPromptClosed', 'true');
        return;
      }

      // 少し遅延してからモーダルを表示（UX向上）
      setTimeout(() => {
        setIsOpen(true);
      }, 3000); // 3秒後に表示
    };

    checkAndShowPrompt();
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
   * タイムアウト付きPromise
   */
  const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
      )
    ]);
  };

  /**
   * プッシュ通知を有効にする
   */
  const handleEnable = async () => {
    setIsLoading(true);

    try {
      console.log('[Push] 1. Service Worker登録開始');
      // Service Workerを登録（10秒タイムアウト）
      const registration = await withTimeout(
        navigator.serviceWorker.register('/custom-sw.js', { scope: '/' }),
        10000,
        'Service Workerの登録がタイムアウトしました'
      );
      console.log('[Push] 2. Service Worker登録完了', registration);

      await withTimeout(
        navigator.serviceWorker.ready,
        10000,
        'Service Workerの準備がタイムアウトしました'
      );
      console.log('[Push] 3. Service Worker準備完了');

      // 通知の許可をリクエスト
      const permission = await Notification.requestPermission();
      console.log('[Push] 4. 通知許可:', permission);

      if (permission !== 'granted') {
        localStorage.setItem('pushNotificationPromptClosed', 'true');
        setIsOpen(false);
        return;
      }

      // VAPID公開鍵を取得
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      console.log('[Push] 5. VAPID公開鍵:', vapidPublicKey ? '設定済み' : '未設定');
      if (!vapidPublicKey) {
        throw new Error('VAPID公開鍵が設定されていません');
      }

      console.log('[Push] 6. プッシュ購読開始');
      // プッシュ通知を購読（30秒タイムアウト）
      const subscription = await withTimeout(
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        }),
        30000,
        'プッシュ通知の購読がタイムアウトしました'
      );
      console.log('[Push] 7. プッシュ購読完了', subscription);

      console.log('[Push] 8. サーバーへ送信開始');
      // サーバーに購読情報を送信（10秒タイムアウト）
      const response = await withTimeout(
        fetch('/api/push-notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription.toJSON()),
        }),
        10000,
        'サーバーへの送信がタイムアウトしました'
      );
      console.log('[Push] 9. サーバーレスポンス:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`購読の保存に失敗しました: ${JSON.stringify(errorData)}`);
      }

      console.log('[Push] 10. 完了');

      localStorage.setItem('pushNotificationPromptClosed', 'true');
      setIsOpen(false);
      alert('プッシュ通知を有効にしました！');
    } catch (error) {
      console.error('プッシュ通知の有効化エラー:', error);
      alert(`エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 後で決めるボタン
   */
  const handleLater = () => {
    // 後で決める場合は、次回訪問時にまた表示する
    setIsOpen(false);
  };

  /**
   * 不要ボタン
   */
  const handleDismiss = () => {
    localStorage.setItem('pushNotificationPromptClosed', 'true');
    setIsOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-up">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-center">
          <div className="text-5xl mb-2">🔔</div>
          <h2 className="text-xl font-bold text-white">分析完了をお知らせ</h2>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          <p className="text-surface-700 text-center mb-4">
            毎日18:00の分析完了時に、プッシュ通知でお知らせします。
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 mt-0.5">✓</span>
              <p className="text-sm text-surface-700">
                最新の分析結果をすぐに確認できます
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-600 mt-0.5">✓</span>
              <p className="text-sm text-surface-700">
                投資チャンスを見逃しません
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-600 mt-0.5">✓</span>
              <p className="text-sm text-surface-700">
                いつでも設定から無効にできます
              </p>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={handleEnable}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '処理中...' : '通知を有効にする'}
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleLater}
              className="flex-1 px-4 py-2 text-surface-600 hover:bg-surface-50 rounded-lg text-sm transition-colors"
            >
              後で
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2 text-surface-600 hover:bg-surface-50 rounded-lg text-sm transition-colors"
            >
              不要
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
