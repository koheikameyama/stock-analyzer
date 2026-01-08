/**
 * レイアウトコンポーネント（初心者向けデザイン）
 */

import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-surface-50 via-blue-50/30 to-indigo-50/30 flex flex-col">
            {/* ヘッダー */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-surface-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-md">
                                <span className="text-xl">📊</span>
                            </div>
                            <div>
                                <span className="font-display font-bold text-xl text-surface-900 tracking-tight block">
                                    AI株式分析ツール
                                </span>
                                <span className="text-xs text-surface-400">
                                    初心者にも優しい投資サポート
                                </span>
                            </div>
                        </div>
                        <nav className="flex items-center gap-4">
                            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                🚀 Beta版
                            </div>
                        </nav>
                    </div>
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {children}
            </main>

            {/* フッター */}
            <footer className="bg-white/80 backdrop-blur-sm border-t border-surface-200 mt-auto">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg py-2 px-4 inline-flex">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">
                                このツールは投資判断の参考情報です。最終的な投資判断はご自身で行ってください
                            </span>
                        </div>
                        <p className="text-xs text-surface-400">
                            Powered by OpenAI GPT-4o mini • Made with ❤️ for investors
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
