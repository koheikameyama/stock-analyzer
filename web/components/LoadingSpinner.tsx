/**
 * ローディングスピナーコンポーネント
 * データ読み込み中に表示
 */

import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

/**
 * ローディングスピナーコンポーネント
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      {message && (
        <p className="mt-4 text-gray-600 text-sm">{message}</p>
      )}
    </div>
  );
};
