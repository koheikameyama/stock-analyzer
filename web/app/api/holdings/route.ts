import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 購入記録のリクエスト型
interface CreateHoldingRequest {
  stockId: string;
  shares: number; // 購入株数
  purchasePrice: number; // 購入単価
  purchaseDate: string; // 購入日（ISO形式）
  investmentBudget?: number; // ポートフォリオ未作成時に必要
}

// 購入記録のレスポンス型
interface HoldingResponse {
  id: string;
  stockId: string;
  ticker: string;
  name: string;
  shares: number;
  purchasePrice: number;
  purchaseDate: string;
  estimatedCost: number;
}

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // リクエストボディを取得
    const body: CreateHoldingRequest = await request.json();
    const { stockId, shares, purchasePrice, purchaseDate, investmentBudget } = body;

    // バリデーション
    if (!stockId || !shares || !purchasePrice || !purchaseDate) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
    }

    if (shares <= 0 || purchasePrice <= 0) {
      return NextResponse.json(
        { error: '株数と購入単価は正の数値を指定してください' },
        { status: 400 }
      );
    }

    // 株が存在するか確認
    const stock = await prisma.stock.findUnique({
      where: { id: stockId },
    });

    if (!stock) {
      return NextResponse.json({ error: '銘柄が見つかりません' }, { status: 404 });
    }

    // ポートフォリオを取得または作成
    let portfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id },
    });

    if (!portfolio) {
      // ポートフォリオが未作成の場合
      if (!investmentBudget || investmentBudget < 10000) {
        return NextResponse.json(
          { error: 'ポートフォリオ未作成の場合、投資予算（10,000円以上）が必要です' },
          { status: 400 }
        );
      }

      // ポートフォリオを作成
      portfolio = await prisma.portfolio.create({
        data: {
          userId: session.user.id,
          investmentBudget,
        },
      });
    }

    // 購入記録を作成
    const holding = await prisma.holding.create({
      data: {
        portfolioId: portfolio.id,
        stockId,
        shares,
        purchasePrice,
        purchaseDate: new Date(purchaseDate),
      },
      include: {
        stock: true,
      },
    });

    const response: HoldingResponse = {
      id: holding.id,
      stockId: holding.stockId,
      ticker: holding.stock.ticker,
      name: holding.stock.name,
      shares: holding.shares,
      purchasePrice: Number(holding.purchasePrice),
      purchaseDate: holding.purchaseDate.toISOString(),
      estimatedCost: holding.shares * Number(holding.purchasePrice),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('購入記録エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

// 保有銘柄一覧を取得
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // ポートフォリオを取得
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id },
      include: {
        holdings: {
          where: {
            soldDate: null, // 保有中のみ
          },
          include: {
            stock: true,
          },
          orderBy: {
            purchaseDate: 'desc',
          },
        },
      },
    });

    if (!portfolio) {
      return NextResponse.json({ holdings: [] });
    }

    // レスポンスを整形
    const holdings: HoldingResponse[] = portfolio.holdings.map(holding => ({
      id: holding.id,
      stockId: holding.stockId,
      ticker: holding.stock.ticker,
      name: holding.stock.name,
      shares: holding.shares,
      purchasePrice: Number(holding.purchasePrice),
      purchaseDate: holding.purchaseDate.toISOString(),
      estimatedCost: holding.shares * Number(holding.purchasePrice),
    }));

    return NextResponse.json({
      investmentBudget: portfolio.investmentBudget,
      holdings,
    });
  } catch (error) {
    console.error('保有銘柄取得エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
