/**
 * 分析カードコンポーネント
 */

import React from 'react';
import type { Analysis } from '../types/analysis';

interface AnalysisCardProps {
  analysis: Analysis;
  onDetailClick: (analysisId: string) => void;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
  analysis,
  onDetailClick,
}) => {
  const { stock, recommendation, confidenceScore, currentPrice, summary } = analysis;

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'Buy':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Sell':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'Hold':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-surface-700 bg-surface-50 border-surface-200';
    }
  };

  const scoreColor =
    confidenceScore >= 80 ? 'text-emerald-600' :
      confidenceScore >= 50 ? 'text-amber-600' :
        'text-red-600';

  return (
    <div
      onClick={() => onDetailClick(analysis.id)}
      className="group bg-white rounded-xl border border-surface-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-medium text-surface-500 bg-surface-100 px-2 py-0.5 rounded">
              {stock.ticker}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getRecommendationColor(recommendation)}`}>
              {recommendation.toUpperCase()}
            </span>
          </div>
          <h3 className="font-bold text-lg text-surface-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {stock.name}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-surface-900 tracking-tight">
            ¥{Number(currentPrice).toLocaleString()}
          </p>
        </div>
      </div>

      <p className="text-surface-600 text-sm line-clamp-3 mb-4 flex-grow">
        {summary}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-surface-100 mt-auto">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-surface-400">Confidence</span>
          <span className={`font-bold ${scoreColor}`}>
            {confidenceScore}%
          </span>
        </div>
        <span className="text-primary-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          View Analysis
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
};
