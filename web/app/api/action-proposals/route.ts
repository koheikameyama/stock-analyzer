import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // アクション提案を取得（未読のみ、最新順）
    const proposals = await prisma.actionProposal.findMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      include: {
        stock: {
          select: {
            ticker: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // 最新10件
    });

    return NextResponse.json(proposals);
  } catch (error) {
    console.error('アクション提案取得エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
