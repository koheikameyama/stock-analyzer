'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

type Step = 'budget' | 'proposal' | 'record';

interface ProposedStock {
  stockId: string;
  ticker: string;
  name: string;
  sector: string;
  currentPrice: number;
  recommendedShares: number;
  estimatedCost: number;
  reason: string;
}

interface ProposeResponse {
  investmentBudget: number;
  proposedStocks: ProposedStock[];
  totalEstimatedCost: number;
}

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('budget');
  const [investmentBudget, setInvestmentBudget] = useState('');
  const [proposal, setProposal] = useState<ProposeResponse | null>(null);

  // ポートフォリオ提案を取得
  const proposeMutation = useMutation({
    mutationFn: async (budget: number) => {
      const res = await fetch('/api/portfolio/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investmentBudget: budget }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'ポートフォリオ提案エラー');
      }
      return res.json();
    },
    onSuccess: data => {
      setProposal(data);
      setStep('proposal');
    },
  });

  // 購入記録
  const recordMutation = useMutation({
    mutationFn: async (
      holdings: {
        stockId: string;
        shares: number;
        purchasePrice: number;
        purchaseDate: string;
      }[]
    ) => {
      // 各銘柄を順次登録
      for (const holding of holdings) {
        const res = await fetch('/api/holdings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...holding,
            investmentBudget: proposal?.investmentBudget,
          }),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || '購入記録エラー');
        }
      }
    },
    onSuccess: () => {
      router.push('/dashboard');
    },
  });

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budget = parseInt(investmentBudget);
    if (budget >= 10000) {
      proposeMutation.mutate(budget);
    }
  };

  const handleRecordPurchase = () => {
    if (!proposal) return;

    // 提案された銘柄を全て購入済みとして記録
    const holdings = proposal.proposedStocks.map(stock => ({
      stockId: stock.stockId,
      shares: stock.recommendedShares,
      purchasePrice: stock.currentPrice,
      purchaseDate: new Date().toISOString(),
    }));

    recordMutation.mutate(holdings);
  };

  // ステップ1: 投資予算入力
  if (step === 'budget') {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6">ステップ1: 投資予算を入力</h2>
        <form onSubmit={handleBudgetSubmit}>
          <div className="mb-6">
            <label htmlFor="budget" className="block text-sm font-medium mb-2">
              いくらから始めますか？
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
              <input
                type="number"
                id="budget"
                value={investmentBudget}
                onChange={e => setInvestmentBudget(e.target.value)}
                className="w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 300000"
                min="10000"
                step="10000"
                required
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">※ 最低10,000円から始められます</p>
          </div>

          {proposeMutation.isError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
              {proposeMutation.error instanceof Error
                ? proposeMutation.error.message
                : 'エラーが発生しました'}
            </div>
          )}

          <button
            type="submit"
            disabled={proposeMutation.isPending}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {proposeMutation.isPending ? 'AIが銘柄を選定中...' : '次へ：AI提案を見る'}
          </button>
        </form>
      </div>
    );
  }

  // ステップ2: AI提案を確認
  if (step === 'proposal' && proposal) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-2">ステップ2: AIが選定したポートフォリオ</h2>
        <p className="text-gray-600 mb-6">
          投資予算: ¥{proposal.investmentBudget.toLocaleString()} で始められる
          {proposal.proposedStocks.length}銘柄を選定しました
        </p>

        <div className="space-y-4 mb-6">
          {proposal.proposedStocks.map(stock => (
            <div key={stock.stockId} className="border rounded-lg p-4">
              <div className="flex justify-between items-start gap-4 mb-2">
                <div>
                  <h3 className="font-bold">{stock.name}</h3>
                  <p className="text-sm text-gray-500">
                    {stock.ticker} • {stock.sector}
                  </p>
                </div>
                <div className="text-right whitespace-nowrap">
                  <p className="text-sm text-gray-600">購入金額</p>
                  <p className="font-bold">¥{stock.estimatedCost.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{stock.reason}</p>
              <p className="text-xs text-gray-400 mt-2">
                推奨: {stock.recommendedShares}株 × ¥{stock.currentPrice.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <span className="font-medium">合計金額</span>
            <span className="text-2xl font-bold">
              ¥{proposal.totalEstimatedCost.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300"
          >
            後で購入する
          </button>
          <button
            onClick={handleRecordPurchase}
            disabled={recordMutation.isPending}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {recordMutation.isPending ? '記録中...' : '楽天証券で購入済み（記録する）'}
          </button>
        </div>

        {recordMutation.isError && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded">
            {recordMutation.error instanceof Error
              ? recordMutation.error.message
              : 'エラーが発生しました'}
          </div>
        )}
      </div>
    );
  }

  return null;
}
