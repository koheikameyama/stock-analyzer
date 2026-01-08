/**
 * 分析カードコンポーネント（初心者向けデザイン）
 */

import React from 'react';
import type { Analysis } from '../types/analysis';

interface AnalysisCardProps {
  analysis: Analysis;
  onDetailClick: (analysisId: string) => void;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
  analysis,
  onDetailClick,
}) => {
  const { stock, recommendation, confidenceScore, currentPrice, reasonShort } = analysis;

  // 推奨アクションの設定（絵文字付き）
  const getRecommendationConfig = (rec: string) => {
    switch (rec) {
      case 'Buy':
        return {
          emoji: '📈',
          label: '買い',
          bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
          borderColor: 'border-emerald-300',
          textColor: 'text-emerald-700',
          description: '今が買い時かも！'
        };
      case 'Sell':
        return {
          emoji: '📉',
          label: '売り',
          bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
          borderColor: 'border-red-300',
          textColor: 'text-red-700',
          description: '売却を検討しましょう'
        };
      case 'Hold':
        return {
          emoji: '⏸️',
          label: '様子見',
          bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
          borderColor: 'border-amber-300',
          textColor: 'text-amber-700',
          description: 'しばらく保有がおすすめ'
        };
      default:
        return {
          emoji: '📊',
          label: rec,
          bgColor: 'bg-surface-50',
          borderColor: 'border-surface-200',
          textColor: 'text-surface-700',
          description: ''
        };
    }
  };

  const config = getRecommendationConfig(recommendation);

  // 信頼度の色とメッセージ
  const getConfidenceConfig = (score: number) => {
    if (score >= 85) {
      return {
        barColor: 'bg-emerald-500',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        label: '信頼度が高い',
        emoji: '✨'
      };
    } else if (score >= 70) {
      return {
        barColor: 'bg-blue-500',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        label: 'まずまずの信頼度',
        emoji: '👍'
      };
    } else {
      return {
        barColor: 'bg-amber-500',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        label: '参考程度に',
        emoji: '💡'
      };
    }
  };

  const confidenceConfig = getConfidenceConfig(confidenceScore);

  return (
    <div
      onClick={() => onDetailClick(analysis.id)}
      className="group bg-white rounded-xl border-2 border-surface-200 hover:border-primary-300 p-5 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col h-full"
    >
      {/* ヘッダー：推奨アクションバッジ */}
      <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-lg px-4 py-3 mb-4`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.emoji}</span>
          <div>
            <div className={`text-lg font-bold ${config.textColor}`}>
              {config.label}推奨
            </div>
            <div className={`text-xs ${config.textColor} opacity-75`}>
              {config.description}
            </div>
          </div>
        </div>
      </div>

      {/* 銘柄情報 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-xs font-semibold text-surface-500 bg-surface-100 px-2 py-1 rounded">
            {stock.ticker}
          </span>
          <span className="text-xs text-surface-400">
            {stock.market === 'JP' ? '🇯🇵 日本株' : '🇺🇸 米国株'}
          </span>
        </div>
        <h3 className="font-bold text-xl text-surface-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {stock.name}
        </h3>
        <div className="text-3xl font-bold text-surface-900 tracking-tight">
          ¥{Number(currentPrice).toLocaleString()}
          <span className="text-sm text-surface-400 font-normal ml-2">現在価格</span>
        </div>
      </div>

      {/* AI分析コメント */}
      <div className="bg-surface-50 rounded-lg p-3 mb-4 flex-grow">
        <div className="flex items-start gap-2">
          <span className="text-lg flex-shrink-0">🤖</span>
          <p className="text-surface-700 text-sm line-clamp-3 leading-relaxed">
            {reasonShort}
          </p>
        </div>
      </div>

      {/* 信頼度表示 */}
      <div className={`${confidenceConfig.bgColor} rounded-lg p-3 border ${confidenceConfig.bgColor === 'bg-emerald-50' ? 'border-emerald-200' : confidenceConfig.bgColor === 'bg-blue-50' ? 'border-blue-200' : 'border-amber-200'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <span>{confidenceConfig.emoji}</span>
            <span className={`text-xs font-semibold ${confidenceConfig.textColor}`}>
              {confidenceConfig.label}
            </span>
          </div>
          <span className={`text-lg font-bold ${confidenceConfig.textColor}`}>
            {confidenceScore}%
          </span>
        </div>
        {/* プログレスバー */}
        <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
          <div
            className={`${confidenceConfig.barColor} h-full rounded-full transition-all duration-500`}
            style={{ width: `${confidenceScore}%` }}
          ></div>
        </div>
      </div>

      {/* 詳細を見るリンク */}
      <div className="mt-4 pt-3 border-t border-surface-100">
        <span className="text-primary-600 text-sm font-medium group-hover:gap-2 flex items-center gap-1 transition-all">
          詳しく見る
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
};
