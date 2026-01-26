'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* ハンバーガーボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-lg text-surface-700 hover:bg-surface-100 transition-colors"
        aria-label="メニュー"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* メニューオーバーレイ */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={closeMenu} />}

      {/* メニューパネル */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-4 border-b border-surface-200">
            <h2 className="text-lg font-bold text-surface-900">メニュー</h2>
            <button
              onClick={closeMenu}
              className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
              aria-label="閉じる"
            >
              <svg
                className="w-5 h-5 text-surface-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* メニュー項目 */}
          <nav className="flex-1 p-4 space-y-2">
            {/* ユーザー情報（ログイン済みの場合） */}
            {session?.user && (
              <div className="mb-4 p-3 bg-surface-50 rounded-lg border border-surface-200">
                <div className="flex items-center gap-3">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-surface-500 truncate">{session.user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ログイン/ログアウト */}
            {session?.user ? (
              <button
                onClick={() => {
                  signOut({ callbackUrl: '/' });
                  closeMenu();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-surface-700 hover:bg-surface-100 transition-colors text-left"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="font-medium">ログアウト</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={closeMenu}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                <span className="font-medium">ログイン</span>
              </Link>
            )}

            {/* 設定 */}
            <Link
              href="/settings"
              onClick={closeMenu}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-surface-700 hover:bg-surface-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="font-medium">設定</span>
            </Link>

            {/* このサービスについて */}
            <Link
              href="/about"
              onClick={closeMenu}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-surface-700 hover:bg-surface-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">このサービスについて</span>
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
