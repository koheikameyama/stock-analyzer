/**
 * 銘柄一覧テーブルコンポーネント
 */

'use client';

import { useState } from 'react';

interface Stock {
  id: string;
  ticker: string;
  name: string;
  sector: string | null;
  industry: string | null;
  isAiAnalysisTarget: boolean;
  marketCap: number | null;
  latestAnalysis: {
    id: string;
    recommendation: 'Buy' | 'Sell' | 'Hold';
    confidenceScore: number;
    analysisDate: string;
  } | null;
}

interface StockListTableProps {
  stocks: Stock[];
  onStockClick?: (stock: Stock) => void;
}

/**
 * 銘柄一覧テーブル
 */
export function StockListTable({ stocks, onStockClick }: StockListTableProps) {
  const [sortBy, setSortBy] = useState<
    'ticker' | 'name' | 'sector' | 'confidence'
  >('ticker');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // ソート処理
  const sortedStocks = [...stocks].sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case 'ticker':
        compareValue = a.ticker.localeCompare(b.ticker);
        break;
      case 'name':
        compareValue = a.name.localeCompare(b.name);
        break;
      case 'sector':
        compareValue = (a.sector || '').localeCompare(b.sector || '');
        break;
      case 'confidence':
        compareValue =
          (b.latestAnalysis?.confidenceScore || 0) -
          (a.latestAnalysis?.confidenceScore || 0);
        break;
    }

    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  // ソートハンドラー
  const handleSort = (
    column: 'ticker' | 'name' | 'sector' | 'confidence'
  ) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // 推奨バッジのスタイル
  const getRecommendationBadge = (
    recommendation: 'Buy' | 'Sell' | 'Hold'
  ) => {
    switch (recommendation) {
      case 'Buy':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
            買い
          </span>
        );
      case 'Sell':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            売り
          </span>
        );
      case 'Hold':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
            様子見
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-surface-200">
          <thead className="bg-surface-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider cursor-pointer hover:bg-surface-100"
                onClick={() => handleSort('ticker')}
              >
                <div className="flex items-center gap-1">
                  コード
                  {sortBy === 'ticker' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider cursor-pointer hover:bg-surface-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  銘柄名
                  {sortBy === 'name' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider cursor-pointer hover:bg-surface-100"
                onClick={() => handleSort('sector')}
              >
                <div className="flex items-center gap-1">
                  業種
                  {sortBy === 'sector' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                AI分析
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider cursor-pointer hover:bg-surface-100"
                onClick={() => handleSort('confidence')}
              >
                <div className="flex items-center gap-1">
                  最新推奨
                  {sortBy === 'confidence' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-surface-200">
            {sortedStocks.map((stock) => (
              <tr
                key={stock.id}
                className="hover:bg-surface-50 transition-colors cursor-pointer"
                onClick={() => onStockClick?.(stock)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-surface-900">
                  {stock.ticker}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-surface-900">
                      {stock.name}
                    </span>
                    {stock.isAiAnalysisTarget && (
                      <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                        AI対象
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-500">
                  {stock.sector || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-500">
                  {stock.isAiAnalysisTarget ? (
                    <span className="text-emerald-600">✓ 対象</span>
                  ) : (
                    <span className="text-surface-400">対象外</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {stock.latestAnalysis ? (
                    <div className="flex items-center gap-2">
                      {getRecommendationBadge(
                        stock.latestAnalysis.recommendation
                      )}
                      <span className="text-sm text-surface-500">
                        信頼度 {stock.latestAnalysis.confidenceScore}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-surface-400">
                      分析結果なし
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
