import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import PortfolioSummary from '@/components/PortfolioSummary';
import HoldingsList from '@/components/HoldingsList';
import ActionProposals from '@/components/ActionProposals';

export default async function DashboardPage() {
  const session = await auth();

  // 未ログインの場合はログインページへリダイレクト
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">ポートフォリオダッシュボード</h1>

      {/* アクション提案エリア */}
      <ActionProposals />

      {/* ポートフォリオサマリー */}
      <PortfolioSummary />

      {/* 保有銘柄一覧 */}
      <HoldingsList />
    </div>
  );
}
