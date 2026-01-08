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
  const options: Array<{ value: Recommendation | 'All'; label: string; color: string }> = [
    { value: 'All', label: 'すべて', color: 'bg-gray-200 hover:bg-gray-300 text-gray-800' },
    { value: 'Buy', label: '買い', color: 'bg-green-100 hover:bg-green-200 text-green-800' },
    { value: 'Sell', label: '売り', color: 'bg-red-100 hover:bg-red-200 text-red-800' },
    { value: 'Hold', label: 'ホールド', color: 'bg-gray-100 hover:bg-gray-200 text-gray-800' },
  ];

  return (
    <div className="flex items-center space-x-4 mb-6">
      <span className="text-sm font-medium text-gray-700">推奨フィルター:</span>
      <div className="flex space-x-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onRecommendationChange(option.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedRecommendation === option.value
                ? `${option.color} ring-2 ring-offset-2 ${
                    option.value === 'Buy'
                      ? 'ring-green-500'
                      : option.value === 'Sell'
                      ? 'ring-red-500'
                      : 'ring-gray-400'
                  }`
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
