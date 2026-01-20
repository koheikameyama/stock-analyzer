/**
 * ツールチップコンポーネント
 * はてなアイコンをホバーまたはクリックすると説明が表示される
 * スマホ対応：画面端で見切れないように自動調整
 */

import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'center' | 'left' | 'right'>('center');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // ツールチップの位置を計算
  useEffect(() => {
    if (!isVisible || !buttonRef.current || !tooltipRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    // 中央揃えで表示した場合の左右の位置
    const centerLeft = buttonRect.left + buttonRect.width / 2 - tooltipRect.width / 2;
    const centerRight = centerLeft + tooltipRect.width;

    // 画面端から余白（8px）
    const margin = 8;

    if (centerLeft < margin) {
      // 左端で見切れる場合は左寄せ
      setPosition('left');
    } else if (centerRight > viewportWidth - margin) {
      // 右端で見切れる場合は右寄せ
      setPosition('right');
    } else {
      // 問題なければ中央揃え
      setPosition('center');
    }
  }, [isVisible]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
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
          <div
            ref={tooltipRef}
            className={`absolute top-full mt-2 z-[70] w-64 md:w-72 ${
              position === 'left'
                ? 'left-0'
                : position === 'right'
                ? 'right-0'
                : 'left-1/2 transform -translate-x-1/2'
            }`}
          >
            <div className="bg-surface-900 text-white text-sm rounded-lg p-3 shadow-xl border border-surface-700">
              <div className="whitespace-pre-wrap leading-relaxed">
                {content}
              </div>
              {/* 矢印 */}
              <div
                className={`absolute bottom-full ${
                  position === 'left'
                    ? 'left-4'
                    : position === 'right'
                    ? 'right-4'
                    : 'left-1/2 transform -translate-x-1/2'
                }`}
              >
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
