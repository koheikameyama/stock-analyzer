'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface Release {
  version: string;
  title: string;
  body: string;
  publishedAt: string;
  url: string;
}

export const ReleaseNoteModal: React.FC = () => {
  const [release, setRelease] = useState<Release | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelease = async () => {
      try {
        const response = await fetch('/api/releases/latest');
        if (!response.ok) {
          console.warn('Failed to fetch release:', response.status);
          setIsLoading(false);
          return;
        }

        const data = await response.json();

        // エラーレスポンスの場合は処理を中断
        if (data.error) {
          console.warn('Release API returned error:', data.error);
          setIsLoading(false);
          return;
        }

        setRelease(data);

        // localStorageで表示済みバージョンをチェック
        const lastSeenVersion = localStorage.getItem('lastSeenReleaseVersion');
        if (lastSeenVersion !== data.version) {
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Failed to fetch release:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelease();
  }, []);

  const handleClose = () => {
    if (release) {
      localStorage.setItem('lastSeenReleaseVersion', release.version);
    }
    setIsOpen(false);
  };

  if (isLoading || !isOpen || !release) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-2xl sm:text-3xl flex-shrink-0">🎉</span>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-white truncate">{release.title}</h2>
              <p className="text-primary-100 text-xs sm:text-sm">
                {new Date(release.publishedAt).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors flex-shrink-0"
            aria-label="閉じる"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0">
          <div className="prose prose-sm max-w-none text-surface-900">
            <ReactMarkdown>{release.body}</ReactMarkdown>
          </div>
        </div>

        {/* フッター */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-surface-50 border-t border-surface-200 flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between items-stretch sm:items-center flex-shrink-0">
          <a
            href="/releases"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors text-center sm:text-left"
          >
            過去のリリースを見る →
          </a>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
