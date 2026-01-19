'use client';

import { useEffect } from 'react';

/**
 * Service Worker登録コンポーネント
 * push通知用のカスタムイベントハンドラーを含むService Workerを登録
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // next-pwaが自動生成したService Workerを登録
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('Service Worker registered:', registration);

          // カスタムService Workerのコードを追加で読み込む
          // これによりpush通知のイベントハンドラーが追加される
          return navigator.serviceWorker.ready.then(() => {
            // Service Workerが準備完了したら、カスタムコードを実行
            if (registration.active) {
              registration.active.postMessage({
                type: 'INIT_CUSTOM_HANDLERS'
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return null; // このコンポーネントは何も表示しない
}
