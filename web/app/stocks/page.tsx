/**
 * 銘柄一覧ページ
 */

'use client';

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { StockListTable } from '@/components/StockListTable';
import { StockCard } from '@/components/StockCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AnalysisDetailModal } from '@/components/AnalysisDetailModal';
import { useStocks } from '@/hooks/useStocks';

type ViewMode = 'card' | 'table';

export default function StocksPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('');
  const [hasAnalysis, setHasAnalysis] = useState<boolean | undefined>(
    undefined
  );
  const [isAiTarget, setIsAiTarget] = useState(false); // デフォルトで全銘柄を表示
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(
    null
  );
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  // データ取得
  const { data, isLoading, error } = useStocks({
    page,
    limit: 50,
    search,
    sector,
    hasAnalysis,
    isAiTarget: isAiTarget ? true : undefined,
  });

  const stocks = data?.stocks || [];
  const pagination = data?.pagination;

  // ページ切り替え
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 検索
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1); // 検索時は1ページ目に戻る
  };

  // 詳細モーダルを開く
  const handleStockClick = (stock: any) => {
    if (stock.latestAnalysis) {
      // 分析結果がある場合は分析詳細モーダルを開く
      setSelectedAnalysisId(stock.latestAnalysis.id);
    } else {
      // 分析結果がない場合は株価データモーダルを開く
      setSelectedTicker(stock.ticker);
    }
  };

  // 詳細モーダルを閉じる
  const handleModalClose = () => {
    setSelectedAnalysisId(null);
    setSelectedTicker(null);
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* ヘッダー */}
        <div>
          <h1 className="text-3xl font-bold text-surface-900">
            📊 銘柄一覧
          </h1>
          <p className="text-surface-500 mt-1">
            プライム市場の全銘柄を表示しています
          </p>
        </div>

        {/* フィルター */}
        <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* 検索ボックス */}
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-surface-700 mb-2"
              >
                銘柄名・コードで検索
              </label>
              <div className="flex gap-2">
                <input
                  id="search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="例: トヨタ、7203"
                  className="flex-1 px-4 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  検索
                </button>
              </div>
            </div>

            {/* フィルター */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AI分析フィルター */}
                <div>
                  <label
                    htmlFor="hasAnalysis"
                    className="block text-sm font-medium text-surface-700 mb-2"
                  >
                    分析結果
                  </label>
                  <select
                    id="hasAnalysis"
                    value={
                      hasAnalysis === undefined
                        ? 'all'
                        : hasAnalysis
                        ? 'true'
                        : 'false'
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      setHasAnalysis(
                        value === 'all'
                          ? undefined
                          : value === 'true'
                          ? true
                          : false
                      );
                      setPage(1);
                    }}
                    className="w-full px-4 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">すべて</option>
                    <option value="true">分析結果あり</option>
                    <option value="false">分析結果なし</option>
                  </select>
                </div>

                {/* セクターフィルター */}
                <div>
                  <label
                    htmlFor="sector"
                    className="block text-sm font-medium text-surface-700 mb-2"
                  >
                    業種
                  </label>
                  <input
                    id="sector"
                    type="text"
                    value={sector}
                    onChange={(e) => {
                      setSector(e.target.value);
                      setPage(1);
                    }}
                    placeholder="例: 水産・農林業"
                    className="w-full px-4 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* AI分析対象のみチェックボックス */}
              <div className="flex items-center gap-2">
                <input
                  id="isAiTarget"
                  type="checkbox"
                  checked={isAiTarget}
                  onChange={(e) => {
                    setIsAiTarget(e.target.checked);
                    setPage(1);
                  }}
                  className="w-4 h-4 text-primary-600 border-surface-300 rounded focus:ring-2 focus:ring-primary-500"
                />
                <label
                  htmlFor="isAiTarget"
                  className="text-sm font-medium text-surface-700 cursor-pointer"
                >
                  🤖 AI分析対象の銘柄のみ表示 <span className="text-surface-500">(15銘柄)</span>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            データの取得に失敗しました
          </div>
        )}

        {/* ローディング表示 */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner message="銘柄データを読み込み中..." />
          </div>
        )}

        {/* 銘柄一覧 */}
        {!isLoading && !error && (
          <>
            {/* 件数表示と表示切り替え */}
            {pagination && (
              <div className="flex items-center justify-between text-sm text-surface-600">
                <p>
                  全 {pagination.totalCount} 件中 {(page - 1) * 50 + 1}〜
                  {Math.min(page * 50, pagination.totalCount)} 件を表示
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-surface-500">表示:</span>
                  <div className="flex bg-white rounded-lg border border-surface-200 shadow-sm">
                    <button
                      onClick={() => setViewMode('card')}
                      className={`px-3 py-1.5 rounded-l-lg transition-colors ${
                        viewMode === 'card'
                          ? 'bg-primary-600 text-white'
                          : 'text-surface-700 hover:bg-surface-50'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-1.5 rounded-r-lg transition-colors ${
                        viewMode === 'table'
                          ? 'bg-primary-600 text-white'
                          : 'text-surface-700 hover:bg-surface-50'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* カード表示 */}
            {viewMode === 'card' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stocks.map((stock) => (
                  <StockCard
                    key={stock.id}
                    stock={stock}
                    onClick={() => handleStockClick(stock)}
                  />
                ))}
              </div>
            )}

            {/* テーブル表示 */}
            {viewMode === 'table' && (
              <StockListTable
                stocks={stocks}
                onStockClick={handleStockClick}
              />
            )}

            {/* ページネーション */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 border border-surface-300 rounded-lg hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← 前へ
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === pagination.totalPages ||
                        (p >= page - 2 && p <= page + 2)
                    )
                    .map((p, i, arr) => {
                      // ページ番号の間に省略記号を追加
                      const showEllipsis = i > 0 && p - arr[i - 1] > 1;
                      return (
                        <div key={p} className="flex items-center gap-1">
                          {showEllipsis && (
                            <span className="px-2 text-surface-400">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(p)}
                            className={`px-3 py-2 rounded-lg transition-colors ${
                              p === page
                                ? 'bg-primary-600 text-white'
                                : 'border border-surface-300 hover:bg-surface-50'
                            }`}
                          >
                            {p}
                          </button>
                        </div>
                      );
                    })}
                </div>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 border border-surface-300 rounded-lg hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  次へ →
                </button>
              </div>
            )}
          </>
        )}

        {/* 詳細モーダル（AI分析あり・なし両対応） */}
        <AnalysisDetailModal
          analysisId={selectedAnalysisId}
          ticker={selectedTicker}
          onClose={handleModalClose}
        />
      </div>
    </Layout>
  );
}
