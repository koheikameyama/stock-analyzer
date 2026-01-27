'use client';

import { useQuery } from '@tanstack/react-query';

interface PortfolioData {
  investmentBudget: number;
  holdings: Holding[];
}

interface Holding {
  id: string;
  stockId: string;
  ticker: string;
  name: string;
  shares: number;
  purchasePrice: number;
  purchaseDate: string;
  estimatedCost: number;
}

async function fetchPortfolio(): Promise<PortfolioData> {
  const res = await fetch('/api/holdings');
  if (!res.ok) throw new Error('ポートフォリオ取得エラー');
  return res.json();
}

export default function HoldingsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolio,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">📊 保有銘柄一覧</h2>
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">📊 保有銘柄一覧</h2>
        <p className="text-red-500">エラーが発生しました</p>
      </div>
    );
  }

  if (!data || data.holdings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">📊 保有銘柄一覧</h2>
        <p className="text-gray-500">保有銘柄がありません</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">📊 保有銘柄一覧 ({data.holdings.length}銘柄)</h2>

      <div className="space-y-4">
        {data.holdings.map(holding => {
          // 仮の現在価格（TODO: 最新株価を取得）
          const currentPrice = holding.purchasePrice;
          const currentValue = holding.shares * currentPrice;
          const profitLoss = currentValue - holding.estimatedCost;
          const profitLossPercent = (profitLoss / holding.estimatedCost) * 100;

          return (
            <div
              key={holding.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap justify-between items-start gap-3">
                {/* 銘柄情報 */}
                <div className="flex-grow min-w-0">
                  <h3 className="text-lg font-bold break-words">{holding.name}</h3>
                  <p className="text-sm text-gray-500">
                    {holding.ticker} • {holding.shares}株 × ¥
                    {holding.purchasePrice.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    購入日: {new Date(holding.purchaseDate).toLocaleDateString('ja-JP')}
                  </p>
                </div>

                {/* 評価額・損益 */}
                <div className="text-right whitespace-nowrap flex-shrink-0">
                  <p className="text-sm text-gray-600">評価額</p>
                  <p className="text-xl font-bold">¥{currentValue.toLocaleString()}</p>
                  <p
                    className={`text-sm font-bold ${
                      profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {profitLoss >= 0 ? '+' : ''}¥{profitLoss.toLocaleString()} (
                    {profitLoss >= 0 ? '+' : ''}
                    {profitLossPercent.toFixed(2)}%)
                  </p>
                </div>
              </div>

              {/* AI評価（TODO: 最新分析結果を表示） */}
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">AI評価:</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium">
                    Hold
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
