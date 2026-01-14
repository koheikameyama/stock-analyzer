/**
 * サービス説明モーダルコンポーネント
 * このサービスについての説明を表示
 */

import React, { useEffect } from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * サービス説明モーダルコンポーネント
 */
export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  // ESCキーで閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💡</span>
            <h2 className="text-xl font-bold text-white font-display">このサービスについて</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            aria-label="閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* サービス概要 */}
            <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
              <h3 className="text-lg font-bold text-surface-900 mb-3 flex items-center gap-2">
                <span className="text-xl">🤖</span>
                サービス概要
              </h3>
              <p className="text-surface-700 leading-relaxed">
                このサービスは、<span className="font-bold text-primary-600">AI（GPT-4o mini）を活用した日本株の分析ツール</span>です。
                日経225採用銘柄から時価総額上位・主要セクター代表15銘柄を厳選し、定期的に最新の財務データと市場動向を分析。
                「買い」「売り」「様子見」の投資推奨と、その理由をわかりやすく提示します。
              </p>
            </section>

            {/* 役立つポイント */}
            <section>
              <h3 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                <span className="text-xl">✨</span>
                このサービスが役立つ場面
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">📈</span>
                    <div>
                      <h4 className="font-bold text-emerald-900 mb-2">初心者の投資判断をサポート</h4>
                      <p className="text-sm text-emerald-800 leading-relaxed">
                        株式投資を始めたばかりで、どの銘柄を選べばいいかわからない方に。
                        AIが客観的な視点から分析し、判断の参考情報を提供します。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">💡</span>
                    <div>
                      <h4 className="font-bold text-blue-900 mb-2">投資アイデアの発見</h4>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        見落としていた優良銘柄や、新たな投資機会を発見できます。
                        幅広い業種の代表銘柄を網羅的に分析しています。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">⏱️</span>
                    <div>
                      <h4 className="font-bold text-amber-900 mb-2">時間の節約</h4>
                      <p className="text-sm text-amber-800 leading-relaxed">
                        個別に企業の財務諸表や市場動向を調べる手間が省けます。
                        AIが短時間で複数銘柄の分析結果を提示します。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">📚</span>
                    <div>
                      <h4 className="font-bold text-purple-900 mb-2">投資の学習ツール</h4>
                      <p className="text-sm text-purple-800 leading-relaxed">
                        PER、PBR、ROEなどの財務指標の見方や、AIの分析理由から
                        投資の考え方を学べます。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 使い方 */}
            <section>
              <h3 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                <span className="text-xl">📖</span>
                使い方
              </h3>
              <div className="bg-surface-50 rounded-xl p-5 border border-surface-200">
                <ol className="space-y-3 text-surface-700">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white text-sm font-bold flex items-center justify-center">1</span>
                    <span className="leading-relaxed"><span className="font-semibold">フィルター機能</span>で「買い」「売り」「様子見」から興味のあるカテゴリを選択</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white text-sm font-bold flex items-center justify-center">2</span>
                    <span className="leading-relaxed">気になる銘柄のカードをクリックして<span className="font-semibold">詳細分析</span>を確認</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white text-sm font-bold flex items-center justify-center">3</span>
                    <span className="leading-relaxed">AIの分析理由、財務指標、株価チャートを参考に、<span className="font-semibold">ご自身で最終判断</span></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white text-sm font-bold flex items-center justify-center">4</span>
                    <span className="leading-relaxed">はてなアイコン（<svg className="inline w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>）で<span className="font-semibold">財務指標の意味</span>を学習</span>
                  </li>
                </ol>
              </div>
            </section>

            {/* 重要な注意事項 */}
            <section className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 border-2 border-red-200">
              <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                重要な注意事項
              </h3>
              <ul className="space-y-2 text-red-900 text-sm">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">⚠️</span>
                  <span className="leading-relaxed"><span className="font-bold">投資判断の参考情報</span>として活用してください。最終的な投資判断は必ずご自身で行ってください。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">⚠️</span>
                  <span className="leading-relaxed"><span className="font-bold">損失リスク</span>があります。投資は元本保証ではなく、損失が発生する可能性があります。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">⚠️</span>
                  <span className="leading-relaxed">AIの分析には<span className="font-bold">限界</span>があります。予期せぬ市場変動や企業の突発的な出来事には対応できません。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">⚠️</span>
                  <span className="leading-relaxed">複数の情報源を参考にし、<span className="font-bold">分散投資</span>を心がけてください。</span>
                </li>
              </ul>
            </section>

            {/* 費用について */}
            <section className="bg-surface-50 rounded-xl p-5 border border-surface-200">
              <h3 className="text-lg font-bold text-surface-900 mb-3 flex items-center gap-2">
                <span className="text-xl">💰</span>
                費用について
              </h3>
              <p className="text-surface-700 leading-relaxed">
                現在はベータ版として<span className="font-bold text-primary-600">無料</span>でご利用いただけます。
                将来的に有料化する可能性がありますが、その際は事前にお知らせします。
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-surface-50 border-t border-surface-100 px-6 py-4 flex justify-end sticky bottom-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
