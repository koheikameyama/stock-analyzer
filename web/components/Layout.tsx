/**
 * レイアウトコンポーネント（初心者向けデザイン）
 */

'use client';

import React, { useState } from 'react';
import { AboutModal } from './AboutModal';
import { ShareButtons } from './ShareButtons';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    return (
        <div className="min-h-screen bg-gradient-to-br from-surface-50 via-blue-50/30 to-indigo-50/30 flex flex-col">
            {/* ヘッダー */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-surface-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                            <div className="w-10 h-10 flex items-center justify-center">
                                <img
                                    src="/images/logo.png"
                                    alt="Stock Analyzer"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div>
                                <span className="font-display font-bold text-xl text-surface-900 tracking-tight block">
                                    AI株式分析ツール
                                </span>
                                <span className="text-xs text-surface-400">
                                    初心者にも優しい投資サポート
                                </span>
                            </div>
                        </a>
                        <nav className="flex items-center gap-2 sm:gap-4">
                            <button
                                onClick={() => setIsAboutModalOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-100 hover:bg-surface-200 text-surface-700 hover:text-surface-900 rounded-lg text-sm font-medium transition-colors border border-surface-200"
                                aria-label="このサービスについて"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="hidden sm:inline">このサービスについて</span>
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {children}
            </main>

            {/* サービス説明モーダル */}
            <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />

            {/* フッター */}
            <footer className="bg-white/80 backdrop-blur-sm border-t border-surface-200 mt-auto">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg py-2 px-4 inline-flex">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">
                                このツールは投資判断の参考情報です。最終的な投資判断はご自身で行ってください
                            </span>
                        </div>

                        {/* フッターナビゲーション */}
                        <nav className="flex items-center justify-center gap-4 text-sm">
                            <a
                                href="/privacy-policy"
                                className="text-surface-700 hover:text-surface-900 transition-colors font-medium"
                            >
                                プライバシーポリシー
                            </a>
                            <span className="text-surface-400">|</span>
                            <a
                                href="/terms"
                                className="text-surface-700 hover:text-surface-900 transition-colors font-medium"
                            >
                                利用規約
                            </a>
                            <span className="text-surface-400">|</span>
                            <a
                                href="/releases"
                                className="text-surface-700 hover:text-surface-900 transition-colors font-medium"
                            >
                                リリースノート
                            </a>
                            <span className="text-surface-400">|</span>
                            <a
                                href="https://forms.gle/irNjkWEqAfvuVrip9"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-surface-700 hover:text-surface-900 transition-colors font-medium"
                            >
                                フィードバック
                            </a>
                            <span className="text-surface-400">|</span>
                            <a
                                href="https://x.com/stockAnalyzerJP"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-surface-700 hover:text-surface-900 transition-colors flex items-center gap-1 font-medium"
                            >
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                X (Twitter)
                            </a>
                        </nav>

                        {/* シェアボタン */}
                        <div className="flex justify-center">
                            <ShareButtons />
                        </div>

                        <p className="text-xs text-surface-400">
                            Powered by AI • Made with ❤️ for investors
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
