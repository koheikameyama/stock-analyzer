import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import OnboardingFlow from '@/components/OnboardingFlow';
import { LogoutButton } from '@/components/LogoutButton';

export default async function OnboardingPage() {
  const session = await auth();

  // 未ログインの場合はログインページへリダイレクト
  if (!session) {
    redirect('/login');
  }

  // 既にポートフォリオがある場合はダッシュボードへリダイレクト
  const portfolio = await prisma.portfolio.findUnique({
    where: { userId: session.user.id },
  });

  if (portfolio) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-blue-50/30 to-indigo-50/30">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-surface-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt="Stock Analyzer"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-surface-900">AI株式投資ツール</h1>
                <p className="text-xs text-surface-500">初回セットアップ</p>
              </div>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">投資を始めましょう！</h2>
          <p className="text-gray-600">AIがあなたに最適なポートフォリオを提案します</p>
        </div>

        <OnboardingFlow />
      </div>
    </div>
  );
}
