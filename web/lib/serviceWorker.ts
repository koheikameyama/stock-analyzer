/**
 * Service Worker 登録・管理ユーティリティ
 */

let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

/**
 * Service Workerがサポートされているかチェック
 */
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Service Workerを登録（既に登録済みなら再利用）
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!isServiceWorkerSupported()) {
    throw new Error('Service Workerがサポートされていません');
  }

  // 既に登録済みのService Workerがあればそれを返す
  if (serviceWorkerRegistration) {
    return serviceWorkerRegistration;
  }

  // Service Workerを登録
  serviceWorkerRegistration = await navigator.serviceWorker.register('/custom-sw.js', {
    scope: '/',
  });

  console.log('[ServiceWorker] 登録完了:', serviceWorkerRegistration);

  // Service Workerが準備完了するまで待つ
  await navigator.serviceWorker.ready;

  return serviceWorkerRegistration;
}

/**
 * 既存のService Worker登録を取得
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    return null;
  }

  // キャッシュされた登録があればそれを返す
  if (serviceWorkerRegistration) {
    return serviceWorkerRegistration;
  }

  // ブラウザに登録されているService Workerを取得
  serviceWorkerRegistration = await navigator.serviceWorker.getRegistration('/');
  return serviceWorkerRegistration;
}

/**
 * Base64文字列をUint8Arrayに変換
 */
export function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}
