/**
 * 分析詳細モーダルコンポーネント
 * 詳細解説と株価チャートを表示
 */

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { AnalysisDetail, Recommendation } from '../types/analysis';
import { useAnalysisDetail } from '../hooks/useAnalyses';
import { LoadingSpinner } from './LoadingSpinner';
import { Tooltip as InfoTooltip } from './Tooltip';
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
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Sell':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'Hold':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    default:
      return 'bg-surface-50 text-surface-700 border-surface-200';
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

  // ESCキーで閉じる & 背景スクロール防止
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // モーダル表示時は背景のスクロールを無効化
    if (analysisId) {
      document.body.style.overflow = 'hidden';
    }

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, analysisId]);

  if (!analysisId) return null;

  // 株価チャート用のデータ整形
  const chartData = analysis?.stock.priceHistory
    ? [...analysis.stock.priceHistory]
      .reverse()
      .map((history) => ({
        date: new Date(history.date).toLocaleDateString('ja-JP', {
          month: 'numeric',
          day: 'numeric',
        }),
        終値: parseFloat(history.close.toString()),
      }))
    : [];

  const modalContent = (
    <div
      className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white border-b border-surface-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold text-surface-900 font-display">分析詳細</h2>
          <button
            onClick={onClose}
            className="text-surface-400 hover:text-surface-600 transition-colors p-1 rounded-full hover:bg-surface-100"
            aria-label="閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoading && (
            <div className="flex justify-center py-12">
              <LoadingSpinner message="分析詳細を読み込み中..." />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>データの読み込みに失敗しました。もう一度お試しください。</span>
            </div>
          )}

          {analysis && (
            <div className="space-y-8">
              {/* Top Summary Section */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Stock Info */}
                <div className="bg-surface-50 rounded-xl p-5 border border-surface-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sm font-medium text-surface-500 mb-1">
                        {analysis.stock.market === 'JP' ? '日本市場' : '米国市場'} • {analysis.stock.sector || '不明'}
                      </div>
                      <h3 className="text-2xl font-bold text-surface-900 tracking-tight">{analysis.stock.name}</h3>
                      <div className="font-mono text-surface-500">{analysis.stock.ticker}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getRecommendationColor(analysis.recommendation)}`}>
                      {analysis.recommendation === 'Buy' ? '買い' : analysis.recommendation === 'Sell' ? '売り' : '様子見'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <div className="text-xs text-surface-500 uppercase tracking-wider font-semibold">現在価格</div>
                      <div className="text-xl font-bold text-surface-900">¥{analysis.currentPrice?.toLocaleString() || '不明'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-surface-500 uppercase tracking-wider font-semibold flex items-center">
                        信頼度
                        <InfoTooltip content="AIがこの投資推奨判断にどれだけ自信を持っているかを示すスコアです。財務データの質や市場状況の分析結果を反映しています。80%以上は高い確信度を示します。" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-surface-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${analysis.confidenceScore >= 80 ? 'bg-emerald-500' : analysis.confidenceScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${analysis.confidenceScore}%` }}
                          />
                        </div>
                        <span className="font-bold text-surface-900">{analysis.confidenceScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="bg-surface-50 rounded-xl p-5 border border-surface-100">
                  <h4 className="text-sm font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    財務指標
                  </h4>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    <div className="p-2">
                      <div className="text-xs text-surface-500 flex items-center">
                        PER (Price/Earnings)
                        <InfoTooltip content="株価収益率。株価が1株あたり利益の何倍かを示す指標です。一般的に15倍前後が適正とされ、低いほど割安と判断されます。" />
                      </div>
                      <div className="text-lg font-semibold text-surface-900">
                        {analysis.peRatio ? Number(analysis.peRatio).toFixed(2) : 'N/A'}
                      </div>
                      {analysis.peRatio && (
                        <div className="text-[10px] text-surface-400 mt-0.5">
                          実際の値: {analysis.peRatio}
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <div className="text-xs text-surface-500 flex items-center">
                        PBR (Price/Book)
                        <InfoTooltip content="株価純資産倍率。株価が1株あたり純資産の何倍かを示す指標です。1倍を下回ると割安、1.5倍以上だと割高とされることが多いです。" />
                      </div>
                      <div className="text-lg font-semibold text-surface-900">
                        {analysis.pbRatio ? Number(analysis.pbRatio).toFixed(2) : 'N/A'}
                      </div>
                      {analysis.pbRatio && (
                        <div className="text-[10px] text-surface-400 mt-0.5">
                          実際の値: {analysis.pbRatio}
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <div className="text-xs text-surface-500 flex items-center">
                        ROE (Return on Equity)
                        <InfoTooltip content="自己資本利益率。企業が株主の資本をどれだけ効率的に使って利益を上げているかを示す指標です。10%以上が優良企業の目安とされます。" />
                      </div>
                      <div className="text-lg font-semibold text-surface-900">
                        {analysis.roe ? `${Number(analysis.roe).toFixed(2)}%` : 'N/A'}
                      </div>
                      {analysis.roe && (
                        <div className="text-[10px] text-surface-400 mt-0.5">
                          実際の値: {analysis.roe}%
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <div className="text-xs text-surface-500 flex items-center">
                        配当利回り
                        <InfoTooltip content="年間配当金が株価の何%かを示す指標です。高いほど株主への還元が手厚いと言えます。日本株では2-3%が平均的です。" />
                      </div>
                      <div className="text-lg font-semibold text-surface-900">
                        {analysis.dividendYield ? `${(Number(analysis.dividendYield) / 100).toFixed(2)}%` : 'N/A'}
                      </div>
                      {analysis.dividendYield && (
                        <div className="text-[10px] text-surface-400 mt-0.5">
                          実際の値: {(Number(analysis.dividendYield) / 100)}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Text */}
              <div>
                <h4 className="text-lg font-bold text-surface-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI分析
                </h4>
                <div className="bg-white rounded-xl p-5 border border-surface-200 shadow-sm leading-relaxed text-surface-700 whitespace-pre-wrap">
                  {analysis.reason}
                </div>
              </div>

              {/* Chart */}
              {chartData.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-surface-900 mb-3">株価推移（30日間）</h4>
                  <div className="bg-white rounded-xl p-4 border border-surface-200 shadow-sm h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                          dy={10}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                          dx={-10}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="終値"
                          name="終値"
                          stroke="#6366f1"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-surface-50 border-t border-surface-100 px-6 py-4 flex justify-end sticky bottom-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-surface-300 hover:bg-surface-50 text-surface-700 font-medium rounded-lg transition-colors shadow-sm"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );

  // ブラウザ環境でのみPortalを使用
  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
};
