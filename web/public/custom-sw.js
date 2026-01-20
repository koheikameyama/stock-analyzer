/**
 * カスタムService Worker（push通知対応版）
 * push通知専用の軽量なService Worker
 */

// next-pwaが生成したsw.jsがあれば読み込む（本番環境のみ）
try {
  importScripts('/sw.js');
} catch (e) {
  console.log('[Custom SW] sw.js not found, using standalone mode');
}

// プッシュ通知を受信したときの処理
self.addEventListener('push', function(event) {
  console.log('[Custom SW] Push notification received:', event);

  // デフォルトの通知オプション
  let notificationData = {
    title: 'AI株式分析ツール',
    body: '新しい分析結果が利用可能です',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: {
      url: '/'
    }
  };

  // プッシュメッセージにデータがある場合は使用
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        data: data.data || notificationData.data
      };
    } catch (e) {
      console.error('[Custom SW] Failed to parse push notification data:', e);
    }
  }

  // 通知を表示
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data
    })
  );
});

// 通知をクリックしたときの処理
self.addEventListener('notificationclick', function(event) {
  console.log('[Custom SW] Notification clicked:', event);

  event.notification.close();

  // 通知に紐づくURLを開く
  const urlToOpen = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // 既に開いているウィンドウがあればそれをフォーカス
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // なければ新しいウィンドウを開く
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

console.log('[Custom SW] Custom Service Worker with push notification support loaded');
