/**
 * フィルターバーコンポーネント
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
  }> = [
      { value: 'All', label: 'All' },
      { value: 'Buy', label: 'Buy' },
      { value: 'Sell', label: 'Sell' },
      { value: 'Hold', label: 'Hold' },
    ];

  return (
    <div className="flex bg-surface-100 p-1 rounded-lg border border-surface-200">
      {options.map((option) => {
        const isActive = selectedRecommendation === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onRecommendationChange(option.value)}
            className={`
              px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
              ${isActive
                ? 'bg-white text-surface-900 shadow-sm'
                : 'text-surface-500 hover:text-surface-700 hover:bg-surface-200/50'
              }
            `}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
