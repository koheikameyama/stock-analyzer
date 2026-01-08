/**
 * AI分析結果グリッドコンポーネント
 * 分析結果をカード形式で表示
 */

import React, { useState } from 'react';
import type { Analysis } from '../types/analysis';
import { AnalysisCard } from './AnalysisCard';

interface AnalysisTableProps {
  analyses: Analysis[];
  onDetailClick: (analysisId: string) => void;
}

type SortField = 'ticker' | 'name' | 'currentPrice' | 'confidenceScore' | 'recommendation';
type SortOrder = 'asc' | 'desc';

/**
 * AI分析結果グリッドコンポーネント
 */
export const AnalysisTable: React.FC<AnalysisTableProps> = ({
  analyses,
  onDetailClick,
}) => {
  const [sortField, setSortField] = useState<SortField>('confidenceScore');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  /**
   * ソート処理
   */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  /**
   * ソート済みデータ
   */
  const sortedAnalyses = [...analyses].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case 'ticker':
        aValue = a.stock.ticker;
        bValue = b.stock.ticker;
        break;
      case 'name':
        aValue = a.stock.name;
        bValue = b.stock.name;
        break;
      case 'currentPrice':
        aValue = Number(a.currentPrice) || 0;
        bValue = Number(b.currentPrice) || 0;
        break;
      case 'confidenceScore':
        aValue = a.confidenceScore;
        bValue = b.confidenceScore;
        break;
      case 'recommendation':
        aValue = a.recommendation;
        bValue = b.recommendation;
        break;
      default:
        aValue = a.confidenceScore;
        bValue = b.confidenceScore;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const sortOptions: { label: string; value: SortField }[] = [
    { label: 'Score', value: 'confidenceScore' },
    { label: 'Price', value: 'currentPrice' },
    { label: 'Ticker', value: 'ticker' },
  ];

  return (
    <div className="space-y-6">
      {/* Sort Bar */}
      <div className="flex items-center justify-end gap-3 text-sm">
        <span className="text-surface-500 font-medium">Sort by:</span>
        <div className="flex bg-white rounded-lg border border-surface-200 p-1">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSort(option.value)}
              className={`
                px-3 py-1 rounded-[4px] font-medium transition-colors
                ${sortField === option.value
                  ? 'bg-surface-100 text-surface-900'
                  : 'text-surface-500 hover:text-surface-700'
                }
              `}
            >
              {option.label}
              {sortField === option.value && (
                <span className="ml-1 text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedAnalyses.map((analysis, index) => (
          <div
            key={analysis.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <AnalysisCard analysis={analysis} onDetailClick={onDetailClick} />
          </div>
        ))}
      </div>
    </div>
  );
};
