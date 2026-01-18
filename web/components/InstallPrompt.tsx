/**
 * PWAインストールプロンプトコンポーネント
 */

'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // デフォルトのインストールプロンプトを防ぐ
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // 既に閉じた場合は表示しない
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // インストールプロンプトを表示
    await deferredPrompt.prompt();

    // ユーザーの選択を待つ
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed');
    }

    // プロンプトをクリア
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // 閉じたことを記録（24時間後に再表示）
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    localStorage.setItem('pwa-install-dismissed', tomorrow.toISOString());
  };

  // 既にインストール済みの場合は表示しない
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-2xl border border-surface-200 p-4 z-50 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-surface-900 mb-1">アプリとして使えます</h3>
          <p className="text-sm text-surface-600 mb-3">
            ホーム画面に追加して、いつでも素早くアクセスできます
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors text-sm"
            >
              インストール
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 font-medium rounded-lg transition-colors text-sm"
            >
              後で
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-surface-400 hover:text-surface-600 transition-colors"
          aria-label="閉じる"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
