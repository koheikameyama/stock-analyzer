/**
 * GET /api/stocks/sectors
 * 業種の一覧を取得
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // 重複を除いて業種を取得
    const sectors = await prisma.stock.findMany({
      where: {
        sector: { not: null },
      },
      select: {
        sector: true,
      },
      distinct: ['sector'],
      orderBy: {
        sector: 'asc',
      },
    });

    // sector のみの配列に変換
    const sectorList = sectors
      .map((s) => s.sector)
      .filter((s): s is string => s !== null);

    return NextResponse.json({
      success: true,
      data: {
        sectors: sectorList,
      },
    });
  } catch (error) {
    console.error('業種一覧の取得エラー:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'データ取得に失敗しました',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
