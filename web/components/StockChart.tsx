/**
 * 株価チャートコンポーネント
 * ローソク足、出来高、移動平均線を表示する投資判断に役立つチャート
 */

import React, { useState, useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Tooltip as InfoTooltip } from './Tooltip';

interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockChartProps {
  data: PriceData[];
  ticker: string;
}

type Period = '1W' | '1M' | '3M' | '6M' | '1Y';

/**
 * 移動平均を計算
 */
function calculateMA(data: PriceData[], period: number): (number | null)[] {
  const result: (number | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0);
      result.push(sum / period);
    }
  }

  return result;
}

/**
 * ローソク足のカスタムシェイプ
 */
const CandlestickShape = (props: any) => {
  const { x, y, width, height, payload } = props;

  if (!payload) return null;

  const { open, close, high, low } = payload;
  const isUp = close >= open;
  const color = isUp ? '#10b981' : '#ef4444'; // 緑=上昇、赤=下落
  const bodyHeight = Math.abs((close - open) * (height / (payload.yMax - payload.yMin)));
  const bodyY = isUp
    ? y + height - ((close - payload.yMin) / (payload.yMax - payload.yMin)) * height
    : y + height - ((open - payload.yMin) / (payload.yMax - payload.yMin)) * height;

  const wickX = x + width / 2;
  const highY = y + height - ((high - payload.yMin) / (payload.yMax - payload.yMin)) * height;
  const lowY = y + height - ((low - payload.yMin) / (payload.yMax - payload.yMin)) * height;

  return (
    <g>
      {/* 髭（Wick） */}
      <line
        x1={wickX}
        y1={highY}
        x2={wickX}
        y2={lowY}
        stroke={color}
        strokeWidth={1}
      />
      {/* 実体（Body） */}
      <rect
        x={x + width * 0.2}
        y={bodyY}
        width={width * 0.6}
        height={Math.max(bodyHeight, 1)}
        fill={isUp ? color : color}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};

/**
 * カスタムツールチップ
 */
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white border border-surface-200 rounded-lg p-3 shadow-lg">
      <p className="text-xs text-surface-500 mb-1">{data.date}</p>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-surface-600">始値:</span>
          <span className="font-semibold">¥{data.open?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-surface-600">高値:</span>
          <span className="font-semibold text-emerald-600">¥{data.high?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-surface-600">安値:</span>
          <span className="font-semibold text-red-600">¥{data.low?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-surface-600">終値:</span>
          <span className="font-semibold">¥{data.close?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-4 pt-1 border-t border-surface-100">
          <span className="text-surface-600">出来高:</span>
          <span className="font-semibold text-xs">{(data.volume / 1000).toFixed(0)}K</span>
        </div>
        {data.ma5 && (
          <div className="flex justify-between gap-4 text-xs">
            <span className="text-blue-600">MA5:</span>
            <span>¥{data.ma5.toFixed(0)}</span>
          </div>
        )}
        {data.ma25 && (
          <div className="flex justify-between gap-4 text-xs">
            <span className="text-orange-600">MA25:</span>
            <span>¥{data.ma25.toFixed(0)}</span>
          </div>
        )}
        {data.ma75 && (
          <div className="flex justify-between gap-4 text-xs">
            <span className="text-purple-600">MA75:</span>
            <span>¥{data.ma75.toFixed(0)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 株価チャートコンポーネント
 */
export const StockChart: React.FC<StockChartProps> = ({ data, ticker }) => {
  const [period, setPeriod] = useState<Period>('1M');
  const [showMA, setShowMA] = useState({
    ma5: true,
    ma25: true,
    ma75: false,
  });

  // 期間でフィルタリング
  const filteredData = useMemo(() => {
    const days = {
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
    }[period];

    return data.slice(-days);
  }, [data, period]);

  // チャートデータを準備（移動平均線を追加）
  const chartData = useMemo(() => {
    const ma5 = calculateMA(filteredData, 5);
    const ma25 = calculateMA(filteredData, 25);
    const ma75 = calculateMA(filteredData, 75);

    // Y軸の範囲を計算
    const prices = filteredData.flatMap(d => [d.high, d.low]);
    const yMin = Math.min(...prices) * 0.98;
    const yMax = Math.max(...prices) * 1.02;

    return filteredData.map((d, i) => ({
      ...d,
      date: new Date(d.date).toLocaleDateString('ja-JP', {
        month: 'numeric',
        day: 'numeric',
      }),
      ma5: ma5[i],
      ma25: ma25[i],
      ma75: ma75[i],
      yMin,
      yMax,
    }));
  }, [filteredData]);

  // 出来高の最大値
  const maxVolume = useMemo(() => Math.max(...chartData.map(d => d.volume)), [chartData]);

  return (
    <div className="space-y-4">
      {/* コントロール */}
      <div className="space-y-3">
        {/* 期間選択 */}
        <div className="flex gap-2 flex-wrap">
          {(['1W', '1M', '3M', '6M', '1Y'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                period === p
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* 移動平均線の表示/非表示 */}
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <span className="text-surface-600 text-xs font-medium">移動平均線</span>
            <InfoTooltip content="移動平均線（MA）は一定期間の株価の平均値を線でつないだもので、トレンドを見やすくする指標です。短期MA（5日）が長期MA（25日）を下から上に突き抜けると「ゴールデンクロス」で買いシグナル、逆は「デッドクロス」で売りシグナルとされています。" />
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showMA.ma5}
                onChange={(e) => setShowMA({ ...showMA, ma5: e.target.checked })}
                className="w-4 h-4 text-blue-500 rounded"
              />
              <span className="text-blue-600 font-medium">MA5</span>
              <InfoTooltip content="5日移動平均線。短期トレンドを示します。株価の動きに素早く反応し、直近の値動きを把握できます。" />
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showMA.ma25}
                onChange={(e) => setShowMA({ ...showMA, ma25: e.target.checked })}
                className="w-4 h-4 text-orange-500 rounded"
              />
              <span className="text-orange-600 font-medium">MA25</span>
              <InfoTooltip content="25日移動平均線。中期トレンドを示します。約1ヶ月の値動きを平均化し、短期的なノイズを除去します。" />
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showMA.ma75}
                onChange={(e) => setShowMA({ ...showMA, ma75: e.target.checked })}
                className="w-4 h-4 text-purple-500 rounded"
              />
              <span className="text-purple-600 font-medium">MA75</span>
              <InfoTooltip content="75日移動平均線。長期トレンドを示します。約3ヶ月の値動きを平均化し、大きなトレンドの方向性を判断できます。" />
            </label>
          </div>
        </div>
      </div>

      {/* メインチャート（ローソク足 + 移動平均線） */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-4">
        <h4 className="text-sm font-semibold text-surface-900 mb-3 flex items-center gap-1">
          株価推移（ローソク足）
          <InfoTooltip content="ローソク足チャートは1日の値動きを1本のローソク（実体と髭）で表します。緑は上昇（終値>始値）、赤は下落（終値<始値）を示します。上下の髭は高値・安値を示し、実体が長いほど値動きが大きく、髭が長いほど売買が活発だったことを意味します。" />
        </h4>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              dy={5}
            />
            <YAxis
              domain={['dataMin', 'dataMax']}
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              dx={-5}
              tickFormatter={(value) => `¥${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* ローソク足（疑似的にBarで表現） */}
            <Bar
              dataKey="close"
              shape={<CandlestickShape />}
              isAnimationActive={false}
            />

            {/* 移動平均線 */}
            {showMA.ma5 && (
              <Line
                type="monotone"
                dataKey="ma5"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={false}
                name="MA5"
                connectNulls
              />
            )}
            {showMA.ma25 && (
              <Line
                type="monotone"
                dataKey="ma25"
                stroke="#f97316"
                strokeWidth={1.5}
                dot={false}
                name="MA25"
                connectNulls
              />
            )}
            {showMA.ma75 && (
              <Line
                type="monotone"
                dataKey="ma75"
                stroke="#a855f7"
                strokeWidth={1.5}
                dot={false}
                name="MA75"
                connectNulls
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 出来高チャート */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-4">
        <h4 className="text-sm font-semibold text-surface-900 mb-3 flex items-center gap-1">
          出来高
          <InfoTooltip content="出来高は、その日に取引された株式の数量を示します。出来高が多いほど取引が活発で、株価の動きに信頼性が高まります。出来高を伴う株価上昇は本物のトレンド、出来高が少ない上昇は警戒が必要です。" />
        </h4>
        <ResponsiveContainer width="100%" height={150}>
          <ComposedChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              dy={5}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              dx={-5}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: any) => [`${(value / 1000).toFixed(0)}K`, '出来高']}
            />
            <Bar
              dataKey="volume"
              fill="#94a3b8"
              radius={[4, 4, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
