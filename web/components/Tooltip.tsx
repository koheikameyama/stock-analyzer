/**
 * ツールチップコンポーネント
 * はてなアイコンをホバーまたはクリックすると説明が表示される
 */

import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-surface-200 hover:bg-surface-300 text-surface-600 hover:text-surface-900 transition-colors ml-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        aria-label="詳細情報"
      >
        <svg
          className="w-3 h-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {isVisible && (
        <>
          {/* オーバーレイ（モバイル用） */}
          <div
            className="fixed inset-0 z-[60] md:hidden"
            onClick={() => setIsVisible(false)}
          />

          {/* ツールチップコンテンツ */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 z-[70] w-64 md:w-72">
            <div className="bg-surface-900 text-white text-sm rounded-lg p-3 shadow-xl border border-surface-700">
              <div className="whitespace-pre-wrap leading-relaxed">
                {content}
              </div>
              {/* 矢印 */}
              <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full">
                <div className="border-4 border-transparent border-b-surface-900"></div>
              </div>
            </div>
          </div>
        </>
      )}

      {children}
    </div>
  );
};
