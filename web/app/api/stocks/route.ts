/**
 * GET /api/stocks
 * 全銘柄の一覧を取得
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // クエリパラメータ
    const market = searchParams.get('market') || 'JP'; // デフォルトは日本株
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const sector = searchParams.get('sector') || '';
    const hasAnalysis = searchParams.get('hasAnalysis'); // 'true' or 'false' or null
    const isAiTarget = searchParams.get('isAiTarget'); // 'true' or 'false' or null

    // バリデーション
    if (page < 1) {
      return NextResponse.json(
        { success: false, message: 'page は1以上である必要があります' },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          success: false,
          message: 'limit は1以上100以下である必要があります',
        },
        { status: 400 }
      );
    }

    // フィルター条件を構築
    const where: any = {
      market,
    };

    // 検索条件（銘柄名またはティッカー）
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { ticker: { contains: search } },
      ];
    }

    // セクターフィルター
    if (sector) {
      where.sector = sector;
    }

    // 分析結果の有無でフィルター
    if (hasAnalysis === 'true') {
      where.analyses = { some: {} };
    } else if (hasAnalysis === 'false') {
      where.analyses = { none: {} };
    }

    // AI分析対象でフィルター
    if (isAiTarget === 'true') {
      where.isAiAnalysisTarget = true;
    }

    // 総件数を取得
    const totalCount = await prisma.stock.count({ where });

    // ページネーション計算
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalCount / limit);

    // データ取得（分析結果がある銘柄を優先）
    const stocks = await prisma.stock.findMany({
      where,
      include: {
        analyses: {
          orderBy: { analysisDate: 'desc' },
          take: 1, // 最新の分析結果のみ
        },
        analysisRequest: true, // リクエスト情報を含める
      },
      skip,
      take: limit,
    });

    // クライアント側でソート（分析結果がある銘柄を優先）
    const sortedStocks = stocks.sort((a, b) => {
      // 1. 分析結果の有無で優先
      const aHasAnalysis = a.analyses.length > 0 ? 1 : 0;
      const bHasAnalysis = b.analyses.length > 0 ? 1 : 0;
      if (aHasAnalysis !== bHasAnalysis) {
        return bHasAnalysis - aHasAnalysis;
      }

      // 2. AI分析対象を優先
      if (a.isAiAnalysisTarget !== b.isAiAnalysisTarget) {
        return a.isAiAnalysisTarget ? -1 : 1;
      }

      // 3. ティッカー順
      return a.ticker.localeCompare(b.ticker);
    });

    // レスポンスデータを整形
    const formattedStocks = sortedStocks.map((stock) => ({
      id: stock.id,
      ticker: stock.ticker,
      name: stock.name,
      market: stock.market,
      sector: stock.sector,
      industry: stock.industry,
      isAiAnalysisTarget: stock.isAiAnalysisTarget,
      marketCap: stock.marketCap,
      latestAnalysis: stock.analyses[0] || null,
      requestCount: stock.analysisRequest?.requestCount || 0,
      createdAt: stock.createdAt,
      updatedAt: stock.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        stocks: formattedStocks,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('銘柄一覧の取得エラー:', error);
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
