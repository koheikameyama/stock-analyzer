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

export default function PortfolioSummary() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolio,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-red-500">エラーが発生しました</p>
      </div>
    );
  }

  if (!data || data.holdings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">ポートフォリオサマリー</h2>
        <p className="text-gray-500">まだ銘柄を購入していません</p>
        <p className="text-sm text-gray-400 mt-2">
          まずはポートフォリオ提案を受けて、銘柄を購入してください。
        </p>
      </div>
    );
  }

  // 現在資産と損益を計算（仮：購入価格で計算）
  // TODO: 最新株価を取得して正確な評価額を計算
  const totalPurchaseCost = data.holdings.reduce((sum, holding) => sum + holding.estimatedCost, 0);
  const currentValue = totalPurchaseCost; // 仮の値
  const profitLoss = currentValue - totalPurchaseCost;
  const profitLossPercent = (profitLoss / totalPurchaseCost) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">💰 ポートフォリオサマリー</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 投資予算 */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">投資予算</p>
          <p className="text-2xl font-bold">¥{data.investmentBudget.toLocaleString()}</p>
        </div>

        {/* 現在資産 */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">現在資産</p>
          <p className="text-2xl font-bold text-blue-600">¥{currentValue.toLocaleString()}</p>
        </div>

        {/* 損益 */}
        <div className={`p-4 rounded-lg ${profitLoss >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className="text-sm text-gray-600 mb-1">損益</p>
          <p
            className={`text-2xl font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {profitLoss >= 0 ? '+' : ''}¥{profitLoss.toLocaleString()}
          </p>
          <p className={`text-sm ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ({profitLoss >= 0 ? '+' : ''}
            {profitLossPercent.toFixed(2)}%)
          </p>
        </div>
      </div>

      {/* 保有銘柄数 */}
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-gray-600">
          保有銘柄数: <span className="font-bold">{data.holdings.length}銘柄</span>
        </p>
      </div>
    </div>
  );
}
