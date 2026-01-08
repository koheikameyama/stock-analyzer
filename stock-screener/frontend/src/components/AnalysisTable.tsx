/**
 * AI分析結果テーブルコンポーネント
 * 分析結果を表形式で表示
 */

import React, { useState } from 'react';
import type { Analysis, Recommendation } from '../types/analysis';

interface AnalysisTableProps {
  analyses: Analysis[];
  onDetailClick: (analysisId: string) => void;
}

type SortField = 'ticker' | 'name' | 'currentPrice' | 'confidenceScore' | 'recommendation';
type SortOrder = 'asc' | 'desc';

/**
 * 推奨アクションの色分けを取得
 */
const getRecommendationColor = (recommendation: Recommendation): string => {
  switch (recommendation) {
    case 'Buy':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'Sell':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'Hold':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

/**
 * 推奨アクションの日本語表示
 */
const getRecommendationLabel = (recommendation: Recommendation): string => {
  switch (recommendation) {
    case 'Buy':
      return '買い';
    case 'Sell':
      return '売り';
    case 'Hold':
      return 'ホールド';
    default:
      return recommendation;
  }
};

/**
 * AI分析結果テーブルコンポーネント
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
        aValue = a.currentPrice || 0;
        bValue = b.currentPrice || 0;
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
        return 0;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  /**
   * ソートアイコン
   */
  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">⇅</span>;
    }
    return <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  if (analyses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>分析結果がありません</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 bg-white shadow-sm rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('ticker')}
            >
              <div className="flex items-center space-x-1">
                <span>ティッカー</span>
                <SortIcon field="ticker" />
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center space-x-1">
                <span>銘柄名</span>
                <SortIcon field="name" />
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('currentPrice')}
            >
              <div className="flex items-center space-x-1">
                <span>現在株価</span>
                <SortIcon field="currentPrice" />
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('recommendation')}
            >
              <div className="flex items-center space-x-1">
                <span>推奨</span>
                <SortIcon field="recommendation" />
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('confidenceScore')}
            >
              <div className="flex items-center space-x-1">
                <span>信頼度</span>
                <SortIcon field="confidenceScore" />
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              理由（短文）
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              詳細
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedAnalyses.map((analysis, index) => (
            <tr
              key={analysis.id}
              className={`hover:bg-gray-50 transition-colors ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {analysis.stock.ticker}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {analysis.stock.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {analysis.currentPrice
                  ? `${analysis.currentPrice.toLocaleString()}`
                  : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getRecommendationColor(
                    analysis.recommendation
                  )}`}
                >
                  {getRecommendationLabel(analysis.recommendation)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full mr-2 max-w-[100px]">
                    <div
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: `${analysis.confidenceScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-900">
                    {analysis.confidenceScore}%
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                {analysis.reasonShort}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={() => onDetailClick(analysis.id)}
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                >
                  詳細を見る
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
