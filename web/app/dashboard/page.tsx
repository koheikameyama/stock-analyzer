import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import PortfolioSummary from '@/components/PortfolioSummary';
import HoldingsList from '@/components/HoldingsList';
import ActionProposals from '@/components/ActionProposals';
import { LogoutButton } from '@/components/LogoutButton';

export default async function DashboardPage() {
  const session = await auth();

  // 未ログインの場合はログインページへリダイレクト
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-blue-50/30 to-indigo-50/30">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-surface-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt="Stock Analyzer"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-surface-900">AI株式投資ツール</h1>
                <p className="text-xs text-surface-500">ダッシュボード</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              {session?.user && (
                <div className="hidden sm:flex items-center gap-3">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm text-surface-700">{session.user.name}</span>
                </div>
              )}
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h2 className="text-3xl font-bold mb-8">ポートフォリオダッシュボード</h2>

        {/* アクション提案エリア */}
        <ActionProposals />

        {/* ポートフォリオサマリー */}
        <PortfolioSummary />

        {/* 保有銘柄一覧 */}
        <HoldingsList />
      </div>
    </div>
  );
}
