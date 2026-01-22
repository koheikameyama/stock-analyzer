/**
 * フローティングフィードバックボタン
 * 画面右下に常時表示され、フィードバックフォームへのリンクを提供
 */

'use client';

import { useState } from 'react';

export const FloatingFeedbackButton: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href="https://forms.gle/irNjkWEqAfvuVrip9"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
      aria-label="フィードバックを送る"
    >
      {/* アイコン */}
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
        />
      </svg>

      {/* テキスト（ホバー時に表示） */}
      <span
        className={`
          overflow-hidden transition-all duration-300 ease-in-out font-medium text-sm whitespace-nowrap
          ${isHovered ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'}
        `}
      >
        フィードバック
      </span>

      {/* パルスアニメーション */}
      <span className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 animate-ping pointer-events-none"></span>
    </a>
  );
};
