/**
 * セクター比較コンポーネント
 * 銘柄のセクター内での相対評価を表示
 */

import React from 'react';
import type { SectorComparison as SectorComparisonType } from '../types/analysis';

interface SectorComparisonProps {
  sectorComparison: SectorComparisonType;
  sector: string;
  currentPer: number | null;
  currentPbr: number | null;
  currentRoe: number | null;
}

interface ComparisonBarProps {
  label: string;
  currentValue: number;
  sectorAvg: number;
  diff: number;
  type: 'lower-is-better' | 'higher-is-better';
}

/**
 * 比較バーコンポーネント
 */
const ComparisonBar: React.FC<ComparisonBarProps> = ({
  label,
  currentValue,
  sectorAvg,
  diff,
  type,
}) => {
  // 割安・割高の判定
  const isBetter = type === 'lower-is-better' ? diff < 0 : diff > 0;
  const statusText = isBetter
    ? type === 'lower-is-better'
      ? '割安'
      : '優良'
    : type === 'lower-is-better'
      ? '割高'
      : '低調';

  const statusColor = isBetter
    ? 'text-emerald-600 bg-emerald-50'
    : 'text-amber-600 bg-amber-50';

  // プログレスバーの幅を計算（差分の絶対値を使用、最大50%）
  const barWidth = Math.min(Math.abs(diff), 50);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor}`}>
          {statusText} {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600 whitespace-nowrap">
          この銘柄: <span className="font-semibold text-gray-900">{currentValue.toFixed(2)}</span>
        </span>
        <span className="text-gray-400">vs</span>
        <span className="text-gray-600 whitespace-nowrap">
          平均: <span className="font-semibold text-gray-900">{sectorAvg.toFixed(2)}</span>
        </span>
      </div>

      {/* プログレスバー */}
      <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${isBetter ? 'bg-emerald-500' : 'bg-amber-500'}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
};

/**
 * セクター比較コンポーネント
 */
export const SectorComparison: React.FC<SectorComparisonProps> = ({
  sectorComparison,
  sector,
  currentPer,
  currentPbr,
  currentRoe,
}) => {
  // データが揃っていない場合は表示しない
  if (!currentPer || !currentPbr || !currentRoe) {
    return null;
  }

  // セクター内順位を計算（簡易版：差分の平均から推定）
  const avgDiff = (
    Math.abs(sectorComparison.per_diff) +
    Math.abs(sectorComparison.pbr_diff) +
    Math.abs(sectorComparison.roe_diff)
  ) / 3;

  // 全体的な評価
  const isUndervalued = sectorComparison.per_diff < 0 && sectorComparison.pbr_diff < 0;
  const isOvervalued = sectorComparison.per_diff > 0 && sectorComparison.pbr_diff > 0;

  let overallStatus = '';
  if (isUndervalued && sectorComparison.roe_diff > 0) {
    overallStatus = `この銘柄は${sector}セクターの中で割安な水準にあります`;
  } else if (isOvervalued && sectorComparison.roe_diff < 0) {
    overallStatus = `この銘柄は${sector}セクターの中で割高な水準にあります`;
  } else {
    overallStatus = `この銘柄は${sector}セクターの平均的な水準です`;
  }

  return (
    <section className="bg-blue-50 p-4 rounded-lg">
      <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
        <span>📊 セクター比較</span>
        <span className="text-sm font-normal text-gray-600">
          {sector}
        </span>
      </h3>

      {/* PER比較 */}
      <ComparisonBar
        label="PER (株価収益率)"
        currentValue={currentPer}
        sectorAvg={sectorComparison.sector_avg_per}
        diff={sectorComparison.per_diff}
        type="lower-is-better"
      />

      {/* PBR比較 */}
      <ComparisonBar
        label="PBR (株価純資産倍率)"
        currentValue={currentPbr}
        sectorAvg={sectorComparison.sector_avg_pbr}
        diff={sectorComparison.pbr_diff}
        type="lower-is-better"
      />

      {/* ROE比較 */}
      <ComparisonBar
        label="ROE (自己資本利益率)"
        currentValue={currentRoe}
        sectorAvg={sectorComparison.sector_avg_roe}
        diff={sectorComparison.roe_diff}
        type="higher-is-better"
      />

      {/* サマリー */}
      <div className="mt-4 p-3 bg-white rounded border border-blue-200">
        <div className="text-sm text-gray-700">
          💡 {overallStatus}
        </div>
      </div>
    </section>
  );
};
