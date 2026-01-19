/**
 * 銘柄一覧テーブルコンポーネント
 */

'use client';

import { useState, useEffect } from 'react';
import { isStockRequested } from '@/lib/cookies';

interface Stock {
  id: string;
  ticker: string;
  name: string;
  sector: string | null;
  industry: string | null;
  isAiAnalysisTarget: boolean;
  marketCap: number | null;
  requestCount?: number;
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
  onRequestAnalysis?: (stock: Stock) => void;
}

/**
 * 銘柄一覧テーブル
 */
export function StockListTable({ stocks, onStockClick, onRequestAnalysis }: StockListTableProps) {
  const [sortBy, setSortBy] = useState<
    'ticker' | 'name' | 'sector' | 'confidence' | 'requestCount'
  >('ticker');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [requestedStocks, setRequestedStocks] = useState<Set<string>>(new Set());

  // クライアントサイドでCookieから読み込み
  useEffect(() => {
    const requested = new Set<string>();
    stocks.forEach(stock => {
      if (isStockRequested(stock.ticker)) {
        requested.add(stock.ticker);
      }
    });
    setRequestedStocks(requested);
  }, [stocks]);

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
      case 'requestCount':
        compareValue = (b.requestCount || 0) - (a.requestCount || 0);
        break;
    }

    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  // ソートハンドラー
  const handleSort = (
    column: 'ticker' | 'name' | 'sector' | 'confidence' | 'requestCount'
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
      <div className="overflow-x-auto sm:overflow-visible">
        <table className="w-full divide-y divide-surface-200">
          <thead className="bg-surface-50">
            <tr>
              <th
                className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider cursor-pointer hover:bg-surface-100 w-20 sm:w-auto"
                onClick={() => handleSort('ticker')}
              >
                <div className="flex items-center gap-1">
                  コード
                  {sortBy === 'ticker' ? (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  ) : (
                    <span className="text-surface-300">↕</span>
                  )}
                </div>
              </th>
              <th
                className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider cursor-pointer hover:bg-surface-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  銘柄名
                  {sortBy === 'name' ? (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  ) : (
                    <span className="text-surface-300">↕</span>
                  )}
                </div>
              </th>
              <th
                className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider cursor-pointer hover:bg-surface-100 w-32"
                onClick={() => handleSort('sector')}
              >
                <div className="flex items-center gap-1">
                  業種
                  {sortBy === 'sector' ? (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  ) : (
                    <span className="text-surface-300">↕</span>
                  )}
                </div>
              </th>
              <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                AI分析
              </th>
              <th
                className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider cursor-pointer hover:bg-surface-100"
                onClick={() => handleSort('confidence')}
              >
                <div className="flex items-center gap-1">
                  最新推奨
                  {sortBy === 'confidence' ? (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  ) : (
                    <span className="text-surface-300">↕</span>
                  )}
                </div>
              </th>
              <th
                className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider w-24 sm:w-auto cursor-pointer hover:bg-surface-100"
                onClick={() => handleSort('requestCount')}
              >
                <div className="flex items-center gap-1">
                  リクエスト
                  {sortBy === 'requestCount' ? (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  ) : (
                    <span className="text-surface-300">↕</span>
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
                <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-surface-900 w-20 sm:w-auto">
                  {stock.ticker}
                </td>
                <td className="px-2 sm:px-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-xs sm:text-sm font-medium text-surface-900">
                      {stock.name}
                    </span>
                    {stock.isAiAnalysisTarget && (
                      <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800 w-fit">
                        AI対象
                      </span>
                    )}
                  </div>
                </td>
                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-surface-500 w-32">
                  {stock.sector || '-'}
                </td>
                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-surface-500">
                  {stock.isAiAnalysisTarget ? (
                    <span className="text-emerald-600">✓ 対象</span>
                  ) : (
                    <span className="text-surface-400">対象外</span>
                  )}
                </td>
                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
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
                <td className="px-2 sm:px-6 py-4 w-24 sm:w-auto">
                  <div className="flex flex-col items-center gap-1">
                    {/* リクエストボタン（AI分析なしの場合のみ） */}
                    {!stock.latestAnalysis && (
                      <>
                        {requestedStocks.has(stock.ticker) ? (
                          <button
                            disabled
                            onClick={(e) => e.stopPropagation()}
                            className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-surface-400 bg-surface-200 rounded transition-colors cursor-not-allowed"
                          >
                            <span className="sm:hidden">済</span>
                            <span className="hidden sm:inline">リクエスト済</span>
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRequestAnalysis?.(stock);
                            }}
                            className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded transition-colors"
                          >
                            リクエスト
                          </button>
                        )}

                        {/* リクエスト数表示 */}
                        <span className="text-xs text-surface-500 min-w-[3rem] text-center">
                          {stock.requestCount || 0}人
                        </span>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
