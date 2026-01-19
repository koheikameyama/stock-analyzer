/**
 * 銘柄一覧ページ
 */

'use client';

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { StockListTable } from '@/components/StockListTable';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AnalysisDetailModal } from '@/components/AnalysisDetailModal';
import { AdBanner } from '@/components/AdBanner';
import { Toast, useToast } from '@/components/Toast';
import { useStocks, useSectors } from '@/hooks/useStocks';
import { addRequestedStock, isStockRequested } from '@/lib/cookies';

export default function StocksPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('');
  const [hasAnalysis, setHasAnalysis] = useState(false); // デフォルトは全銘柄表示
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(
    null
  );
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Toast管理
  const { toasts, showToast, removeToast } = useToast();

  // データ取得
  const { data, isLoading, error } = useStocks({
    page,
    limit: 50,
    search,
    sector,
    hasAnalysis: hasAnalysis ? false : undefined, // trueの場合は分析なし（false）を渡す
  });

  // 業種リスト取得
  const { sectors } = useSectors();

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
      setSelectedAnalysisId(stock.latestAnalysis.id);
    } else {
      setSelectedTicker(stock.ticker);
    }
  };

  // 詳細モーダルを閉じる
  const handleModalClose = () => {
    setSelectedAnalysisId(null);
    setSelectedTicker(null);
  };

  // 分析リクエスト処理
  const handleRequestAnalysis = async (stock: any) => {
    // 既にリクエスト済みかチェック
    if (isStockRequested(stock.ticker)) {
      showToast('この銘柄は既にリクエスト済みです', 'info');
      return;
    }

    setIsRequesting(true);

    try {
      const response = await fetch('/api/analysis-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stockId: stock.id,
        }),
      });

      if (!response.ok) {
        throw new Error('リクエストに失敗しました');
      }

      const result = await response.json();

      // Cookieに保存
      addRequestedStock(stock.ticker);

      // テーブルの状態を更新
      setRefreshKey(prev => prev + 1);

      // 成功通知
      showToast(
        `${stock.name}(${stock.ticker})の分析をリクエストしました！`,
        'success'
      );
    } catch (error) {
      console.error('分析リクエストエラー:', error);
      showToast('リクエストに失敗しました。もう一度お試しください。', 'error');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* ヘッダー */}
        <div>
          <h1 className="text-3xl font-bold text-surface-900">
            🔍 銘柄を探す
          </h1>
          <p className="text-surface-500 mt-1">
            気になる銘柄を検索して、AI分析をリクエストできます
          </p>
        </div>

        {/* 広告エリア1: ヘッダー下 */}
        <AdBanner
          adSlot="7965940641"
          adFormat="auto"
          className="my-4"
        />

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
              {/* セクターフィルター */}
              <div>
                <label
                  htmlFor="sector"
                  className="block text-sm font-medium text-surface-700 mb-2"
                >
                  業種
                </label>
                <select
                  id="sector"
                  value={sector}
                  onChange={(e) => {
                    setSector(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">すべて</option>
                  {sectors.sectors?.map((s: string) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* AI分析なしチェックボックス */}
              <div className="flex items-center gap-2">
                <input
                  id="hasAnalysis"
                  type="checkbox"
                  checked={hasAnalysis}
                  onChange={(e) => {
                    setHasAnalysis(e.target.checked);
                    setPage(1);
                  }}
                  className="w-4 h-4 text-primary-600 border-surface-300 rounded focus:ring-2 focus:ring-primary-500"
                />
                <label
                  htmlFor="hasAnalysis"
                  className="text-sm font-medium text-surface-700 cursor-pointer"
                >
                  📊 AI分析なしのみ表示
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
            {/* 件数表示 */}
            {pagination && (
              <div className="flex items-center justify-between text-sm text-surface-600">
                <p>
                  全 {pagination.totalCount} 件中 {(page - 1) * 50 + 1}〜
                  {Math.min(page * 50, pagination.totalCount)} 件を表示
                </p>
              </div>
            )}

            {/* テーブル表示 */}
            <StockListTable
              key={refreshKey}
              stocks={stocks}
              onStockClick={handleStockClick}
              onRequestAnalysis={handleRequestAnalysis}
            />

            {/* 広告エリア2: テーブル後 */}
            {stocks.length > 0 && (
              <AdBanner
                adSlot="5999264618"
                adFormat="auto"
                className="my-6"
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

        {/* Toast通知 */}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </Layout>
  );
}
