/**
 * 分析詳細モーダルコンポーネント
 * 詳細解説と株価チャートを表示（AI分析あり・なし両対応）
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { AnalysisDetail, Recommendation } from '../types/analysis';
import { useAnalysisDetail } from '../hooks/useAnalyses';
import { LoadingSpinner } from './LoadingSpinner';
import { Tooltip as InfoTooltip } from './Tooltip';
import { StockChart } from './StockChart';
import { SectorComparison } from './SectorComparison';

interface AnalysisDetailModalProps {
  analysisId?: string | null;
  ticker?: string | null;
  onClose: () => void;
}

interface StockData {
  ticker: string;
  name: string;
  price: number;
  sector?: string;
  per?: number;
  pbr?: number;
  roe?: number;
  dividendYield?: number;
  priceHistory?: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
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
  ticker,
  onClose,
}) => {
  const { data: analysis, isLoading: isLoadingAnalysis, error: analysisError } = useAnalysisDetail(analysisId, !!analysisId);

  // ticker指定の場合は株価データを取得
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker || analysisId) return; // analysisIdがある場合はtickerを無視

    const fetchStockData = async () => {
      setIsLoadingStock(true);
      setStockError(null);

      try {
        const response = await fetch(`/api/stock-data/${ticker}`);
        if (!response.ok) {
          throw new Error('データの取得に失敗しました');
        }
        const data = await response.json();
        setStockData(data.data);
      } catch (err) {
        setStockError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setIsLoadingStock(false);
      }
    };

    fetchStockData();
  }, [ticker, analysisId]);

  const isLoading = isLoadingAnalysis || isLoadingStock;
  const error = analysisError || stockError;

  // ESCキーで閉じる & 背景スクロール防止
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // モーダル表示時は背景のスクロールを無効化
    if (analysisId || ticker) {
      document.body.style.overflow = 'hidden';
    }

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, analysisId, ticker]);

  if (!analysisId && !ticker) return null;

  // 株価チャート用のデータ整形（OHLCと出来高を含む）
  const chartData = analysis?.stock.priceHistory
    ? [...analysis.stock.priceHistory]
      .reverse()
      .map((history) => ({
        date: history.date,
        open: parseFloat(history.open.toString()),
        high: parseFloat(history.high.toString()),
        low: parseFloat(history.low.toString()),
        close: parseFloat(history.close.toString()),
        volume: parseInt(history.volume.toString()),
      }))
    : stockData?.priceHistory
    ? stockData.priceHistory.map((history) => ({
        date: history.date,
        open: history.open,
        high: history.high,
        low: history.low,
        close: history.close,
        volume: history.volume,
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

          {(analysis || stockData) && (
            <div className="space-y-8">
              {/* Top Summary Section */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Stock Info */}
                <div className="bg-surface-50 rounded-xl p-5 border border-surface-100">
                  <div className="mb-4">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div className="text-sm font-medium text-surface-500">
                        {analysis ? (analysis.stock.market === 'JP' ? '日本市場' : '米国市場') : '日本市場'} • {analysis?.stock.sector || stockData?.sector || '不明'}
                      </div>
                      {analysis ? (
                        <div className={`px-3 py-1 rounded-full text-sm font-bold border whitespace-nowrap flex-shrink-0 ${getRecommendationColor(analysis.recommendation)}`}>
                          {analysis.recommendation === 'Buy' ? '買い' : analysis.recommendation === 'Sell' ? '売り' : '様子見'}
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-full text-sm font-bold border bg-surface-100 text-surface-600 border-surface-300 whitespace-nowrap flex-shrink-0">
                          AI分析なし
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-surface-900 tracking-tight break-words">
                      {analysis?.stock.name || stockData?.name || '不明'}
                    </h3>
                    <div className="font-mono text-surface-500">
                      {analysis?.stock.ticker || stockData?.ticker || '不明'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <div className="text-xs text-surface-500 uppercase tracking-wider font-semibold">現在価格</div>
                      <div className="text-xl font-bold text-surface-900">
                        ¥{(analysis?.currentPrice || stockData?.price)?.toLocaleString() || '不明'}
                      </div>
                    </div>
                    {analysis && (
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
                    )}
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
                        {(analysis?.peRatio || stockData?.per) ? Number(analysis?.peRatio || stockData?.per).toFixed(2) : 'N/A'}
                      </div>
                    </div>
                    <div className="p-2">
                      <div className="text-xs text-surface-500 flex items-center">
                        PBR (Price/Book)
                        <InfoTooltip content="株価純資産倍率。株価が1株あたり純資産の何倍かを示す指標です。1倍を下回ると割安、1.5倍以上だと割高とされることが多いです。" />
                      </div>
                      <div className="text-lg font-semibold text-surface-900">
                        {(analysis?.pbRatio || stockData?.pbr) ? Number(analysis?.pbRatio || stockData?.pbr).toFixed(2) : 'N/A'}
                      </div>
                    </div>
                    <div className="p-2">
                      <div className="text-xs text-surface-500 flex items-center">
                        ROE (Return on Equity)
                        <InfoTooltip content="自己資本利益率。企業が株主の資本をどれだけ効率的に使って利益を上げているかを示す指標です。10%以上が優良企業の目安とされます。" />
                      </div>
                      <div className="text-lg font-semibold text-surface-900">
                        {(analysis?.roe || stockData?.roe) ? `${Number(analysis?.roe || stockData?.roe).toFixed(2)}%` : 'N/A'}
                      </div>
                    </div>
                    <div className="p-2">
                      <div className="text-xs text-surface-500 flex items-center">
                        配当利回り
                        <InfoTooltip content="年間配当金が株価の何%かを示す指標です。高いほど株主への還元が手厚いと言えます。日本株では2-3%が平均的です。" />
                      </div>
                      <div className="text-lg font-semibold text-surface-900">
                        {analysis?.dividendYield ? `${(Number(analysis.dividendYield) / 100).toFixed(2)}%` : stockData?.dividendYield ? `${Number(stockData.dividendYield).toFixed(2)}%` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sector Comparison */}
              {analysis?.sectorComparison && analysis.stock.sector && (
                <SectorComparison
                  sectorComparison={analysis.sectorComparison}
                  sector={analysis.stock.sector}
                  currentPer={analysis.peRatio}
                  currentPbr={analysis.pbRatio}
                  currentRoe={analysis.roe}
                />
              )}

              {/* Analysis Text */}
              {analysis ? (
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
              ) : (
                <div>
                  <h4 className="text-lg font-bold text-surface-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI分析
                  </h4>
                  <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <p className="font-semibold text-amber-900 mb-1">AI分析なし</p>
                        <p className="text-sm text-amber-800">
                          この銘柄は現在AI分析の対象外です。財務指標と株価チャートをご参照ください。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chart */}
              {chartData.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-surface-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    株価チャート
                  </h4>
                  <StockChart
                    data={chartData}
                    ticker={analysis?.stock.ticker || stockData?.ticker || ''}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ブラウザ環境でのみPortalを使用
  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
};
