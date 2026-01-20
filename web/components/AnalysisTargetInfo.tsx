/**
 * AI分析対象銘柄の説明コンポーネント
 */

'use client';

import { useState } from 'react';

export function AnalysisTargetInfo() {
  const [isExpanded, setIsExpanded] = useState(false);

  const targetStocks = [
    { ticker: '7203', name: 'トヨタ自動車', sector: '輸送用機器' },
    { ticker: '6758', name: 'ソニーグループ', sector: '電気機器' },
    { ticker: '9984', name: 'ソフトバンクグループ', sector: '情報・通信業' },
    { ticker: '6861', name: 'キーエンス', sector: '電気機器' },
    { ticker: '8035', name: '東京エレクトロン', sector: '電気機器' },
    { ticker: '8058', name: '三菱商事', sector: '卸売業' },
    { ticker: '4502', name: '武田薬品工業', sector: '医薬品' },
    { ticker: '6098', name: 'リクルートホールディングス', sector: 'サービス業' },
    { ticker: '9433', name: 'ＫＤＤＩ', sector: '情報・通信業' },
    { ticker: '8306', name: '三菱ＵＦＪフィナンシャル・グループ', sector: '銀行業' },
    { ticker: '7974', name: '任天堂', sector: 'その他製品' },
    { ticker: '6367', name: 'ダイキン工業', sector: '機械' },
    { ticker: '6902', name: 'デンソー', sector: '輸送用機器' },
    { ticker: '7267', name: '本田技研工業', sector: '輸送用機器' },
    { ticker: '4063', name: '信越化学工業', sector: '化学' },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-3xl">💡</span>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            現在のAI分析対象：15銘柄
          </h3>
          <p className="text-sm text-blue-800 leading-relaxed mb-3">
            日本を代表する超優良企業を厳選しています。
            これらは時価総額・取引量・業種のバランスを考慮し、
            日本経済の動向を把握するのに最適な銘柄です。
          </p>

          {/* 選定基準 */}
          <div className="bg-white/80 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm">
              📊 選定基準
            </h4>
            <ul className="space-y-1.5 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <span>
                  <strong>時価総額トップクラス：</strong>
                  日本を代表する大企業（トヨタ、ソニー、ソフトバンクGなど）
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <span>
                  <strong>業種の多様性：</strong>
                  輸送用機器、電気機器、金融、通信、医薬品など10業種をカバー
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <span>
                  <strong>流動性：</strong>
                  日経225採用銘柄で取引量が多く、価格が安定
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <span>
                  <strong>グローバル企業：</strong>
                  世界市場で活躍する日本企業の代表格
                </span>
              </li>
            </ul>
          </div>

          {/* トグルボタン */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors"
          >
            {isExpanded ? '▼' : '▶'} 分析対象15銘柄を見る
          </button>

          {/* 銘柄リスト */}
          {isExpanded && (
            <div className="mt-4 bg-white rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {targetStocks.map((stock) => (
                  <div
                    key={stock.ticker}
                    className="flex items-center gap-2 text-sm py-1.5 px-2 rounded hover:bg-blue-50 transition-colors"
                  >
                    <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                      {stock.ticker}
                    </span>
                    <span className="font-medium text-surface-900 flex-1">
                      {stock.name}
                    </span>
                    <span className="text-xs text-surface-500">
                      {stock.sector}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 今後の展開 */}
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>🚀 今後の展開：</strong>
              ユーザーの皆様からのフィードバックを基に、分析対象銘柄を順次拡大していく予定です。
              分析してほしい銘柄がありましたら、ぜひフィードバックをお寄せください！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
