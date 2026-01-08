/**
 * フィルターバーコンポーネント（初心者向けデザイン）
 * 推奨アクションでフィルタリング
 */

import React from 'react';
import type { Recommendation } from '../types/analysis';

interface FilterBarProps {
  selectedRecommendation: Recommendation | 'All';
  onRecommendationChange: (recommendation: Recommendation | 'All') => void;
}

/**
 * フィルターバーコンポーネント
 */
export const FilterBar: React.FC<FilterBarProps> = ({
  selectedRecommendation,
  onRecommendationChange,
}) => {
  const options: Array<{
    value: Recommendation | 'All';
    label: string;
    emoji: string;
  }> = [
      { value: 'All', label: 'すべて', emoji: '📊' },
      { value: 'Buy', label: '買い', emoji: '📈' },
      { value: 'Sell', label: '売り', emoji: '📉' },
      { value: 'Hold', label: '様子見', emoji: '⏸️' },
    ];

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-surface-600">絞り込み:</span>
      <div className="flex bg-gradient-to-br from-surface-50 to-surface-100 p-1 rounded-xl border-2 border-surface-200 shadow-sm">
        {options.map((option) => {
          const isActive = selectedRecommendation === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onRecommendationChange(option.value)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-br from-white to-surface-50 text-surface-900 shadow-md border border-surface-200'
                  : 'text-surface-500 hover:text-surface-900 hover:bg-white/50'
                }
              `}
            >
              <span className={isActive ? 'text-base' : 'text-sm opacity-70'}>
                {option.emoji}
              </span>
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
