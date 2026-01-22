'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import Link from 'next/link';

type AnalysisRequest = {
  id: string;
  stockId: string;
  requestCount: number;
  stock: {
    id: string;
    ticker: string;
    name: string;
    sector: string | null;
    marketCap: number | null;
  };
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<AnalysisRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/analysis-requests');
      const result = await response.json();

      if (result.success) {
        setRequests(result.data);
      }
    } catch (error) {
      console.error('リクエスト取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMarketCap = (marketCap: number | null) => {
    if (!marketCap) return '-';
    if (marketCap >= 1_000_000_000_000) {
      return `${(marketCap / 1_000_000_000_000).toFixed(1)}兆円`;
    }
    if (marketCap >= 100_000_000) {
      return `${(marketCap / 100_000_000).toFixed(0)}億円`;
    }
    return `${marketCap.toLocaleString()}円`;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-white';
    if (rank === 2) return 'bg-gray-400 text-white';
    if (rank === 3) return 'bg-orange-600 text-white';
    return 'bg-surface-200 text-surface-700';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-surface-500">読み込み中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* ヘッダー */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900">
            📊 分析リクエストランキング
          </h1>
          <p className="text-sm sm:text-base text-surface-500 mt-1">
            ユーザーからのリクエストが多い銘柄から順次AI分析を実施します
          </p>
        </div>

        {/* 説明カード */}
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-primary-900 mb-2">
            💡 リクエスト機能について
          </h2>
          <div className="text-xs sm:text-sm text-primary-700 space-y-2">
            <p>
              現在、約3,900銘柄の基本データがありますが、AI分析は需要の高い銘柄を優先して実施しています。
            </p>
            <p>
              気になる銘柄があれば、
              <Link href="/stocks" className="underline font-semibold hover:text-primary-900">
                銘柄一覧
              </Link>
              からリクエストしてください！
            </p>
          </div>
        </div>

        {/* ランキング表示 */}
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-12 text-center text-surface-500">
              まだリクエストがありません
            </div>
          ) : (
            <>
              {/* PC: テーブル表示 */}
              <div className="hidden md:block bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-surface-50 border-b border-surface-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-surface-700 w-20">
                        順位
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-surface-700">
                        銘柄
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-surface-700">
                        業種
                      </th>
                      <th className="hidden lg:table-cell px-6 py-4 text-right text-sm font-semibold text-surface-700">
                        時価総額
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-surface-700 w-32">
                        リクエスト
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-200">
                    {requests.map((request, index) => {
                      const rank = index + 1;
                      return (
                        <tr
                          key={request.id}
                          className="hover:bg-surface-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${getRankBadgeColor(
                                rank
                              )}`}
                            >
                              {rank}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-surface-900">
                                {request.stock.name}
                              </span>
                              <span className="text-sm text-surface-500">
                                {request.stock.ticker}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-surface-600">
                              {request.stock.sector || '-'}
                            </span>
                          </td>
                          <td className="hidden lg:table-cell px-6 py-4 text-right">
                            <span className="text-sm text-surface-600">
                              {formatMarketCap(request.stock.marketCap)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center justify-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-semibold text-sm whitespace-nowrap">
                              {request.requestCount}件
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* スマホ: カード表示 */}
              <div className="md:hidden space-y-3">
                {requests.map((request, index) => {
                  const rank = index + 1;
                  return (
                    <div
                      key={request.id}
                      className="bg-white rounded-lg border border-surface-200 shadow-sm p-4"
                    >
                      <div className="flex items-start gap-3">
                        {/* 順位バッジ */}
                        <span
                          className={`flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${getRankBadgeColor(
                            rank
                          )}`}
                        >
                          {rank}
                        </span>

                        {/* 銘柄情報 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-surface-900 text-sm break-words">
                                {request.stock.name}
                              </h3>
                              <p className="text-xs text-surface-500">
                                {request.stock.ticker}
                              </p>
                            </div>
                            <span className="flex-shrink-0 inline-flex items-center justify-center px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full font-semibold text-xs whitespace-nowrap">
                              {request.requestCount}件
                            </span>
                          </div>

                          {/* 業種 */}
                          {request.stock.sector && (
                            <div className="text-xs text-surface-500">
                              {request.stock.sector}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* CTAセクション */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 sm:p-8 text-center text-white">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
            あなたが気になる銘柄をリクエスト！
          </h2>
          <p className="text-sm sm:text-base text-primary-100 mb-4 sm:mb-6">
            リクエストが多い銘柄から優先的にAI分析を実施します
          </p>
          <Link
            href="/stocks"
            className="inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-colors text-sm sm:text-base"
          >
            銘柄一覧へ
          </Link>
        </div>
      </div>
    </Layout>
  );
}
