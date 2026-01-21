/**
 * 寄付モーダルコンポーネント
 * リクエスト後にサービス運営への協力をお願いするモーダル
 */

import React, { useEffect } from 'react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 寄付モーダルコンポーネント
 */
export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
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
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💝</span>
            <h2 className="text-xl font-bold text-white font-display">サービス運営へのご協力</h2>
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
            {/* 感謝メッセージ */}
            <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
              <h3 className="text-lg font-bold text-surface-900 mb-3 flex items-center gap-2">
                <span className="text-xl">🙏</span>
                リクエストを受け付けました
              </h3>
              <p className="text-surface-700 leading-relaxed">
                銘柄分析のリクエストをありがとうございます。
                いただいたリクエストは、今後の分析対象銘柄の追加や優先順位の参考にさせていただきます。
              </p>
            </section>

            {/* サービス運営について */}
            <section>
              <h3 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                <span className="text-xl">💡</span>
                サービス運営について
              </h3>
              <div className="bg-surface-50 rounded-xl p-5 border border-surface-200 space-y-4">
                <p className="text-surface-700 leading-relaxed">
                  このサービスは、以下のコストをかけて運営されています：
                </p>
                <ul className="space-y-3 text-surface-700">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 text-xl">🤖</span>
                    <div>
                      <span className="font-semibold">AI分析コスト</span>
                      <p className="text-sm text-surface-600 mt-1">Claude APIを使用した高度な財務分析・市場動向分析</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 text-xl">📊</span>
                    <div>
                      <span className="font-semibold">データ取得コスト</span>
                      <p className="text-sm text-surface-600 mt-1">株価・財務データのリアルタイム取得と更新</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 text-xl">🖥️</span>
                    <div>
                      <span className="font-semibold">サーバー運営費</span>
                      <p className="text-sm text-surface-600 mt-1">安定したサービス提供のためのインフラ費用</p>
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            {/* 協力のお願い */}
            <section className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-5 border border-amber-200">
              <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
                <span className="text-xl">🎁</span>
                ご協力のお願い
              </h3>
              <p className="text-amber-900 leading-relaxed mb-3">
                サービスの継続的な運営と改善のため、もしよろしければご支援をいただけますと幸いです。
              </p>
              <p className="text-sm text-amber-800 leading-relaxed">
                ※ 任意のご協力です。ご支援いただかなくても引き続き無料でご利用いただけます。
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-surface-50 border-t border-surface-100 px-6 py-4 flex flex-col sm:flex-row gap-3 justify-end sticky bottom-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-surface-200 hover:bg-surface-300 text-surface-700 font-medium rounded-lg transition-colors"
          >
            後で
          </button>
          <a
            href="https://github.com/sponsors/koheikameyama"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium rounded-lg transition-all shadow-sm text-center"
            onClick={onClose}
          >
            <span className="flex items-center justify-center gap-2">
              <span>💝</span>
              <span>サービスを支援する</span>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};
