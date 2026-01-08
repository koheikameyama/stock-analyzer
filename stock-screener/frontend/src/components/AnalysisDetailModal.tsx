/**
 * 分析詳細モーダルコンポーネント
 * 詳細解説と株価チャートを表示
 */

import React, { useEffect } from 'react';
import type { AnalysisDetail, Recommendation } from '../types/analysis';
import { useAnalysisDetail } from '../hooks/useAnalyses';
import { LoadingSpinner } from './LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalysisDetailModalProps {
  analysisId: string | null;
  onClose: () => void;
}

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
 * 分析詳細モーダルコンポーネント
 */
export const AnalysisDetailModal: React.FC<AnalysisDetailModalProps> = ({
  analysisId,
  onClose,
}) => {
  const { data: analysis, isLoading, error } = useAnalysisDetail(analysisId, !!analysisId);

  // ESCキーで閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // モーダルが開いていない場合は何も表示しない
  if (!analysisId) {
    return null;
  }

  // 株価チャート用のデータ整形
  const chartData = analysis?.stock.priceHistory
    ? [...analysis.stock.priceHistory]
        .reverse() // 古い順に並べ替え
        .map((history) => ({
          date: new Date(history.date).toLocaleDateString('ja-JP', {
            month: 'numeric',
            day: 'numeric',
          }),
          終値: parseFloat(history.close.toString()),
        }))
    : [];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">分析詳細</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="px-6 py-4">
          {isLoading && <LoadingSpinner message="詳細情報を読み込んでいます..." />}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              データの取得に失敗しました。しばらくしてから再度お試しください。
            </div>
          )}

          {analysis && (
            <div className="space-y-6">
              {/* 銘柄情報 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">銘柄情報</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">ティッカー:</span>
                    <p className="text-base font-medium text-gray-900">
                      {analysis.stock.ticker}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">銘柄名:</span>
                    <p className="text-base font-medium text-gray-900">
                      {analysis.stock.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">市場:</span>
                    <p className="text-base font-medium text-gray-900">
                      {analysis.stock.market === 'JP' ? '日本株' : '米国株'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">セクター:</span>
                    <p className="text-base font-medium text-gray-900">
                      {analysis.stock.sector || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* AI推奨 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">AI推奨</h3>
                <div className="flex items-center space-x-4">
                  <span
                    className={`inline-flex px-4 py-2 text-base font-semibold rounded-full border ${getRecommendationColor(
                      analysis.recommendation
                    )}`}
                  >
                    {getRecommendationLabel(analysis.recommendation)}
                  </span>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">信頼度:</span>
                    <div className="flex items-center">
                      <div className="w-32 h-3 bg-gray-200 rounded-full mr-2">
                        <div
                          className="h-3 bg-blue-600 rounded-full"
                          style={{ width: `${analysis.confidenceScore}%` }}
                        ></div>
                      </div>
                      <span className="text-base font-medium text-gray-900">
                        {analysis.confidenceScore}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 財務指標 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">財務指標</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-xs text-gray-600">現在株価</span>
                    <p className="text-lg font-semibold text-gray-900">
                      {analysis.currentPrice?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-xs text-gray-600">PER</span>
                    <p className="text-lg font-semibold text-gray-900">
                      {analysis.peRatio || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-xs text-gray-600">PBR</span>
                    <p className="text-lg font-semibold text-gray-900">
                      {analysis.pbRatio || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-xs text-gray-600">ROE</span>
                    <p className="text-lg font-semibold text-gray-900">
                      {analysis.roe ? `${analysis.roe}%` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 詳細解説 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">詳細解説</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {analysis.reasonDetailed}
                  </p>
                </div>
              </div>

              {/* 株価チャート */}
              {chartData.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    過去30日の株価推移
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="終値"
                          stroke="#2563eb"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
