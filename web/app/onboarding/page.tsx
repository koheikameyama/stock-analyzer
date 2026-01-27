import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OnboardingFlow from '@/components/OnboardingFlow';

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">投資を始めましょう！</h1>
        <p className="text-gray-600">AIがあなたに最適なポートフォリオを提案します</p>
      </div>

      <OnboardingFlow />
    </div>
  );
}
