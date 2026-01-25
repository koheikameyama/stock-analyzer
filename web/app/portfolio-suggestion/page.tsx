'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Layout } from '../../components/Layout';

// レスポンスの型定義
interface StockSuggestion {
  stockId: number;
  code: string;
  name: string;
  shares: number;
  price: number;
  amount: number;
  sector: string;
  reason: string;
}

interface PortfolioSuggestion {
  stocks: StockSuggestion[];
  totalAmount: number;
  cashReserve: number;
  aiExplanation: string;
  disclaimer: string;
}

export default function PortfolioSuggestionPage() {
  const [amount, setAmount] = useState<number>(100000);
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');
  const [investmentPeriod, setInvestmentPeriod] = useState<'short' | 'medium' | 'long'>('long');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PortfolioSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/portfolio-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          riskTolerance,
          investmentPeriod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'エラーが発生しました');
      }

      const data: PortfolioSuggestion = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">初心者向けポートフォリオ提案</h1>

        {/* 説明文 */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-sm text-gray-700">
            これから株式投資を始める方向けに、AI がポートフォリオを提案します。
            投資金額、リスク許容度、投資期間を入力してください。
          </p>
        </div>

        {/* 入力フォーム */}
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
          {/* 投資金額 */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              投資金額
            </label>
            <select
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value={100000}>10万円</option>
              <option value={300000}>30万円</option>
              <option value={500000}>50万円</option>
              <option value={1000000}>100万円</option>
            </select>
          </div>

          {/* リスク許容度 */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              リスク許容度
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="conservative"
                  checked={riskTolerance === 'conservative'}
                  onChange={(e) => setRiskTolerance(e.target.value as any)}
                  className="mr-2"
                />
                <span className="text-sm">安定志向（高配当・低リスク）</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="balanced"
                  checked={riskTolerance === 'balanced'}
                  onChange={(e) => setRiskTolerance(e.target.value as any)}
                  className="mr-2"
                />
                <span className="text-sm">バランス（適度なリスクとリターン）</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="aggressive"
                  checked={riskTolerance === 'aggressive'}
                  onChange={(e) => setRiskTolerance(e.target.value as any)}
                  className="mr-2"
                />
                <span className="text-sm">積極的（高リターン・高リスク）</span>
              </label>
            </div>
          </div>

          {/* 投資期間 */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              投資期間
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="short"
                  checked={investmentPeriod === 'short'}
                  onChange={(e) => setInvestmentPeriod(e.target.value as any)}
                  className="mr-2"
                />
                <span className="text-sm">短期（1年未満）</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="medium"
                  checked={investmentPeriod === 'medium'}
                  onChange={(e) => setInvestmentPeriod(e.target.value as any)}
                  className="mr-2"
                />
                <span className="text-sm">中期（1-3年）</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="long"
                  checked={investmentPeriod === 'long'}
                  onChange={(e) => setInvestmentPeriod(e.target.value as any)}
                  className="mr-2"
                />
                <span className="text-sm">長期（3年以上）</span>
              </label>
            </div>
          </div>

          {/* 提案ボタン */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400 w-full"
          >
            {loading ? 'AI が提案を生成中...' : 'ポートフォリオを提案してもらう'}
          </button>
        </form>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* 結果表示 */}
        {result && (
          <div className="space-y-6">
            {/* AI説明 */}
            <div className="bg-green-50 border-l-4 border-green-500 p-6">
              <h2 className="text-xl font-bold mb-4 text-green-800">💡 AI による提案</h2>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    h2: ({ children }) => (
                      <h3 className="text-lg font-bold mt-4 mb-2 text-green-700 first:mt-0">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-sm text-gray-700 mb-3 leading-relaxed">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="text-sm text-gray-700 mb-3 list-disc list-inside space-y-1">{children}</ul>
                    ),
                    li: ({ children }) => (
                      <li className="text-sm text-gray-700">{children}</li>
                    ),
                  }}
                >
                  {result.aiExplanation}
                </ReactMarkdown>
              </div>
            </div>

            {/* ポートフォリオ詳細 */}
            <div className="bg-white shadow-md rounded p-6">
              <h2 className="text-xl font-bold mb-4">推奨ポートフォリオ</h2>

              {/* 銘柄リスト */}
              <div className="space-y-4 mb-6">
                {result.stocks.map((stock) => (
                  <div key={stock.stockId} className="border-b pb-4">
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <div>
                        <h3 className="font-bold break-words">{stock.name}</h3>
                        <p className="text-sm text-gray-600">コード: {stock.code} / セクター: {stock.sector}</p>
                      </div>
                      <div className="text-right whitespace-nowrap flex-shrink-0">
                        <p className="font-bold text-lg">{stock.amount.toLocaleString()}円</p>
                        <p className="text-sm text-gray-600">{stock.shares}株 × {stock.price.toLocaleString()}円</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{stock.reason}</p>
                  </div>
                ))}
              </div>

              {/* サマリー */}
              <div className="bg-gray-50 p-4 rounded">
                <div className="flex justify-between mb-2">
                  <span className="font-bold">投資総額</span>
                  <span className="font-bold">{result.totalAmount.toLocaleString()}円</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>現金（余剰資金）</span>
                  <span>{result.cashReserve.toLocaleString()}円</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold">合計</span>
                  <span className="font-bold">{amount.toLocaleString()}円</span>
                </div>
              </div>
            </div>

            {/* 免責事項 */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <h3 className="font-bold mb-2">⚠️ 免責事項</h3>
              <p className="text-xs text-gray-700">{result.disclaimer}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
