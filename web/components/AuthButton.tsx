'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';

interface AuthButtonProps {
  session: any;
}

export function AuthButton({ session }: AuthButtonProps) {
  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {/* ユーザー情報（PC/タブレットのみ） */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface-100 rounded-lg border border-surface-200">
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="w-6 h-6 rounded-full"
            />
          )}
          <span className="text-sm font-medium text-surface-700">{session.user.name}</span>
        </div>

        {/* ユーザーアイコン（スマホのみ） */}
        {session.user.image && (
          <div className="md:hidden w-8 h-8 rounded-full overflow-hidden border-2 border-surface-200">
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* ログアウトボタン */}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors bg-surface-100 hover:bg-surface-200 text-surface-700 hover:text-surface-900 border border-surface-200"
        >
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="hidden sm:inline">ログアウト</span>
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="flex items-center gap-1 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors bg-primary-600 hover:bg-primary-700 text-white whitespace-nowrap"
    >
      <svg
        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
        />
      </svg>
      <span className="hidden sm:inline">ログイン</span>
    </Link>
  );
}
