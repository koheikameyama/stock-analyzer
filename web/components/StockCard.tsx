/**
 * 銘柄カードコンポーネント（シンプルな一覧表示用）
 */

'use client';

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
    reason?: string;
    currentPrice?: number;
  } | null;
}

interface StockCardProps {
  stock: Stock;
  onClick?: () => void;
}

/**
 * 銘柄カード（シンプル版）
 */
export function StockCard({ stock, onClick }: StockCardProps) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl border-2 border-surface-200 hover:border-primary-300 p-5 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col h-full"
    >
      {/* ヘッダー */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-sm font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded">
            {stock.ticker}
          </span>
          {stock.isAiAnalysisTarget && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
              AI分析対象
            </span>
          )}
        </div>
        <h3 className="font-bold text-lg text-surface-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors leading-snug">
          {stock.name}
        </h3>
      </div>

      {/* 現在価格 */}
      {stock.latestAnalysis?.currentPrice && (
        <div className="mb-3">
          <div className="text-2xl font-bold text-surface-900 tracking-tight">
            ¥{Number(stock.latestAnalysis.currentPrice).toLocaleString()}
          </div>
          <div className="text-xs text-surface-400 mt-0.5">現在価格</div>
        </div>
      )}

      {/* セクター */}
      {stock.sector && (
        <div className="mb-3">
          <div className="text-sm text-surface-600">{stock.sector}</div>
        </div>
      )}

      {/* フッター */}
      <div className="mt-auto pt-3 border-t border-surface-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-surface-500">クリックで詳細</span>
          <span className="text-primary-600 group-hover:text-primary-700 font-medium">
            →
          </span>
        </div>
      </div>
    </div>
  );
}
