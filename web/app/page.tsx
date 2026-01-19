/**
 * AI株式分析ツール メインページ
 */

'use client';

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { FilterBar } from '@/components/FilterBar';
import { AnalysisTable } from '@/components/AnalysisTable';
import { AnalysisDetailModal } from '@/components/AnalysisDetailModal';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AdBanner } from '@/components/AdBanner';
import { useLatestAnalyses, useBatchJobStatus } from '@/hooks/useAnalyses';
import type { Recommendation } from '@/types/analysis';

/**
 * ホームページ
 */
export default function Home() {
  // 状態管理
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
    selectedRecommendation === 'All' ? undefined : selectedRecommendation
  );

  const { data: batchJobStatus } = useBatchJobStatus();

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

  return (
    <Layout>
      <div className="space-y-8">
        {/* ヘッダーセクション */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-surface-900">
              💹 日本株のAI分析
            </h1>
            <p className="text-surface-500 mt-1">
              AIが分析した、おすすめの投資アイデアをチェックしましょう
            </p>
            <p className="text-xs text-surface-400 mt-2">
              日経225採用の時価総額上位・主要セクター代表15銘柄を分析
            </p>
            <p className="text-xs text-surface-400 mt-1">
              🕐 毎日18:00に自動更新
            </p>
          </div>

          {/* ステータス表示 */}
          <div className="flex items-center gap-4 text-sm">
            {analysesData?.lastUpdateDate && (
              <div className="flex items-center gap-2 text-surface-500 bg-white px-3 py-1.5 rounded-full border border-surface-200 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                最終更新: {new Date(analysesData.lastUpdateDate).toLocaleDateString('ja-JP', {
                  timeZone: 'Asia/Tokyo'
                })}
              </div>
            )}
            {batchJobStatus && (
              <div className="flex items-center gap-2 text-surface-500 bg-white px-3 py-1.5 rounded-full border border-surface-200 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                分析完了: {batchJobStatus.successCount}/{batchJobStatus.totalStocks}銘柄
              </div>
            )}
          </div>
        </div>

        {/* 広告エリア1: ヘッダー下 */}
        <AdBanner
          adSlot="7965940641"
          adFormat="auto"
          className="my-4"
        />

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end items-start sm:items-center bg-white p-4 rounded-xl border border-surface-200 shadow-sm">
          <FilterBar
            selectedRecommendation={selectedRecommendation}
            onRecommendationChange={handleRecommendationChange}
          />
        </div>

        {/* エラー表示 */}
        {analysesError && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium">データの取得に失敗しました</p>
              <p className="text-sm opacity-90">しばらくしてから再度お試しください</p>
            </div>
          </div>
        )}

        {/* ローディング表示 */}
        {isLoadingAnalyses && (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner message="AIが分析結果を取得しています..." />
          </div>
        )}

        {/* Content */}
        {!isLoadingAnalyses && !analysesError && (
          <>
            <AnalysisTable
              analyses={analyses}
              onDetailClick={handleDetailClick}
            />
            {analyses.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-surface-200 border-dashed">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-surface-600 font-medium mb-1">分析結果が見つかりませんでした</p>
                <p className="text-surface-400 text-sm">別の条件で検索してみてください</p>
              </div>
            )}

            {/* 広告エリア3: テーブル後 */}
            {analyses.length > 0 && (
              <AdBanner
                adSlot="5999264618"
                adFormat="auto"
                className="my-6"
              />
            )}
          </>
        )}

        {/* Modal */}
        <AnalysisDetailModal
          analysisId={selectedAnalysisId}
          onClose={handleModalClose}
        />
      </div>
    </Layout>
  );
}
