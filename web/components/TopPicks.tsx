/**
 * 今日のおすすめ銘柄コンポーネント
 * 上位3銘柄を表示
 */

'use client';

import { useEffect, useState } from 'react';

interface TopPick {
  rank: number;
  medal: string;
  signal: 'buy' | 'hold' | 'sell';
  analysis: {
    id: string;
    confidenceScore: number;
    recommendation: string;
    reason: string;
    analysisDate: Date;
  };
  stock: {
    id: string;
    ticker: string;
    name: string;
    sector: string;
  };
}

interface TopPicksData {
  topPicks: TopPick[];
  generatedAt: string;
}

export const TopPicks = ({ onStockClick }: { onStockClick: (analysisId: string) => void }) => {
  const [data, setData] = useState<TopPicksData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopPicks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/analyses/top-picks');
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError('データの取得に失敗しました');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopPicks();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h2 className="text-xl font-bold text-surface-900 mb-4 flex items-center gap-2">
          <span>🌟</span>
          今日のおすすめ銘柄
        </h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h2 className="text-xl font-bold text-surface-900 mb-4 flex items-center gap-2">
          <span>🌟</span>
          今日のおすすめ銘柄
        </h2>
        <p className="text-surface-600 text-sm">データを取得できませんでした</p>
      </div>
    );
  }

  const getSignalInfo = (signal: 'buy' | 'hold' | 'sell') => {
    switch (signal) {
      case 'buy':
        return {
          icon: '📈',
          text: '買いシグナル',
          color: 'text-emerald-700',
          bgColor: 'bg-emerald-100',
        };
      case 'sell':
        return {
          icon: '📉',
          text: '売りシグナル',
          color: 'text-red-700',
          bgColor: 'bg-red-100',
        };
      default:
        return {
          icon: '➡️',
          text: '様子見',
          color: 'text-surface-700',
          bgColor: 'bg-surface-100',
        };
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-surface-900 flex items-center gap-2">
          <span>🌟</span>
          今日のおすすめ銘柄
        </h2>
        <span className="text-xs text-surface-500">
          {new Date(data.generatedAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} 更新
        </span>
      </div>

      <p className="text-sm text-surface-600 mb-6">
        AIが分析したスコア上位3銘柄をご紹介します
      </p>

      <div className="space-y-3">
        {data.topPicks.map((pick) => {
          const signalInfo = getSignalInfo(pick.signal);
          return (
            <div
              key={pick.analysis.id}
              onClick={() => onStockClick(pick.analysis.id)}
              className="bg-white rounded-lg p-4 border border-surface-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                {/* ランキング */}
                <div className="text-3xl flex-shrink-0">{pick.medal}</div>

                {/* メイン情報 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-surface-900 break-words">
                        {pick.stock.name}
                      </h3>
                      <p className="text-sm text-surface-500">
                        {pick.stock.ticker} | {pick.stock.sector}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {pick.analysis.confidenceScore}点
                      </div>
                    </div>
                  </div>

                  {/* シグナル */}
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${signalInfo.bgColor} ${signalInfo.color}`}>
                    <span>{signalInfo.icon}</span>
                    <span>{signalInfo.text}</span>
                  </div>

                  {/* 理由 */}
                  <p className="text-sm text-surface-600 mt-2 line-clamp-2">
                    {pick.analysis.reason}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-blue-200">
        <p className="text-xs text-surface-500 text-center">
          ※ 投資判断は自己責任でお願いします。AIの分析は参考情報です。
        </p>
      </div>
    </div>
  );
};
