/**
 * GET /api/analysis-requests
 * 分析リクエストランキングを取得
 *
 * POST /api/analysis-requests
 * 分析リクエストを作成・カウントアップ
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // リクエスト数順にトップ50を取得
    const requests = await prisma.analysisRequest.findMany({
      take: 50,
      orderBy: {
        requestCount: 'desc',
      },
      include: {
        stock: {
          select: {
            id: true,
            ticker: true,
            name: true,
            sector: true,
            marketCap: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error('分析リクエスト取得エラー:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'リクエストの取得に失敗しました',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stockId } = body;

    // バリデーション
    if (!stockId || typeof stockId !== 'string') {
      return NextResponse.json(
        { success: false, message: 'stockId が必要です' },
        { status: 400 }
      );
    }

    // 銘柄の存在確認
    const stock = await prisma.stock.findUnique({
      where: { id: stockId },
    });

    if (!stock) {
      return NextResponse.json(
        { success: false, message: '銘柄が見つかりません' },
        { status: 404 }
      );
    }

    // リクエストの作成または更新
    const analysisRequest = await prisma.analysisRequest.upsert({
      where: { stockId },
      create: {
        stockId,
        requestCount: 1,
      },
      update: {
        requestCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        requestCount: analysisRequest.requestCount,
      },
    });
  } catch (error) {
    console.error('分析リクエストの作成エラー:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'リクエストの作成に失敗しました',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
