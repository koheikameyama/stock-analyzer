/**
 * AI株式投資ツール ランディングページ
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';

export default async function Home() {
  const session = await auth();

  // ログイン済みの場合はダッシュボードへリダイレクト
  if (session) {
    redirect('/dashboard');
  }

  // 未ログインの場合：ランディングページを表示
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* ヘッダー */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-surface-900">💹 AI株式投資ツール</h1>
          <Link
            href="/login"
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            ログイン
          </Link>
        </div>
      </header>

      {/* ヒーローセクション */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-surface-900 mb-6">
            AIがあなたの投資を
            <br />
            サポートします
          </h2>
          <p className="text-xl text-surface-600 mb-12">
            投資初心者でも安心。AIが銘柄を選定し、毎日分析してアクションを提案します。
          </p>

          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            無料で始める
          </Link>
        </div>

        {/* 機能紹介 */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-xl p-8 shadow-md border border-surface-200">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-surface-900 mb-3">AIポートフォリオ提案</h3>
            <p className="text-surface-600">
              投資予算に応じて、AIが最適な銘柄を選定。初心者でも安心して始められます。
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-md border border-surface-200">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-surface-900 mb-3">毎日AI分析</h3>
            <p className="text-surface-600">
              保有銘柄を毎日分析。買い時・売り時をAIが判断してアクションを提案します。
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-md border border-surface-200">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-surface-900 mb-3">わかりやすいダッシュボード</h3>
            <p className="text-surface-600">
              ポートフォリオの状況を一目で確認。損益やAIの推奨アクションがすぐわかります。
            </p>
          </div>
        </div>

        {/* 使い方の流れ */}
        <div className="mt-20 bg-white rounded-xl p-12 shadow-md border border-surface-200">
          <h3 className="text-3xl font-bold text-surface-900 text-center mb-12">
            使い方はシンプル
          </h3>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                1
              </div>
              <h4 className="font-bold text-surface-900 mb-2">予算を入力</h4>
              <p className="text-sm text-surface-600">いくらから投資を始めるか入力</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                2
              </div>
              <h4 className="font-bold text-surface-900 mb-2">AIが銘柄提案</h4>
              <p className="text-sm text-surface-600">予算に合わせて最適な銘柄を選定</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                3
              </div>
              <h4 className="font-bold text-surface-900 mb-2">証券会社で購入</h4>
              <p className="text-sm text-surface-600">楽天証券などで実際に購入</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                4
              </div>
              <h4 className="font-bold text-surface-900 mb-2">毎日チェック</h4>
              <p className="text-sm text-surface-600">AIが分析結果を毎日お届け</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <p className="text-lg text-surface-600 mb-6">
            今すぐ始めて、AIと一緒に投資を学びましょう
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            無料で始める
          </Link>
        </div>
      </main>

      {/* フッター */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t border-surface-200">
        <p className="text-center text-sm text-surface-500">
          ※ 投資判断は自己責任でお願いします。AIの分析は参考情報です。
        </p>
      </footer>
    </div>
  );
}
