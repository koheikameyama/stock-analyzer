/**
 * AI株式分析ツール メインコンポーネント
 */

import React, { useState } from 'react';
import { TabSwitch } from './components/TabSwitch';
import { FilterBar } from './components/FilterBar';
import { AnalysisTable } from './components/AnalysisTable';
import { AnalysisDetailModal } from './components/AnalysisDetailModal';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useLatestAnalyses, useBatchJobStatus } from './hooks/useAnalyses';
import type { Market, Recommendation } from './types/analysis';

/**
 * AI株式分析ツール メインコンポーネント
 */
function AIAnalyzer() {
  // 状態管理
  const [market, setMarket] = useState<Market>('JP');
  const [selectedRecommendation, setSelectedRecommendation] = useState<
    Recommendation | 'All'
  >('All');
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(
    null
  );

  // データフェッチング
  const {
    data: analysesData,
    isLoading: isLoadingAnalyses,
    error: analysesError,
  } = useLatestAnalyses(
    market,
    selectedRecommendation === 'All' ? undefined : selectedRecommendation
  );

  const { data: batchJobStatus } = useBatchJobStatus();

  /**
   * 市場切り替え
   */
  const handleMarketChange = (newMarket: Market) => {
    setMarket(newMarket);
  };

  /**
   * 推奨フィルター切り替え
   */
  const handleRecommendationChange = (
    recommendation: Recommendation | 'All'
  ) => {
    setSelectedRecommendation(recommendation);
  };

  /**
   * 詳細モーダルを開く
   */
  const handleDetailClick = (analysisId: string) => {
    setSelectedAnalysisId(analysisId);
  };

  /**
   * 詳細モーダルを閉じる
   */
  const handleModalClose = () => {
    setSelectedAnalysisId(null);
  };

  // 分析結果のフィルタリング
  const analyses = analysesData?.analyses || [];

  // バッチジョブステータスの表示色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'partial_success':
        return 'text-yellow-600';
      case 'failure':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success':
        return '成功';
      case 'partial_success':
        return '部分的に成功';
      case 'failure':
        return '失敗';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">AI株式分析ツール</h1>
          <p className="text-blue-200 mt-2">
            AIが分析した買い・売り推奨を確認しましょう
          </p>

          {/* 最終更新日時とバッチジョブステータス */}
          <div className="mt-4 flex flex-wrap items-center space-x-6 text-sm">
            {analysesData?.lastUpdateDate && (
              <div>
                <span className="text-blue-200">最終更新: </span>
                <span className="font-medium">
                  {new Date(analysesData.lastUpdateDate).toLocaleString(
                    'ja-JP'
                  )}
                </span>
              </div>
            )}
            {batchJobStatus && (
              <div>
                <span className="text-blue-200">バッチジョブ: </span>
                <span
                  className={`font-medium ${getStatusColor(
                    batchJobStatus.status
                  )}`}
                >
                  {getStatusLabel(batchJobStatus.status)}
                </span>
                <span className="text-blue-200 ml-2">
                  ({batchJobStatus.successCount}/{batchJobStatus.totalStocks}{' '}
                  成功)
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        {/* 市場選択タブ */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <TabSwitch activeTab={market} onTabChange={handleMarketChange} />
        </div>

        {/* フィルターバー */}
        <FilterBar
          selectedRecommendation={selectedRecommendation}
          onRecommendationChange={handleRecommendationChange}
        />

        {/* エラー表示 */}
        {analysesError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">
                  データ取得に失敗しました。しばらくしてから再度お試しください。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ローディング状態 */}
        {isLoadingAnalyses && (
          <LoadingSpinner message="分析結果を読み込んでいます..." />
        )}

        {/* 分析結果テーブル */}
        {!isLoadingAnalyses && !analysesError && (
          <div className="bg-white rounded-lg shadow-sm">
            <AnalysisTable
              analyses={analyses}
              onDetailClick={handleDetailClick}
            />
          </div>
        )}

        {/* 結果件数 */}
        {!isLoadingAnalyses && !analysesError && analyses.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            {analyses.length} 件の分析結果を表示中
          </div>
        )}
      </main>

      {/* 詳細モーダル */}
      <AnalysisDetailModal
        analysisId={selectedAnalysisId}
        onClose={handleModalClose}
      />

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-600">
            ⚠️ 本ツールは投資助言ではありません。投資判断は自己責任で行ってください。
          </p>
        </div>
      </footer>
    </div>
  );
}

export default AIAnalyzer;
