/**
 * レイアウトコンポーネント（初心者向けデザイン）
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AboutModal } from './AboutModal';
import { ShareButtons } from './ShareButtons';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    return (
        <div className="min-h-screen bg-gradient-to-br from-surface-50 via-blue-50/30 to-indigo-50/30 flex flex-col">
            {/* ヘッダー */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-surface-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                                <img
                                    src="/images/logo.png"
                                    alt="Stock Analyzer"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div>
                                <span className="font-display font-bold text-base sm:text-xl text-surface-900 tracking-tight block">
                                    AI株式分析ツール
                                </span>
                                <span className="text-xs text-surface-400 hidden sm:block">
                                    初心者にも優しい投資サポート
                                </span>
                            </div>
                        </Link>
                        <div className="flex items-center gap-2">
                            {/* デスクトップナビゲーション */}
                            <nav className="hidden lg:flex items-center gap-2">
                                <Link
                                    href="/"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        pathname === '/'
                                            ? 'bg-primary-600 text-white'
                                            : 'hover:bg-surface-100 text-surface-700 hover:text-surface-900'
                                    }`}
                                >
                                    <span>AI分析</span>
                                </Link>
                                <Link
                                    href="/stocks"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        pathname === '/stocks'
                                            ? 'bg-primary-600 text-white'
                                            : 'hover:bg-surface-100 text-surface-700 hover:text-surface-900'
                                    }`}
                                >
                                    <span>銘柄を探す</span>
                                </Link>
                                <Link
                                    href="/settings"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-surface-200 ${
                                        pathname === '/settings'
                                            ? 'bg-primary-600 text-white border-primary-600'
                                            : 'bg-surface-100 hover:bg-surface-200 text-surface-700 hover:text-surface-900'
                                    }`}
                                    aria-label="設定"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="hidden lg:inline">設定</span>
                                </Link>
                                <button
                                    onClick={() => setIsAboutModalOpen(true)}
                                    className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-surface-100 text-surface-600 hover:text-surface-900 transition-colors"
                                    aria-label="このサービスについて"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </button>
                            </nav>

                            {/* モバイルハンバーガーメニュー */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-surface-100 transition-colors"
                                aria-label="メニュー"
                            >
                                {isMobileMenuOpen ? (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* モバイルメニュー展開 */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden border-t border-surface-200 bg-white">
                        <nav className="max-w-7xl mx-auto px-4 py-4 space-y-2">
                            <Link
                                href="/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                    pathname === '/'
                                        ? 'bg-primary-600 text-white'
                                        : 'hover:bg-surface-100 text-surface-700'
                                }`}
                            >
                                <span>AI分析</span>
                            </Link>
                            <Link
                                href="/stocks"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                    pathname === '/stocks'
                                        ? 'bg-primary-600 text-white'
                                        : 'hover:bg-surface-100 text-surface-700'
                                }`}
                            >
                                <span>銘柄を探す</span>
                            </Link>
                            <Link
                                href="/settings"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                    pathname === '/settings'
                                        ? 'bg-primary-600 text-white'
                                        : 'hover:bg-surface-100 text-surface-700'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>設定</span>
                            </Link>
                        </nav>
                    </div>
                )}
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
                        <div className="max-w-2xl mx-auto">
                            <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg py-3 px-4">
                                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div className="text-xs sm:text-sm">
                                    <p className="font-semibold mb-1">免責事項</p>
                                    <p className="text-amber-700 leading-relaxed">
                                        本サービスは投資判断の参考情報として提供するものであり、投資助言や勧誘を目的としたものではありません。
                                        株式投資にはリスクが伴い、投資元本を割り込む可能性があります。
                                        投資に関する最終判断は、ご自身の責任において行ってください。
                                        本サービスの利用により生じたいかなる損害についても、当方は一切の責任を負いかねます。
                                        <a href="/disclaimer" className="inline-block ml-2 underline hover:text-amber-900 font-semibold">
                                            詳細を見る →
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* フッターナビゲーション */}
                        <nav className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-sm">
                            <a
                                href="/disclaimer"
                                className="text-surface-700 hover:text-surface-900 transition-colors font-medium whitespace-nowrap"
                            >
                                免責事項
                            </a>
                            <span className="text-surface-400 hidden sm:inline">|</span>
                            <a
                                href="/privacy-policy"
                                className="text-surface-700 hover:text-surface-900 transition-colors font-medium whitespace-nowrap"
                            >
                                プライバシーポリシー
                            </a>
                            <span className="text-surface-400 hidden sm:inline">|</span>
                            <a
                                href="/terms"
                                className="text-surface-700 hover:text-surface-900 transition-colors font-medium whitespace-nowrap"
                            >
                                利用規約
                            </a>
                            <span className="text-surface-400 hidden sm:inline">|</span>
                            <a
                                href="/releases"
                                className="text-surface-700 hover:text-surface-900 transition-colors font-medium whitespace-nowrap"
                            >
                                リリースノート
                            </a>
                            <span className="text-surface-400 hidden sm:inline">|</span>
                            <a
                                href="https://forms.gle/irNjkWEqAfvuVrip9"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-surface-700 hover:text-surface-900 transition-colors font-medium whitespace-nowrap"
                            >
                                フィードバック
                            </a>
                            <span className="text-surface-400 hidden sm:inline">|</span>
                            <a
                                href="https://x.com/stockAnalyzerJP"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-surface-700 hover:text-surface-900 transition-colors flex items-center gap-1 font-medium whitespace-nowrap"
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
